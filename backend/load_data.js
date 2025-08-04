const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const db = new Database('app.db');

function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8').trim();
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 1) throw new Error('Empty CSV: ' + filePath);
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    // naive split (assumes no embedded commas with quotes)
    return line.split(',').map(v => v.trim());
  });
  return { headers, rows };
}

function inferType(values) {
  let isInt = true;
  let isReal = true;
  for (const v of values) {
    if (v === '') continue; // allow empty
    if (!/^-?\d+$/.test(v)) isInt = false;
    if (!/^-?\d+(\.\d+)?$/.test(v)) isReal = false;
  }
  if (isInt) return 'INTEGER';
  if (isReal) return 'REAL';
  return 'TEXT';
}

function createTable(tableName, headers, rows) {
  // sample up to first 100 rows for inference
  const sample = rows.slice(0, 100);
  const types = headers.map((h, idx) => {
    const colVals = sample.map(r => r[idx] || '');
    return inferType(colVals);
  });

  const columns = headers.map((h, i) => {
    const safeName = h.replace(/\s+/g, '_').toLowerCase();
    // If header is 'id', make it PRIMARY KEY
    if (safeName === 'id') return `${safeName} ${types[i]} PRIMARY KEY`;
    return `${safeName} ${types[i]}`;
  });

  const drop = `DROP TABLE IF EXISTS ${tableName};`;
  db.exec(drop);
  const createSQL = `CREATE TABLE ${tableName} (${columns.join(', ')});`;
  db.exec(createSQL);
  return headers.map(h => h.replace(/\s+/g, '_').toLowerCase());
}

function loadData(tableName, normalizedHeaders, rows) {
  const placeholders = normalizedHeaders.map(() => '?').join(',');
  const insertSQL = `INSERT OR IGNORE INTO ${tableName} (${normalizedHeaders.join(',')}) VALUES (${placeholders})`;
  const stmt = db.prepare(insertSQL);
  const txn = db.transaction((allRows) => {
    for (const r of allRows) {
      const vals = r.map(v => (v === '' ? null : v));
      stmt.run(...vals);
    }
  });
  txn(rows);
}

function verify(tableName) {
  const countRow = db.prepare(`SELECT COUNT(*) as c FROM ${tableName}`).get();
  console.log(`\n[${tableName}] total rows:`, countRow.c);
  const sample = db.prepare(`SELECT * FROM ${tableName} LIMIT 5`).all();
  console.log(`[${tableName}] sample:`);
  console.table(sample);
}

function main() {
  try {
    // users
    const usersCSV = path.join(__dirname, 'data/users.csv');
    const ordersCSV = path.join(__dirname, 'data/orders.csv');

    const { headers: uh, rows: ur } = parseCSV(usersCSV);
    const normalizedUserHeaders = createTable('users', uh, ur);
    loadData('users', normalizedUserHeaders, ur);
    verify('users');

    const { headers: oh, rows: orr } = parseCSV(ordersCSV);
    const normalizedOrderHeaders = createTable('orders', oh, orr);
    loadData('orders', normalizedOrderHeaders, orr);
    verify('orders');

    console.log('\n✅ All done: tables created, data loaded, verification complete.');
  } catch (e) {
    console.error('Fatal error:', e.message);
    process.exit(1);
  }
}

main();
