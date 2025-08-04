# Customer Order Dashboard API

This is a backend service for managing customer orders. It provides API endpoints to retrieve customer details, their associated orders, and basic statistics. This project is built with **Node.js**, **Express**, and **SQLite**.

---

## 📌 Features

- **Get all customers**: Returns a list of customers with their names and order count.
- **Get specific customer details**: Returns detailed information about a specific customer, including their order count.
- **Get orders for a customer**: Fetches all orders placed by a specific customer.
- **Get specific order details**: Fetches details of a specific order for a given customer.

---

## 🛠 Technologies Used

- **Node.js** – Server-side runtime environment.
- **Express** – Web framework for building the API.
- **SQLite** – Lightweight relational database used to store customer and order data.
- **better-sqlite3** – SQLite client for Node.js, providing synchronous access to the database.
- **CORS** – Cross-origin resource sharing middleware for enabling requests from the frontend.

---

## ⚙️ Project Setup

### ✅ Prerequisites

Make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (or **yarn**)

---

### 📥 Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/customer-order-dashboard.git

# 2. Navigate to the project directory
cd customer-order-dashboard

# 3. Install dependencies
npm install
```

---

### 🚀 Running the Application

```bash
# Start the server
npm start

# OR with nodemon for auto-reloading
npm run dev
```

The server will run on **[http://localhost:3001](http://localhost:3001)**.

---

## 📡 API Endpoints

| Method | Endpoint                         | Description                                                                   |
| ------ | -------------------------------- | ----------------------------------------------------------------------------- |
| GET    | `/customers`                     | Returns a list of all customers, including their names and order count        |
| GET    | `/customers/:id`                 | Returns detailed information about a specific customer, including order count |
| GET    | `/customers/:id/orders`          | Returns all orders for a specific customer                                    |
| GET    | `/customers/:id/orders/:orderId` | Returns details for a specific order of a customer                            |

---

## 🧪 Example Usage

**1. Get all customers**

```bash
curl http://localhost:3001/customers
```

**2. Get details for a specific customer**

```bash
curl http://localhost:3001/customers/1
```

**3. Get all orders for a specific customer**

```bash
curl http://localhost:3001/customers/1/orders
```

**4. Get a specific order's details**

```bash
curl http://localhost:3001/customers/1/orders/101
```

