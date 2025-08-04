const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const db = new Database('app.db');

// helper to create table from CSV header
function createTableFromCSV(relPath, tableName, pkField = 'id') {
  const full = path.join(__dirname, relPath);
  const content = fs.readFileSync(full, 'utf-8').trim();
  const lines = content.split('\n');
  if (lines.length < 1) throw new Error(`${relPath} is empty or missing`);
  const headers = lines[0].split(',').map(h => h.trim());
  const cols = headers.map(h => {
    if (h === pkField) return `${h} INTEGER PRIMARY KEY`;
    return `${h} TEXT`;
  });
  const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${cols.join(', ')});`;
  db.exec(sql);
  return { headers, dataLines: lines.slice(1) };
}

// generic loader
function loadCSV(tableName, headers, dataLines) {
  const placeholders = headers.map(() => '?').join(',');
  const insertSQL = `INSERT OR IGNORE INTO ${tableName} (${headers.join(',')}) VALUES (${placeholders})`;
  const stmt = db.prepare(insertSQL);
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      const values = row.split(',').map(v => v.trim());
      stmt.run(...values);
    }
  });
  insertMany(dataLines);
}

// main
try {
  // ensure data folder exists and files are there
  const users = createTableFromCSV('data/users.csv', 'users', 'id');
  loadCSV('users', users.headers, users.dataLines);

  const orders = createTableFromCSV('data/orders.csv', 'orders', 'id');
  loadCSV('orders', orders.headers, orders.dataLines);

  console.log('✅ Loaded users and orders');

  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const orderCount = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  console.log(`Users count: ${userCount}`);
  console.log(`Orders count: ${orderCount}`);

  console.log('\nSample users (first 5):');
  console.table(db.prepare('SELECT * FROM users LIMIT 5').all());

  console.log('\nSample orders (first 5):');
  console.table(db.prepare('SELECT * FROM orders LIMIT 5').all());
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
