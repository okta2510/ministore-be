# Sesi 13: REST API Production-Ready dengan Express + Turso

**Pertemuan 13 — MiniStore Backend**

---

## Daftar Isi

1. [Ringkasan Pembelajaran](#1-ringkasan-pembelajaran)
2. [Langkah Persiapan Siswa](#2-langkah-persiapan-siswa)
3. [Arsitektur Project](#3-arsitektur-project)
4. [Alur Request through Codebase](#4-alur-request-through-codebase)
5. [Pelajaran Kunci](#5-pelajaran-kunci)
6. [Potensi Bug & Solusi](#6-potensi-bug--solusi)
7. [Testing Manual via Postman/curl](#7-testing-manual-via-postmancurl)
8. [Checklist Mahir](#8-checklist-mahir)

---

## 1. Ringkasan Pembelajaran

Pada sesi ini peserta belajar membangun **REST API yang lebih production-ready** dengan:

- Membuat CRUD lengkap menggunakan **Express.js + Turso SQL**
- Memahami alur **request → validation → database → response**
- Membuat validasi input agar data aman
- Membuat middleware error handling terpusat
- Mengenal potensi bug umum:
  - Data kosong (empty payload)
  - ID tidak ditemukan (404 handling)
  - SQL Injection (parameter binding)
  - Database error / connection issue
  - Invalid request (400 handling)
- Menjunjung tinggi responsibilitas error message yang informatif

### Target Output Akhir

- [x] Express REST API berjalan di `localhost:3001`
- [x] CRUD Product (`POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`)
- [x] Login dengan JWT (`POST /login`)
- [x] Turso Database Integration (Local & Cloud)
- [x] Input Validation via helpers
- [x] Centralized Error Middleware (`ApiError` + error handler)
- [x] SQL Injection Awareness (parameterized queries)
- [x] Pagination support (`?page=1&limit=10`)

---

## 2. Langkah Persiapan Siswa

```bash
# 1. Clone repository
git clone https://github.com/okta2510/ministore-be.git
cd ministore-be

# 2. Pindah ke branch pertemuan-13
git checkout pertemuan13

# 3. Install dependencies
npm install

# 4. Setup environment
cp .env.example .env
```

### File `.env` untuk siswa

```env
PORT=3001
NODE_ENV=development

# Local (default — tanpa setup Turso Cloud)
TURSO_CONNECTION_URL=file:local.db
TURSO_AUTH_TOKEN=

# JWT
JWT_SECRET=dev-secret-123

# CORS (frontend)
CORS_ORIGIN=*
```

> **Catatan Instruktur:** Jika siswa belum punya akun Turso, segera arahkan menggunakan mode **local SQLite** (`file:local.db`). File `.db` akan otomatis dibuat saat pertama kali dijalankan.

### Seed Database

```bash
npm run seed
```

Output yang diharapkan:

- ✅ 2 users (`admin`, `customer`)
- ✅ 15 products
- ✅ 1 sample order
- ✅ Credentials ditampilkan di terminal

---

## 3. Arsitektur Project

```
ministore-be/
├── .env                    # Environment variables
├── index.js               # Entry point — init DB + start server
├── db.js                  # Turso/libSQL client (singleton)
├── middleware.js           # JWT authentication
├── seed.js                # Database schema + data dummy
├── package.json
├── src/
│   ├── app.js             # Express app: middleware, routes, error handler
│   ├── helpers/
│   │   ├── apiError.js    # Custom error class (status + message)
│   │   └── validators.js  # Reusable validation functions
│   ├── controllers/        # Handle req → service call → res
│   │   ├── authController.js
│   │   └── productController.js
│   ├── services/          # Business logic + database queries
│   │   ├── authService.js
│   │   └── productService.js
│   └── routes/            # URL routing + middleware attach
│       ├── authRoutes.js
│       └── productRoutes.js
```

### Glaucus Arsitektur: Separation of Concerns

```
HTTP Request
     │
     ▼
  Routes       ← Cek auth, attach middleware
     │
     ▼
  Controllers   ← Validate input, catch errors
     │
     ▼
  Services       ← Business logic, DB queries
     │
     ▼
  Database       ← Turso / libSQL
```

---

## 4. Alur Request through Codebase

### Contoh: `POST /login`

**File: `src/routes/authRoutes.js`**

```js
router.post('/login', loginHandler);
```

**File: `src/controllers/authController.js`**

```js
const loginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw new ApiError(400, 'Email and password are required');
    }

    // 2. Normalize + format validation
    const normalizedEmail = email.trim().toLowerCase();
    if (!isEmailString(normalizedEmail)) {
      throw new ApiError(400, 'Invalid email format');
    }

    // 3. Call service layer
    const result = await login({ email: normalizedEmail, password });

    // 4. Return success
    res.json(result);
  } catch (error) {
    next(error); // lempar ke centralized error handler
  }
};
```

**File: `src/services/authService.js`**

```js
const login = async ({ email, password }) => {
  const db = getClient();

  // ✅ Parameterized query (anti SQL Injection)
  const result = await db.execute(
    'SELECT id, name, email, password, role, status FROM "User" WHERE email = ? LIMIT 1',
    [email.trim().toLowerCase()]
  );

  const user = result.rows[0];
  if (!user) {
    throw new ApiError(401, 'Invalid email or password'); // Jangan bocorkan mana yang salah
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: { id, name, email, role, status },
  };
};
```

### Contoh: `GET /products`

**File: `src/services/productService.js`**

```js
const listProducts = async ({ page = 1, limit = 5 } = {}) => {
  const db = getClient();
  const offset = (page - 1) * limit;

  // Count total
  const totalResult = await db.execute('SELECT COUNT(*) AS total FROM Product');
  const totalItems = Number(totalResult.rows[0]?.total ?? 0);

  // Fetch page
  const result = await db.execute(
    'SELECT * FROM Product ORDER BY id ASC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  return {
    data: result.rows.map(mapProduct),
    pagination: { page, limit, totalItems, totalPages },
  };
};
```

---

## 5. Pelajaran Kunci

### A. Turso + libSQL Client

```js
// db.js — Singleton pattern
const getClient = () => {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_CONNECTION_URL || 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
};
```

**Konsep:**
- Local mode: `file:local.db` → SQLite file di direktori project
- Cloud mode: `libsql://<db-name>.turso.io` → Remote Turso

### B. ApiError — Custom Error Class

```js
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
```

Mengapa?
- Menyimpan `status` HTTP bersama `message`
- Mudah dicek di error handler:
  ```js
  const status = err instanceof ApiError ? err.status : 500;
  ```
- Pesan error bisa berbeda-beda (`400`, `401`, `404`, `500`) tanpa hardcode berulang.

### C. Validators — Reusable Helper

```js
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const toPositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};
```

Alur validasi di `productController.js`:

```js
const validateProductPayload = (body, partial = false) => {
  const price = body.price !== undefined ? toNumber(body.price) : undefined;
  const stock = body.stock !== undefined ? toNumber(body.stock) : undefined;

  if (!partial) {
    if (!isNonEmptyString(body.name)) throw new ApiError(400, 'Name is required');
    if (price === null || price === undefined) throw new ApiError(400, 'Price is required');
  }

  if (price === null) throw new ApiError(400, 'Price must be a valid number');
  if (stock === null) throw new ApiError(400, 'Stock must be a valid number');

  return {
    name: body.name?.trim(),
    price,
    description: body.description,
    stock,
    category: body.category,
    image_url: body.image_url,
  };
};
```

### D. Centralized Error Handler

**File: `src/app.js`**

```js
app.use((err, req, res, next) => {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err instanceof ApiError ? err.message : 'Internal server error';
  console.error(err); // Debug: tetap log error di console
  res.status(status).json({ message });
});
```

Format response sukses dan error telah seragam:

**Success:**
```json
{
  "id": 1,
  "name": "Mechanical Keyboard RGB",
  "price": 850000
}
```

**Error:**
```json
{
  "message": "Name is required"
}
```

---

## 6. Potensi Bug & Solusi

### 6.1 SQL Injection ❌ vs ✅

**SALAH — String concatenation:**

```js
const sql = `SELECT * FROM Product WHERE name = '${userInput}'`;
```

Jika user mengirim: `' OR 1=1 --`

Query menjadi: `SELECT * FROM Product WHERE name = '' OR 1=1 --'`

Semua data bocor!

**BENAR — Parameterized query:**

```js
const result = await db.execute(
  'SELECT * FROM Product WHERE name = ?',
  [userInput]
);
```

Library (`@libsql/client`) secara otomatis memisahkan SQL command dari data. User input **tidak** dieksekusi sebagai SQL.

### 6.2 Data Kosong / Empty Fields

**Bug:** User mengirim `POST /products` tanpa body.

**Tanpa validation:**

```json
{
  "id": 1,
  "name": null,
  "price": -500
}
```

**Dengan validation:**

```json
{
  "message": "Name is required"
}
```

### 6.3 ID Tidak Ditemukan

**Bug:** `GET /products/9999` tapi ID tidak ada → return `undefined` sebagai response.

**Solusi:**

```js
const getProductById = async (id) => {
  const result = await db.execute('SELECT * FROM Product WHERE id = ? LIMIT 1', [id]);
  const product = result.rows[0];
  if (!product) throw new ApiError(404, 'Product not found');
  return mapProduct(product);
};
```

Selalu throw error jika `result.rows.length === 0`.

### 6.4 Tipe Data Salah

**Bug:** Client kirim `price: "abc"` → Database error karena kolom `price REAL`.

**Solusi via `validators.js`:**

```js
const price = body.price !== undefined ? toNumber(body.price) : undefined;
if (price === null) throw new ApiError(400, 'Price must be a valid number');
```

### 6.5 Error Handling Terciut

**Bug:** Controller menangkap error tapi masih merespon 200 OK.

**Solusi:** Selalu lempar error ke `next(error)` di blok catch.

```js
try {
  await deleteProduct(Number(req.params.id));
  res.json({ message: 'Product deleted successfully' });
} catch (error) {
  next(error); // jangan res.json disini
}
```

### 6.6 Race Condition pada Update

Bagaimana jika 2 user meng-update product yang sama bersamaan?

Dalam aplikasi ini kita menggunakan `getProductById(id)` untuk `UPDATE` dan `DELETE`, yang secara implisit memastikan record ada sebelum diubah. Untuk kasus lebih kompleks (misal stock decrement concurrent), tambahkan **transaction** atau **optimistic locking** (kolom `version`).

---

## 7. Testing Manual via Postman/curl

### Variable Postman

Set di Pre-request Script atau Environment:

```js
{{base_url}} = http://localhost:3001
{{token}} = <isi setelah login>
```

### Endpoint yang Tersedia

| Method | Endpoint | Auth | Body | Deskripsi |
|--------|----------|------|------|-----------|
| POST | `/login` | ❌ | `{email, password}` | Login, dapat JWT |
| GET | `/` | ❌ | — | Health check |
| GET | `/products` | ❌ | — | List (5/halaman default) |
| GET | `/products?page=2&limit=10` | ❌ | — | Pagination |
| GET | `/products/:id` | ❌ | — | Detail product |
| POST | `/products` | ✅ | `{name, price, ...}` | Create product |
| PUT | `/products/:id` | ✅ | `{name, price, ...}` | Update product |
| DELETE | `/products/:id` | ✅ | — | Delete product |

> **Catatan:** `POST /products`, `PUT /products/:id`, `DELETE /products/:id` dilindungi JWT (`middleware.js`).

### Contoh curl

```bash
# 1. Login
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@example.com","password":"developer2510"}'

# 2. List products
curl http://localhost:3001/products

# 3. Pagination
curl "http://localhost:3001/products?page=1&limit=3"

# 4. Get product by ID
curl http://localhost:3001/products/1

# 5. Create product (pakai token dari login)
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Keyboard RGB","price":850000,"stock":10}'

# 6. Update product
curl -X PUT http://localhost:3001/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Keyboard Gaming","price":900000}'

# 7. Delete product
curl -X DELETE http://localhost:3001/products/1 \
  -H "Authorization: Bearer <TOKEN>"

# 8. Test validation error (empty name)
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"","price":10000}'
```

### Test Error Cases (Diskusikan dengan siswa)

| Scenario | API Call | Expected Response |
|----------|----------|-------------------|
| Empty name | `POST /products` with `{"name":""}` | `400 Name is required` |
| Invalid price | `POST /products` with `{"price":"abc"}` | `400 Price must be a valid number` |
| Missing ID | `GET /products/99999` | `404 Product not found` |
| No auth | `POST /products` tanpa token | `401 Access token required` |
| Wrong route | `GET /invalid` | `404 Route not found` |

---

## 8. Checklist Mahir

Gunakan ini untuk memastikan peserta benar-benar memahami sebelum berganti ke materi berikutnya:

### Backend Concepts

- [ ] Bisa menjelaskan perbedaan **Controller vs Service**
- [ ] Bisa menjelaskan mengapa Middleware JWT di-`use` di route level, bukan controller level
- [ ] Bisa menjelaskan mengapa `next(error)` diperlukan
- [ ] Bisa menjelaskan perbedaan `file:local.db` vs `libsql://`

### Database & Security

- [ ] Bisa menjelaskan apa itu **Parameterized Query**
- [ ] Bisa menjelaskan kapan harus menggunakan bcrypt
- [ ] Bisa menjelaskan JWT flow (login → token → protected route)
- [ ] Bisa menjelaskan mengapa di `authService.js` di-return `200` padahal password salah (security reason)
- [ ] Bisa menjelaskan kegunaan `updated_at` di tabel Product

### Code Quality

- [ ] Bisa menambah validasi baru di `validators.js` tanpa mengacaukan controller lain
- [ ] Bisa menambah CRUD baru (misal Category) dengan pola yang sama
- [ ] Bisa menjelaskan peran `mapProduct()` untuk decouple DB schema dengan API response
- [ ] Bisa menjelaskan manfaat pagination (`LIMIT`, `OFFSET`, `COUNT(*)`)

### Debugging

- [ ] Bisa memperbaiki kalau endpoint returning `undefined`
- [ ] Bisa memperbaiki error handling kalau `try/catch` kurang mencakup semua async
- [ ] Bisa menjelaskan bedanya `res.status().send()` vs `res.send()`
- [ ] Bisa menjelaskan bedanya `422` vs `400` vs `404`

---

## Penutup

Sesi 13 ini membentuk fondasi untuk membangun API yang aman,
terstruktur, dan mudah di-maintain. Konsep-konsep yang dipelajari:

- **Structure**: app → routes → controllers → services → db
- **Validation**: single source of truth di `validators.js`
- **Error**: custom class + centralized handler → format respons konsisten
- **Security**: parameterized query + bcrypt + JWT
- **Teaching Point**: siswa wajib understand why, bukan hanya how

**Challenge lanjutan untuk home exercise:**

1. Tambah endpoint `GET /products/search?keyword=keyboard`
2. Tambah endpoint `GET /products?category=Computer`
3. Tambah endpoint `POST /orders` dengan `Order_Product` relationship
4. Pagination: endpoint harus return `totalPages` + `hasNextPage` boolean
5. Rate limiting sederhana per IP
6. Tambah `updated_at` otomatis pada UPDATE
---

*Dibuat untuk sesi pembelajaran MiniStore Backend — Pertemuan 13*
