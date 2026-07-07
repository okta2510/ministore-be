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
        name: 'Mechanical Keyboard RGB',
        price: 850000,
        description: 'Keyboard mechanical with RGB lighting',
        stock: 15,
        category: 'Computer Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=Mechanical+Keyboard+RGB',
      },
      {
        name: 'Wireless Gaming Mouse',
        price: 450000,
        description: 'Wireless mouse for gaming and productivity',
        stock: 25,
        category: 'Computer Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=Wireless+Gaming+Mouse',
      },
      {
        name: 'USB-C Hub 7 in 1',
        price: 650000,
        description: 'Multiport hub with 7 useful connections',
        stock: 12,
        category: 'Computer Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=USB-C+Hub+7+in+1',
      },
      {
        name: 'Laptop Stand Aluminium',
        price: 350000,
        description: 'Adjustable aluminium laptop stand',
        stock: 20,
        category: 'Computer Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=Laptop+Stand+Aluminium',
      },
      {
        name: 'Webcam Full HD 1080p',
        price: 550000,
        description: '1080p webcam for meetings and streaming',
        stock: 18,
        category: 'Computer Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=Webcam+Full+HD+1080p',
      },
      {
        name: 'Monitor LG UltraWide 29 Inch',
        price: 3200000,
        description: 'UltraWide monitor for work and entertainment',
        stock: 8,
        category: 'Monitor',
        image_url: 'https://via.placeholder.com/300x300?text=Monitor+LG+UltraWide+29+Inch',
      },
      {
        name: 'Keyboard Office Logitech K120',
        price: 180000,
        description: 'Reliable office keyboard',
        stock: 30,
        category: 'Computer Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=Keyboard+Office+Logitech+K120',
      },
      {
        name: 'SSD NVMe 1TB Samsung',
        price: 1450000,
        description: 'Fast NVMe SSD for storage upgrade',
        stock: 10,
        category: 'Storage',
        image_url: 'https://via.placeholder.com/300x300?text=SSD+NVMe+1TB+Samsung',
      },
      {
        name: 'RAM DDR5 16GB Kingston',
        price: 900000,
        description: 'High-performance DDR5 memory',
        stock: 14,
        category: 'Memory',
        image_url: 'https://via.placeholder.com/300x300?text=RAM+DDR5+16GB+Kingston',
      },
      {
        name: 'External Harddisk 2TB Seagate',
        price: 1100000,
        description: 'Portable 2TB external hard drive',
        stock: 9,
        category: 'Storage',
        image_url: 'https://via.placeholder.com/300x300?text=External+Harddisk+2TB+Seagate',
      },
      {
        name: 'iPhone 15 Case Premium',
        price: 250000,
        description: 'Premium protective case for iPhone 15',
        stock: 40,
        category: 'Mobile Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=iPhone+15+Case+Premium',
      },
      {
        name: 'Wireless Earbuds Pro',
        price: 750000,
        description: 'Comfortable earbuds with clear sound',
        stock: 22,
        category: 'Audio',
        image_url: 'https://via.placeholder.com/300x300?text=Wireless+Earbuds+Pro',
      },
      {
        name: 'Bluetooth Speaker Mini',
        price: 400000,
        description: 'Compact Bluetooth speaker',
        stock: 17,
        category: 'Audio',
        image_url: 'https://via.placeholder.com/300x300?text=Bluetooth+Speaker+Mini',
      },
      {
        name: 'Power Bank 20000mAh',
        price: 500000,
        description: 'High-capacity power bank',
        stock: 35,
        category: 'Mobile Accessories',
        image_url: 'https://via.placeholder.com/300x300?text=Power+Bank+20000mAh',
      },
      {
        name: 'Smart Watch AMOLED Display',
        price: 1250000,
        description: 'Smart watch with AMOLED screen',
        stock: 11,
        category: 'Wearable',
        image_url: 'https://via.placeholder.com/300x300?text=Smart+Watch+AMOLED+Display',
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
    console.log('  • Products table: 15 sample products');
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
