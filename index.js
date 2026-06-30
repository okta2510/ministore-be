require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getClient, initializeDatabase } = require('./db');
const { authenticateToken } = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("🚀 MiniStore API with Turso SQL & Authentication");
});

// ===== AUTH ROUTES =====

// LOGIN endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const db = getClient();
    const result = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== PROTECTED CRUD ENDPOINTS =====

// READ (GET all products)
app.get("/products", authenticateToken, async (req, res) => {
  try {
    const db = getClient();
    const result = await db.execute('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// READ by ID (GET specific product)
app.get("/products/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const db = getClient();
    const result = await db.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// CREATE Product (POST)
app.post("/products", authenticateToken, async (req, res) => {
  try {
    const { name, price, description } = req.body;

    // Validate input
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const db = getClient();
    const result = await db.execute(
      'INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
      [name, price, description || null]
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      price,
      description: description || null,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE Product (PUT)
app.put("/products/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price, description } = req.body;

    const db = getClient();

    // Check if product exists
    const checkResult = await db.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product
    await db.execute(
      'UPDATE products SET name = ?, price = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name || checkResult.rows[0].name, price || checkResult.rows[0].price, description || checkResult.rows[0].description, id]
    );

    const updated = await db.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE Product
app.delete("/products/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const db = getClient();

    // Check if product exists
    const checkResult = await db.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete product
    await db.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    res.json({ message: "Product deleted successfully", id });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ===== SERVER STARTUP =====
const startServer = async () => {
  try {
    console.log("🔄 Initializing database...");
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📋 API Endpoints:`);
      console.log(`   POST   http://localhost:${PORT}/login (username: operator, password: developer2510)`);
      console.log(`   GET    http://localhost:${PORT}/products (requires auth)`);
      console.log(`   GET    http://localhost:${PORT}/products/:id (requires auth)`);
      console.log(`   POST   http://localhost:${PORT}/products (requires auth)`);
      console.log(`   PUT    http://localhost:${PORT}/products/:id (requires auth)`);
      console.log(`   DELETE http://localhost:${PORT}/products/:id (requires auth)`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
