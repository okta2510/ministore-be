require('dotenv').config();
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to Turso database...');
    
    const client = createClient({
      url: process.env.TURSO_CONNECTION_URL || 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });

    console.log('📋 Creating tables...');

    // Create User table
    console.log('  → Creating User table...');
    await client.execute(`DROP TABLE IF EXISTS "Order_Product"`);
    await client.execute(`DROP TABLE IF EXISTS "Order"`);
    await client.execute(`DROP TABLE IF EXISTS "Product"`);
    await client.execute(`DROP TABLE IF EXISTS "User"`);
    await client.execute(`
      CREATE TABLE "User" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Product table
    console.log('  → Creating Product table...');
    await client.execute(`
      CREATE TABLE "Product" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT,
        stock INTEGER DEFAULT 0,
        description TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Order table
    console.log('  → Creating Order table...');
    await client.execute(`
      CREATE TABLE "Order" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_price REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES "User"(id)
      )
    `);

    // Create Order_Product table
    console.log('  → Creating Order_Product table...');
    await client.execute(`
      CREATE TABLE "Order_Product" (
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        PRIMARY KEY(order_id, product_id),
        FOREIGN KEY (order_id) REFERENCES "Order"(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES "Product"(id) ON DELETE CASCADE
      )
    `);

    console.log('\n🌱 Seeding data...');

    // Seed users
    console.log('  → Adding users...');
    const adminPassword = await bcrypt.hash('developer2510', 10);
    const userPassword = await bcrypt.hash('user1234', 10);

    await client.execute(
      `INSERT INTO "User" (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Operator', 'operator@example.com', adminPassword, 'admin']
    );

    await client.execute(
      `INSERT INTO "User" (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Customer', 'customer@example.com', userPassword, 'customer']
    );

    // Seed products
    console.log('  → Adding products...');
    const products = [
      {
        name: 'Laptop Pro 15',
        price: 1299.99,
        description: 'High-performance laptop for development and design',
        stock: 10,
        category: 'Computers',
        image_url: 'https://via.placeholder.com/300x300?text=Laptop+Pro+15',
      },
      {
        name: 'Wireless Mouse',
        price: 49.99,
        description: 'Precision wireless mouse with long battery life',
        stock: 50,
        category: 'Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=Wireless+Mouse',
      },
      {
        name: 'Mechanical Keyboard',
        price: 129.99,
        description: 'RGB mechanical keyboard with Cherry MX switches',
        stock: 25,
        category: 'Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=Keyboard',
      },
      {
        name: '4K Monitor',
        price: 599.99,
        description: '4K UltraWide Monitor - 38 inch',
        stock: 8,
        category: 'Displays',
        image_url: 'https://via.placeholder.com/300x300?text=4K+Monitor',
      },
      {
        name: 'Wireless Headphones',
        price: 199.99,
        description: 'Noise-cancelling wireless headphones with 30h battery',
        stock: 15,
        category: 'Audio',
        image_url: 'https://via.placeholder.com/300x300?text=Headphones',
      },
      {
        name: 'USB-C Hub',
        price: 79.99,
        description: '7-in-1 USB-C hub with charging and data transfer',
        stock: 30,
        category: 'Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=USB-C+Hub',
      },
      {
        name: 'Webcam 4K',
        price: 149.99,
        description: 'Professional 4K webcam with auto-focus and mic',
        stock: 20,
        category: 'Audio',
        image_url: 'https://via.placeholder.com/300x300?text=Webcam+4K',
      },
      {
        name: 'Desk Lamp LED',
        price: 59.99,
        description: 'Smart LED desk lamp with adjustable color temperature',
        stock: 40,
        category: 'Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=Desk+Lamp',
      },
    ];

    for (const product of products) {
      await client.execute(
        `INSERT INTO "Product" (name, price, description, stock, category, image_url) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product.name, product.price, product.description, product.stock, product.category, product.image_url]
      );
    }

    // Seed sample order
    console.log('  → Adding sample order...');
    const orderResult = await client.execute(
      `INSERT INTO "Order" (user_id, total_price, status) VALUES (?, ?, ?)`,
      [2, 99.98, 'completed']
    );

    // Add order items
    await client.execute(
      `INSERT INTO "Order_Product" (order_id, product_id, quantity) VALUES (?, ?, ?)`,
      [orderResult.lastInsertRowid, 2, 2]
    );

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('  • User table: 2 users (operator@example.com, customer@example.com)');
    console.log('  • Products table: 8 sample products');
    console.log('  • Orders table: 1 sample order');
    console.log('  • Order items table: 1 sample item');

    console.log('\n🔐 Credentials:');
    console.log('  Admin:');
    console.log('    Email: operator@example.com');
    console.log('    Password: developer2510');
    console.log('  Customer:');
    console.log('    Email: customer@example.com');
    console.log('    Password: user1234');

    console.log('\n✨ Ready to use!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
