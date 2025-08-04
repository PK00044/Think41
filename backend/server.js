const express = require("express");
const Database = require("better-sqlite3");
const db = new Database("app.db");
const app = express();

// Middleware for CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// ✅ Get all customers with full name & orderCount
app.get("/customers", (req, res) => {
  try {
    const customers = db
      .prepare(`
        SELECT 
          u.id, 
          u.first_name || ' ' || u.last_name AS name, 
          u.email,
          COUNT(o.order_id) AS order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id
      `)
      .all();

    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get specific customer details including orderCount
app.get("/customers/:id", (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = db
      .prepare(`
        SELECT 
          u.id, 
          u.first_name, 
          u.last_name, 
          u.email,
          COUNT(o.order_id) AS orderCount
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.id = ?
      `)
      .get(customerId);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err) {
    console.error("Error fetching customer:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all orders for a specific customer
app.get("/customers/:id/orders", (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = db.prepare("SELECT * FROM users WHERE id = ?").get(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const orders = db.prepare("SELECT * FROM orders WHERE user_id = ?").all(customerId);
    res.json({ customer_id: customerId, orders });
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get specific order details
app.get("/customers/:id/orders/:orderId", (req, res) => {
  const customerId = req.params.id;
  const orderId = req.params.orderId;
  try {
    const customer = db.prepare("SELECT * FROM users WHERE id = ?").get(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const order = db
      .prepare("SELECT * FROM orders WHERE user_id = ? AND order_id = ?")
      .get(customerId, orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ customer_id: customerId, order });
  } catch (err) {
    console.error("Error fetching order details:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Start server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
