require("dotenv").config();

const express = require("express");
const cors = require("cors");

const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const { authMiddleware } = require("./middleware/jwt");

const db = require("./db/client");

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("Express server is running 🚀");
});

app.use("/auth", authRouter);
app.use("/products", productsRouter);

// JWT-protected example endpoint
app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// DB health check
app.get("/db/health", async (req, res) => {
  try {
    await db.execute("SELECT 1");
    res.json({ db: "connected", provider: "turso" });
  } catch (err) {
    res.status(500).json({ db: "error", message: err.message });
  }
});

// ===== ERROR HANDLING =====
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await db.execute("SELECT 1");
    console.log("Turso database: connected ✅");
  } catch (err) {
    console.log("Turso database: NOT connected ❌ (" + err.message + ")");
  }
  console.log("");
  console.log("Routes:");
  console.log(`GET    http://localhost:${PORT}/                       (public)`);
  console.log(`GET    http://localhost:${PORT}/products               (public)`);
  console.log(`GET    http://localhost:${PORT}/products/:id           (public)`);
  console.log(`POST   http://localhost:${PORT}/products               (adminKey required)`);
  console.log(`PUT    http://localhost:${PORT}/products/:id           (adminKey required)`);
  console.log(`DELETE http://localhost:${PORT}/products/:id           (adminKey required)`);
  console.log(`POST   http://localhost:${PORT}/auth/login             (public -> JWT)`);
  console.log(`GET    http://localhost:${PORT}/me                     (Bearer token required)`);
});
