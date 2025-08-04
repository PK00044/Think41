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

    const orderCountRow = db.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?').get(id);
    res.json({ ...customer, orderCount:orderCountRow ? orderCountRow.count : 0 });
});

// Get all orders for a specific customer
app.get('/customers/:id/orders', (req, res) => {
    const customerId = req.params.id;

    const customer = db.prepare('SELECT * FROM users WHERE id = ?').get(customerId);
    if (!customer)
        return res.status(404).send('Customer not found');

    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(customerId);
    res.json({customer_id: customerId, orders: orders});
});

// Get specific order details
app.get('/customers/:id/orders/:orderId', (req, res) => {
    const customerId = req.params.id;
    const orderId = req.params.orderId;

    const customer = db.prepare('SELECT * FROM users WHERE id = ?').get(customerId);
    if (!customer)
        return res.status(404).send('Customer not found');

    

    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, customerId);
    if (!order)
        return res.status(404).send('Order not found');

    res.json({customer_id: customerId, order});
});


app.listen(3001, ()=>
    console.log('Server is running on port 3001')
);
