const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const { ApiError } = require('./helpers/apiError');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'MiniStore API is running' });
});

app.use(authRoutes);
app.use('/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  const status = err instanceof ApiError ? err.status : err.status || 500;
  const message = err instanceof ApiError ? err.message : err.message || 'Internal server error';
  console.error(err);
  res.status(status).json({ message });
});

module.exports = app;
