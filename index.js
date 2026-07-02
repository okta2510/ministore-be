const app = require('./src/app');
const { initializeDatabase } = require('./db');

const PORT = process.env.PORT || 3001;

const start = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
