# MiniStore Backend 🚀

Express.js API untuk manajemen produk MiniStore, dilengkapi **Simple Authentication (Mock)** dan **JWT Authentication**.

Panduan ini dibuat supaya pemula bisa mereplikasi project dari nol sampai jalan.

---

## 📋 Prasyarat

- **Node.js** (versi 18 ke atas) — cek dengan `node -v`
- **npm** (sudah ikut terinstall bersama Node.js) — cek dengan `npm -v`
- Terminal (Command Prompt / PowerShell / Terminal macOS-Linux)
- Tool API tester: **Postman**, **Thunder Client** (VS Code extension), atau cukup `curl`

---

## 🗂️ Struktur Project (Hasil Akhir)

```
ministore-be/
├── server.js              # Entry point: setup Express + routes
├── package.json           # Dependencies & scripts
├── .env                   # Konfigurasi rahasia (ADMIN_KEY, JWT_SECRET, PORT)
├── .env.example           # Contoh isi .env
├── middleware/
│   ├── auth.js            # Mock auth: cek header adminKey
│   └── jwt.js             # JWT auth + role guard (RBAC)
├── routes/
│   ├── products.js        # CRUD produk (GET publik, POST/PUT/DELETE protected)
│   └── auth.js            # POST /auth/login -> JWT token
├── data/
│   ├── products.js        # Dummy data produk (in-memory, fallback belajar)
│   └── users.js           # Dummy data user (untuk login JWT, fallback)
├── db/
│   ├── client.js          # Koneksi LibSQL client ke Turso
│   ├── schema.sql         # Skema tabel (users, products, orders, order_items)
│   └── init.js            # Migrasi + seed data ke Turso
└── node_modules/          # Dependencies (otomatis saat npm install)
```

---

## 🚀 Cara Replikasi dari Awal

### 1. Buat folder project & init

```bash
mkdir ministore-be
cd ministore-be
npm init -y
```

### 2. Install dependencies

```bash
npm install express cors dotenv
npm install jsonwebtoken bcrypt
npm install @libsql/client
npm install --save-dev nodemon
```

> `express` = web server, `cors` = izinkan akses dari frontend, `dotenv` = baca file `.env`, `jsonwebtoken` + `bcrypt` = JWT auth, `nodemon` = auto-restart saat file berubah.

### 3. Buat file `.env`

Buat file bernama `.env` di root project:

```env
PORT=3001

# Admin Key (mock authentication - Level 2)
ADMIN_KEY=secret123

# JWT Secret (untuk sign/verify token)
JWT_SECRET=MezcrDGh6KSLRUfFe7yd1WTFtr7GrI0aWiyN4FkZrWo

# CORS
CORS_ORIGIN=http://localhost:3001
```

> ⚠️ Jangan commit file `.env` ke GitHub (sudah di-ignore di `.gitignore`). Buat `.env.example` sebagai template.

### 4. Buat struktur folder & file

```bash
mkdir middleware routes data
```

Lalu isi file-file berikut (salin dari project ini):

**`middleware/auth.js`** — Middleware mock adminKey:

```javascript
const ADMIN_KEY = process.env.ADMIN_KEY || "my-secret-admin-key";

function adminAuth(req, res, next) {
  const adminKey = req.headers["adminkey"];

  if (!adminKey) {
    return res.status(401).json({ message: "Admin key required" });
  }

  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ message: "Invalid admin key" });
  }

  next();
}

module.exports = adminAuth;
```

**`middleware/jwt.js`** — Middleware JWT + role guard:

```javascript
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers["authorization"] || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
```

**`data/products.js`** — Dummy produk:

```javascript
const products = [
  { id: 1, name: "Laptop", price: 1000 },
  { id: 2, name: "Mouse", price: 50 }
];

module.exports = products;
```

**`data/users.js`** — Dummy user (password demo: `password123`):

```javascript
const bcrypt = require("bcrypt");

const DEMO_PASSWORD = "password123";

const rawUsers = [
  { id: 1, name: "Admin",    email: "admin@mail.com",    role: "admin" },
  { id: 2, name: "Staff",    email: "staff@mail.com",    role: "staff" },
  { id: 3, name: "Customer", email: "customer@mail.com", role: "customer" }
];

const users = rawUsers.map(u => ({
  ...u,
  password: bcrypt.hashSync(DEMO_PASSWORD, 10)
}));

module.exports = { users, DEMO_PASSWORD };
```

**`routes/products.js`** — CRUD, GET publik & sisanya protected:

```javascript
const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/auth");
const products = require("../data/products");

// GET semua produk (publik)
router.get("/", (req, res) => res.json(products));

// GET by id (publik)
router.get("/:id", (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST (protected: adminKey)
router.post("/", adminAuth, (req, res) => {
  const product = { id: Date.now(), name: req.body.name, price: req.body.price };
  products.push(product);
  res.status(201).json({ message: "Product created", data: product });
});

// PUT (protected: adminKey)
router.put("/:id", adminAuth, (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  product.name = req.body.name ?? product.name;
  product.price = req.body.price ?? product.price;
  res.json({ message: "Product updated", data: product });
});

// DELETE (protected: adminKey)
router.delete("/:id", adminAuth, (req, res) => {
  const filtered = products.filter(p => p.id != req.params.id);
  if (filtered.length === products.length) {
    return res.status(404).json({ message: "Product not found" });
  }
  products.length = 0;
  products.push(...filtered);
  res.json({ message: "Product deleted" });
});

module.exports = router;
```

