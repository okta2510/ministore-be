# Sesi 13: CRUD & Error Handling Express + Turso

## 🎯 Tujuan Pembelajaran

Pada sesi ini peserta belajar membangun **REST API yang lebih production-ready** dengan:

- Membuat CRUD lengkap menggunakan **Express.js + Turso SQL**
- Memahami alur request → validation → database → response
- Membuat validasi input agar data aman
- Membuat middleware error handling terpusat
- Mengenal potensi bug umum:
    - Data kosong
    - ID tidak ditemukan
    - SQL Injection
    - Database error
    - Invalid request

---

# 1. 🧠 Konsep Dasar CRUD

CRUD adalah operasi utama dalam aplikasi yang berhubungan dengan database.

| Operasi | HTTP Method | Endpoint | Fungsi |
| --- | --- | --- | --- |
| Create | POST | `/products` | Membuat data baru |
| Read | GET | `/products` | Mengambil semua data |
| Read Detail | GET | `/products/:id` | Mengambil 1 data |
| Update | PUT | `/products/:id` | Mengubah data |
| Delete | DELETE | `/products/:id` | Menghapus data |

Contoh aplikasi:

```
Mini Store API

Client
  |
  |
Express API
  |
  |
Turso Database

products table
```

---

# 2. 🗄️ Database Preparation Turso

## Schema Product

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Contoh data:

```sql
INSERT INTO products
(name, price, category, stock)
VALUES
('Mechanical Keyboard', 850000, 'Computer', 10),
('Mouse Gaming', 350000, 'Computer', 20);
```

---

# 3. 🚀 Setup Express Project

## Install Dependency

```bash
npm init -y
```

Install:

```bash
npm install express
npm install @libsql/client
npm install dotenv
npm install cors
```

Struktur folder:

```
mini-store-api
|
├── src
│   |
│   ├── app.js
│   ├── database.js
│   |
│   ├── routes
│   │    └── products.js
│   |
│   ├── middleware
│   │    └── errorHandler.js
│   |
│   └── controllers
│        └── productController.js
|
└── .env
```

---

# 4. 🔌 Connect Express ke Turso

## database.js

```jsx
import { createClient } from "@libsql/client";

export const db = createClient({

    url: process.env.TURSO_DATABASE_URL,

    authToken: process.env.TURSO_AUTH_TOKEN

});
```

## Seed Data Products

```jsx
INSERT INTO products 
(name, price, category, stock)
VALUES

('Mechanical Keyboard RGB', 850000, 'Computer Accessories', 15),

('Wireless Gaming Mouse', 450000, 'Computer Accessories', 25),

('USB-C Hub 7 in 1', 650000, 'Computer Accessories', 12),

('Laptop Stand Aluminium', 350000, 'Computer Accessories', 20),

('Webcam Full HD 1080p', 550000, 'Computer Accessories', 18),

('Monitor LG UltraWide 29 Inch', 3200000, 'Monitor', 8),

('Keyboard Office Logitech K120', 180000, 'Computer Accessories', 30),

('SSD NVMe 1TB Samsung', 1450000, 'Storage', 10),

('RAM DDR5 16GB Kingston', 900000, 'Memory', 14),

('External Harddisk 2TB Seagate', 1100000, 'Storage', 9),

('iPhone 15 Case Premium', 250000, 'Mobile Accessories', 40),

('Wireless Earbuds Pro', 750000, 'Audio', 22),

('Bluetooth Speaker Mini', 400000, 'Audio', 17),

('Power Bank 20000mAh', 500000, 'Mobile Accessories', 35),

('Smart Watch AMOLED Display', 1250000, 'Wearable', 11);
```

---

# 5. 📌 CREATE Product

## Endpoint

```
POST /products
```

Request:

```json
{
    "name":"Laptop Asus",
    "price":12000000,
    "category":"Laptop",
    "stock":5
}
```

---

## Controller

```jsx
export async function createProduct(req,res,next){

try{

const {
name,
price,
category,
stock
}=req.body;

const result = await db.execute({

sql:`
INSERT INTO products
(name,price,category,stock)
VALUES (?,?,?,?)
`,

args:[
name,
price,
category,
stock
]

});

res.json({

message:"Product created"

});

}catch(error){

next(error)

}

}
```

---

# 6. 🛡️ Input Validation

Masalah:

User bisa mengirim:

```json
{
"name":"",
"price":-500
}
```

Database menerima data buruk.

---

## Buat validation middleware

```
middleware/
validateProduct.js
```

```jsx
export function validateProduct(req,res,next){

const {
name,
price
}=req.body;

if(!name){

return res.status(400).json({

message:"Name is required"

});

}

if(price <=0){

return res.status(400).json({

message:"Price must greater than 0"

});

}

next();

}
```

---

Gunakan pada route:

```jsx
router.post(
"/products",
validateProduct,
createProduct
);
```

Flow:

```
Request

 |
 v

Validation

 |
 |
 gagal
 |
 Response 400

 |
 sukses

Controller

 |
Database
```

---

# 7. 📖 READ Products

## GET Semua Produk

```
GET /products
```

Controller:

```jsx
export async function getProducts(req,res,next){

try{

const result =
await db.execute(
"SELECT * FROM products"
);

res.json(result.rows);

}catch(error){

next(error)

}

}
```

Response:

```json
[
{
"id":1,
"name":"Keyboard",
"price":850000
}
]
```

---

# 8. 🔎 GET Detail Product

Endpoint:

```
GET /products/1
```

Controller:

