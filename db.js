const { createClient } = require('@libsql/client');
require('dotenv').config();

let client;

const getClient = () => {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_CONNECTION_URL || 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
  }
  return client;
};

const initializeDatabase = async () => {
  const db = getClient();
  
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user if not exists
    const adminExists = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      ['operator']
    );

    if (adminExists.rows.length === 0) {
      // Hash password using bcryptjs
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('developer2510', 10);
      
      await db.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['operator', hashedPassword, 'admin']
      );
      console.log('✅ Default admin user created: operator/developer2510');
    }

    // Insert sample products if table is empty
    const productsCount = await db.execute('SELECT COUNT(*) as count FROM products');
    if (productsCount.rows[0].count === 0) {
      await db.execute(
        'INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
        ['Laptop', 1000, 'High-performance laptop for development']
      );
      await db.execute(
        'INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
        ['Mouse', 50, 'Wireless mouse with precision tracking']
      );
      console.log('✅ Sample products inserted');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

module.exports = {
  getClient,
  initializeDatabase,
};
