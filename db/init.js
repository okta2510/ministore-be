require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const client = require("./client");

const DEMO_PASSWORD = "password123";

async function init() {
  const schema = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf-8"
  );

  console.log("Applying schema...");
  // Jalankan tiap CREATE TABLE secara eksplisit (lebih aman dari split error)
  const creates = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`
  ];

  for (const stmt of creates) {
    await client.execute(stmt);
  }
  console.log("Schema applied ✅");

  console.log("Seeding data...");
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  await client.execute({
    sql: `INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    args: ["Admin", "admin@mail.com", hash, "admin"]
  });
  await client.execute({
    sql: `INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    args: ["Staff", "staff@mail.com", hash, "staff"]
  });
  await client.execute({
    sql: `INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    args: ["Customer", "customer@mail.com", hash, "customer"]
  });

  const seedProducts = [
    ["Laptop", 1000, 10],
    ["Mouse", 50, 25],
    ["Keyboard", 75, 20]
  ];
  for (const [name, price, stock] of seedProducts) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO products (name, price, stock) VALUES (?, ?, ?)`,
      args: [name, price, stock]
    });
  }

  console.log("Seed done ✅");
  console.log(`Demo login: admin@mail.com / ${DEMO_PASSWORD}`);
}

init()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Init failed:", err);
    process.exit(1);
  });
