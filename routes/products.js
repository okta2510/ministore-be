const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/auth");
const products = require("../data/products");

// GET semua produk (public)
router.get("/", (req, res) => {
  res.json(products);
});

// GET produk by id (public)
router.get("/:id", (req, res) => {
  const product = products.find(p => p.id == req.params.id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  res.json(product);
});

// POST produk baru (protected)
router.post("/", adminAuth, (req, res) => {
  const product = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price
  };

  products.push(product);

  res.status(201).json({
    message: "Product created",
    data: product
  });
});

// UPDATE produk (protected)
router.put("/:id", adminAuth, (req, res) => {
  const product = products.find(p => p.id == req.params.id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  product.name = req.body.name ?? product.name;
  product.price = req.body.price ?? product.price;

  res.json({
    message: "Product updated",
    data: product
  });
});

// DELETE produk (protected)
router.delete("/:id", adminAuth, (req, res) => {
  const index = products.findIndex(p => p.id != req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  products = products.filter(p => p.id != req.params.id);

  res.json({
    message: "Product deleted"
  });
});

module.exports = router;