```jsx
export async function getProductById(req,res,next){

try{

const id=req.params.id;

const result=
await db.execute({

sql:
"SELECT * FROM products WHERE id=?",

args:[id]

});

if(result.rows.length===0){

return res.status(404)
.json({

message:"Product not found"

});

}

res.json(result.rows[0]);

}catch(error){

next(error)

}

}
```

---

# 9. ✏️ UPDATE Product

Endpoint:

```
PUT /products/:id
```

Request:

```json
{
"name":"Gaming Keyboard",
"price":1000000
}
```

SQL:

```jsx
UPDATE products

SET name=?,
price=?

WHERE id=?
```

Controller:

```jsx
export async function updateProduct(req, res, next) {
  try {
    const id = req.params.id;

    const { name, price } = req.body;

    await db.execute({
      sql: `

UPDATE products

SET name=?,
price=?

WHERE id=?

`,

      args: [name, price, id],
    });

    res.json({
      message: "Updated",
    });
  } catch (error) {
    next(error);
  }
}
```

---

# 10. 🗑️ DELETE Product

Endpoint:

```
DELETE /products/:id
```

Controller:

```jsx
export async function deleteProduct(req, res, next) {
  try {
    const id = req.params.id;

    await db.execute({
      sql: "DELETE FROM products WHERE id=?",

      args: [id],
    });

    res.json({
      message: "Deleted",
    });
  } catch (error) {
    next(error);
  }
}
```

---

# 11. 🚨 Error Handling Middleware

## Masalah tanpa middleware:

Setiap controller:

```jsx
res.status(500)
.json({
error:error.message
})
```

Akhirnya code berulang.

---

Solusi:

Central Error Handler

```
Request

 |

Controller

 |

next(error)

 |

Error Middleware

 |

JSON Response
```

---

## errorHandler.js

```jsx
export function errorHandler(
err,
req,
res,
next
){

console.error(err);

res.status(500)
.json({

success:false,

message:
"Internal Server Error"

});

}
```

---

Pasang di app.js

```jsx
app.use(errorHandler);
```

---

# 12. Standard Error Response

Aplikasi profesional biasanya punya format konsisten.

Success:

```json
{
"success":true,
"data":{
"id":1,
"name":"Keyboard"
}
}
```

Error:

```json
{
"success":false,
"error":{
"code":"PRODUCT_NOT_FOUND",
"message":"Product does not exist"
}
}
```

---

# 13. 🔐 SQL Injection

## ❌ Cara Berbahaya

```jsx
const sql =
`
SELECT *
FROM products
WHERE name='${name}'
`
```

User input:

```
' OR 1=1 --
```

Query menjadi:

```sql
SELECT *
FROM products
WHERE name=''
OR 1=1
```

Semua data keluar.

---

# ✅ Cara Aman

Gunakan parameter binding:

```jsx
db.execute({
  sql: "SELECT * FROM products WHERE name=?",

  args: [name],
});
```

Database akan memisahkan:

```
SQL Command

+

User Data
```

---

# 14. Praktik AI 🤖

## Prompt Gemini Code Review

Contoh:

```
Saya memiliki Express API berikut.

Tolong review:

1. Apakah ada SQL Injection?
2. Apakah validation sudah benar?
3. Apakah error handling sudah aman?
4. Apakah ada potensi bug?
5. Berikan rekomendasi best practice.

[Paste Controller Code]
```

---

## Contoh Output AI

Gemini mungkin menemukan:

### Issue:

```jsx
price=req.body.price
```

Tidak ada pengecekan tipe.

Recommendation:

```jsx
if(typeof price !== "number"){
throw Error("Invalid price")
}
```

---

# 15. Mini Project Practice

## Mini Store API

Buat API:

### Product

CRUD:

```
POST
/products

GET
/products

GET
/products/:id

PUT
/products/:id

DELETE
/products/:id
```

---

## Requirement

Validation:

| Field | Rule |
| --- | --- |
| name | wajib |
| price | angka > 0 |
| stock | tidak boleh negatif |
| category | optional |

---

## Error Case Testing

Coba:

### 1. Empty Name

Request:

```json
{
"name":"",
"price":10000
}
```

Expected:

```json
{
"message":
"Name is required"
}
```

---

### 2. Product Tidak Ada

```
GET /products/999
```

Expected:

```json
{
"message":
"Product not found"
}
```

---

### 3. Database Error

Simulasikan:

```jsx
SELECT abc
```

Expected:

```json
{
"success":false,
"message":
"Internal Server Error"
}
```

---

# 16. Pendalaman Mandiri

## Pertanyaan Diskusi

### 1. Kenapa validation dilakukan sebelum database?

Jawaban:

Karena database bukan tempat pertama untuk menyaring kesalahan.

Tanpa validation:

```
User
 |
 |
Database
 |
Data Rusak
```

Dengan validation:

```
User
 |
 |
Validation
 |
Database
 |
Data Bersih
```

---

### 2. Kenapa error handling dibuat middleware?

Karena:

- Code lebih bersih
- Response konsisten
- Mudah debugging
- Tidak duplikasi kode

---

# 🎯 Output Akhir Sesi

Setelah selesai peserta memiliki:

✅ Express REST API

✅ CRUD Product

✅ Turso Database Integration

✅ Input Validation

✅ Error Middleware

✅ SQL Injection Awareness

✅ AI Assisted Code Review Workflow

**Challenge lanjutan:**

Tambahkan:

- pagination `/products?page=1`
- search `/products?keyword=keyboard`
- sorting `/products?sort=price`
- authentication JWT untuk admin CRUD.