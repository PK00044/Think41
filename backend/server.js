const express = require('express');
const Database = require('better-sqlite3');
const db = new Database('app.db')
const app = express();


app.use((req, res, next) => {
    console.log('REQ', req.method, req.url);
    next();
});

app.get('/customers', (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10);


    const customers = db.prepare('SELECT * FROM users LIMIT 10').all();
    res.json(customers);
});

app.get('/customers/:id', async (req, res) => {
    const id = req.params.id;

        
    const customer = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    if (!customer)
        return res.status(404).send('Customer not found');
    
    // const cols = db.prepare('PRAGMA table_info(orders)').all().map(c => c.name.tolowerCase());

    // const fk = cols.includes('user_id') ? 'user_id' : 'customer_id';

    // const countRow = await db.prepare(`SELECT COUNT(*) as count FROM orders WHERE ${fk} = ?`).get(id);

    const orderCountRow = db.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?').get(id);
    res.json({ ...customer, orderCount:orderCountRow ? orderCountRow.count : 0 });
});


app.listen(3001, ()=>
    console.log('Server is running on port 3001')
);
