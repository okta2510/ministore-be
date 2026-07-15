const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

// ===== MIDDLEWARE =====
app.use(cors()); // allow frontend access
app.use(express.json()); // parse JSON body

// ===== DUMMY DATA =====
let products = [
  { id: 1, name: "Laptop", price: 1000 },
  { id: 2, name: "Mouse", price: 50 },
];

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("Express server is running 🚀");
});

// ===== CRUD ENDPOINTS =====

// READ (GET all products)
app.get("/products", (req, res) => {
  res.json(products);
});

// READ by ID (GET specific product)
app.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

// CREATE Product (POST)
app.post("/products", (req, res) => {
  const { name, price } = req.body;

  // Validate input
  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name,
    price,
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});

// UPDATE Product (PUT)
app.put("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products[index] = {
    ...products[index],
    ...req.body,
  };

  res.json(products[index]);
});

// DELETE Product
app.delete("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products = products.filter((p) => p.id !== id);

  res.json({ message: "Product deleted successfully" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation:`);
  console.log(`GET    http://localhost:${PORT}/products`);
  console.log(`GET    http://localhost:${PORT}/products/:id`);
  console.log(`POST   http://localhost:${PORT}/products`);
  console.log(`PUT    http://localhost:${PORT}/products/:id`);
  console.log(`DELETE http://localhost:${PORT}/products/:id`);
});