**`routes/auth.js`** — Login -> JWT:

```javascript
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { users, DEMO_PASSWORD } = require("../data/users");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

module.exports = router;
```

**`server.js`** — Entry point:

```javascript
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const { authMiddleware } = require("./middleware/jwt");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Express server is running 🚀"));

app.use("/auth", authRouter);
app.use("/products", productsRouter);

// Contoh endpoint terproteksi JWT
app.get("/me", authMiddleware, (req, res) => res.json({ user: req.user }));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### 5. Jalankan server

```bash
npm install        # install semua dependency (jika belum)
npm run db:init    # buat skema + seed ke Turso (sekali / saat skema berubah)
npm run dev        # pakai nodemon (auto restart)
# atau
npm start          # node server.js
```

Buka `http://localhost:3001` di browser → muncul `Express server is running 🚀`.

---

## 🔐 Authentication: 3 Level

### Level 1 — Admin Key (Mock)
Kirim header `adminKey` untuk operasi tulis (POST/PUT/DELETE):

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "adminKey: secret123" \
  -d '{"name":"Keyboard","price":50}'
```

Tanpa header → `401 Admin key required`. Salah → `403 Invalid admin key`.

### Level 2 — ENV Config
`ADMIN_KEY` disimpan di `.env` (bukan hardcode) → `process.env.ADMIN_KEY`.

### Level 3 — JWT Login
```bash
# 1. Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mail.com","password":"password123"}'
# -> { "token": "eyJhbGci..." }

# 2. Akses endpoint terproteksi dengan token
curl http://localhost:3001/me \
  -H "Authorization: Bearer <TOKEN>"
```

### Level 4 — RBAC (Role Based)
User punya role `admin` / `staff` / `customer`. Gunakan `requireRole` dari `middleware/jwt.js`:

```javascript
const { authMiddleware, requireRole } = require("../middleware/jwt");

router.post("/", authMiddleware, requireRole("admin"), (req, res) => { ... });
```

---

## 📡 API Endpoints

| Method | Endpoint          | Akses        | Keterangan                |
|--------|-------------------|--------------|---------------------------|
| GET    | `/`               | Publik       | Cek server hidup          |
| GET    | `/products`       | Publik       | List semua produk         |
| GET    | `/products/:id`   | Publik       | Detail produk             |
| POST   | `/products`       | adminKey     | Buat produk               |
| PUT    | `/products/:id`   | adminKey     | Update produk             |
| DELETE | `/products/:id`   | adminKey     | Hapus produk              |
| POST   | `/auth/login`     | Publik       | Login → JWT token         |
| GET    | `/me`             | JWT (Bearer) | Info user dari token      |

---

## 🧪 Testing Cepat (cURL)

```bash
# List produk (publik)
curl http://localhost:3001/products

# Buat produk (perlu adminKey)
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" -H "adminKey: secret123" \
  -d '{"name":"Keyboard","price":50}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mail.com","password":"password123"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

# Akses /me pakai token
curl http://localhost:3001/me -H "Authorization: Bearer $TOKEN"
```

Atau gunakan **Postman / Thunder Client**:
1. Buat request, pilih method & URL.
2. Untuk POST/PUT: header `Content-Type: application/json` + body JSON.
3. Untuk protected: tambahkan header `adminKey` atau `Authorization: Bearer <token>`.

---

## 📦 Data Model

**Product**
```javascript
{ id: Number, name: String, price: Number }
```

**User (JWT)**
```javascript
{ id: Number, name: String, email: String, role: "admin"|"staff"|"customer" }
```

> Data disimpan **in-memory** (di-reset tiap server restart). Cocok untuk belajar; untuk production gunakan database (lihat `.env` `TURSO_*` sebagai referensi).

---

## 🛢️ Turso Database (Sesi 15)

Project terhubung ke **Turso** (LibSQL cloud, kompatibel SQLite) lewat `@libsql/client`.

### Setup `.env`
Tambahkan ke file `.env`:
```env
TURSO_CONNECTION_URL=libsql://<db-name>-<org>.turso.io
TURSO_AUTH_TOKEN=<your-token>
```

### Buat skema & seed
```bash
npm run db:init
```
Script (`db/init.js`) akan:
1. Membuat tabel `users`, `products`, `orders`, `order_items` (jika belum ada).
2. Seed user demo (password `password123`):
   - `admin@mail.com` (role admin)
   - `staff@mail.com` (role staff)
   - `customer@mail.com` (role customer)
3. Seed produk: Laptop, Mouse, Keyboard.

### Cek koneksi
```bash
curl http://localhost:3001/db/health
# -> { "db": "connected", "provider": "turso" }
```

### Skema tabel
| Tabel        | Kolom utama                              |
|--------------|------------------------------------------|
| `users`      | id, name, email (unique), password, role |
| `products`   | id, name, price, stock                   |
| `orders`     | id, user_id, total, status               |
| `order_items`| id, order_id, product_id, qty, price     |

> Catatan: `routes/products.js` & `routes/auth.js` saat ini masih pakai data in-memory (`data/`) sebagai materi belajar. Untuk produksi, ganti logikanya memakai `db/client.js` (query LibSQL).

---

## 🔜 Next Steps (Frontend Integration)

```javascript
const res = await fetch("http://localhost:3001/products");
const products = await res.json();
```

---

Materi: **Sesi 17 — Simple Authentication (Mock) dengan Express.js**
