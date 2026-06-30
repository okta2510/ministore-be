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
    // Check if tables exist
    const tablesResult = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'products')"
    );

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  Database tables not found!');
      console.log('🌱 Run "npm run seed" to initialize schema with sample data');
      console.log('✅ Database will still work with in-memory fallback for now\n');
    }

    console.log('✅ Database connection established');
  } catch (error) {
    console.error('⚠️  Database initialization warning:', error.message);
    // Don't throw - let app continue with in-memory data
  }
};

module.exports = {
  getClient,
  initializeDatabase,
};
