# MiniStore Database Schema

## 📋 Overview

MiniStore uses **Turso SQLite** for data persistence. The database includes 4 main tables with relationships for managing users, products, orders, and transactions.

---

## 🗄️ Tables

### 1. Users Table
Stores authentication and user information.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Columns:**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, auto-increment |
| username | TEXT | Unique, for login |
| password | TEXT | Bcrypt hashed |
| role | TEXT | 'admin' or 'user' |
| created_at | DATETIME | Account creation timestamp |
| updated_at | DATETIME | Last update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_username ON users(username);
```

**Example Data:**
```json
{
  "id": 1,
  "username": "operator",
  "password": "$2a$10$...",
  "role": "admin",
  "created_at": "2024-06-30T10:00:00Z",
  "updated_at": "2024-06-30T10:00:00Z"
}
```

---

### 2. Products Table
Stores product information and inventory.

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  stock INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Columns:**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| name | TEXT | Product name |
| price | REAL | Product price in USD |
| description | TEXT | Detailed description |
| stock | INTEGER | Available quantity |
| category | TEXT | Product category |
| image_url | TEXT | Product image URL |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
```

**Example Data:**
```json
{
  "id": 1,
  "name": "Laptop Pro 15",
  "price": 1299.99,
  "description": "High-performance laptop for development",
  "stock": 10,
  "category": "Computers",
  "image_url": "https://example.com/laptop.jpg",
  "created_at": "2024-06-30T10:00:00Z",
  "updated_at": "2024-06-30T10:00:00Z"
}
```

---

### 3. Orders Table
Stores order header information.

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_price REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

**Columns:**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users |
| total_price | REAL | Order total in USD |
| status | TEXT | 'pending', 'processing', 'completed', 'cancelled' |
| created_at | DATETIME | Order creation timestamp |
| updated_at | DATETIME | Last update timestamp |

**Status Values:**
- `pending` - Order received, awaiting processing
- `processing` - Order is being prepared
- `completed` - Order fulfilled
- `cancelled` - Order cancelled by user or system

**Indexes:**
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

**Example Data:**
```json
{
  "id": 1,
  "user_id": 2,
  "total_price": 99.98,
  "status": "completed",
  "created_at": "2024-06-30T11:00:00Z",
  "updated_at": "2024-06-30T11:15:00Z"
}
```

---

### 4. Order Items Table
Stores individual items in each order (order line items).

```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
)
```

**Columns:**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| order_id | INTEGER | Foreign key to orders |
| product_id | INTEGER | Foreign key to products |
| quantity | INTEGER | Number of units ordered |
| price | REAL | Unit price at time of order |
| created_at | DATETIME | Item creation timestamp |

**Indexes:**
```sql
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

**Example Data:**
```json
{
  "id": 1,
  "order_id": 1,
  "product_id": 2,
  "quantity": 2,
  "price": 49.99,
  "created_at": "2024-06-30T11:00:00Z"
}
```

---

## 🔗 Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ username    │
│ password    │
│ role        │
└──────┬──────┘
       │ (1:N)
       │
       ├──────────────────────┐
       │                      │
   ┌───┴──────────┐   ┌──────▼──────────┐
   │   orders     │   │  order_items    │
   ├──────────────┤   ├─────────────────┤
   │ id (PK)      │───│ id (PK)         │
   │ user_id (FK) │   │ order_id (FK)   │
   │ total_price  │   │ product_id (FK) │
   │ status       │   │ quantity        │
   └──────────────┘   │ price           │
                      └────────┬────────┘
                               │ (N:1)
                               │
                      ┌────────▼─────────┐
                      │   products       │
                      ├──────────────────┤
                      │ id (PK)          │
                      │ name             │
                      │ price            │
                      │ description      │
                      │ stock            │
                      │ category         │
                      └──────────────────┘
```

### Cascade Rules

- **users → orders:** `ON DELETE CASCADE`
  - Deleting a user also deletes their orders
  
- **orders → order_items:** `ON DELETE CASCADE`
  - Deleting an order also deletes its items
  
- **products → order_items:** `ON DELETE RESTRICT`
  - Cannot delete a product that has order items

---

## 📊 Sample Queries

### Get User with Orders
```sql
SELECT 
  u.id, u.username, u.role,
  COUNT(o.id) as total_orders,
  SUM(o.total_price) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.username = 'customer'
GROUP BY u.id;
```

### Get Order Details
```sql
SELECT 
  o.id, o.status, o.created_at,
  p.name, oi.quantity, oi.price,
  (oi.quantity * oi.price) as line_total
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.id = 1;
```

### Get Products by Category
```sql
SELECT 
  id, name, price, stock, category
FROM products
WHERE category = 'Accessories'
AND stock > 0
ORDER BY price ASC;
```

### Get Top Selling Products
```sql
SELECT 
  p.id, p.name, 
  SUM(oi.quantity) as total_sold,
  SUM(oi.quantity * oi.price) as revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 10;
```

---

## 🎯 Seeding

Initialize database with sample data:

```bash
npm run seed
```

This creates:
- **2 users:** operator (admin), customer (user)
- **8 products:** Across 4 categories
- **1 sample order:** With 2 items

---

## 📈 Performance Notes

### Recommended Indexes
```sql
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_orders_user_id_status ON orders(user_id, status);
```

### Query Optimization Tips
- Always filter by user_id when querying orders
- Use status index for order filtering
- Consider pagination for large result sets

```sql
-- Good: Uses user_id and status indexes
SELECT * FROM orders 
WHERE user_id = 1 AND status = 'pending'
LIMIT 10 OFFSET 0;

-- Avoid: Full table scan
SELECT * FROM orders
WHERE status = 'pending'
LIMIT 10;
```

---

## 🔐 Data Integrity

### Constraints
- Username must be unique
- User IDs referenced in orders must exist
- Product IDs referenced in order items must exist
- Prices must be positive values
- Stock must be non-negative

### Data Validation (Application Level)
- Passwords hashed with bcryptjs
- Email validation (can be added)
- Price formatting to 2 decimals
- Stock quantity validation
- Order status validation against allowed values

---

## 📝 Migration History

### v1.0 (2024-06-30)
- Initial schema with users, products, orders, order_items
- Support for user roles (admin, user)
- Order status tracking
- Product categorization and inventory

---

## 🔄 Backing Up

### Local SQLite
```bash
# Copy the database file
cp local.db local.db.backup
```

### Turso Cloud
```bash
# Create backup
turso db backup create ministore-prod

# List backups
turso db backup list ministore-prod

# Restore from backup
turso db backup restore ministore-prod backup-id
```

---

## 📚 Resources

- [Turso Docs](https://docs.turso.tech/)
- [SQLite Docs](https://www.sqlite.org/)
- [Foreign Keys in SQLite](https://www.sqlite.org/foreignkeys.html)
- [Query Optimization](https://www.sqlite.org/optoverview.html)

---

**Database designed for scalability and flexibility! 🚀**
