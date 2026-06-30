# MiniStore Backend 🚀

Express.js + Turso SQL CRUD API with JWT Authentication

## Features

- ✅ **Turso SQLite Database** - Cloud-based SQLite or local file-based
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Complete CRUD API** - Full operations for products
- ✅ **Environment Configuration** - .env support
- ✅ **Password Hashing** - bcryptjs for secure passwords
- ✅ **Error Handling** - Comprehensive error management

## Prerequisites

- Node.js 14+
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

Create `.env` file with your settings:

```env
# Server
PORT=3001
NODE_ENV=development

# Database - Local SQLite
TURSO_CONNECTION_URL=file:local.db

# Or use Turso Cloud (get from https://turso.tech):
# TURSO_CONNECTION_URL=libsql://your-db.turso.io
# TURSO_AUTH_TOKEN=your-auth-token

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Default Credentials

**Username:** `operator`  
**Password:** `developer2510`

## API Documentation

### 1. Login (POST)

Get JWT token for authentication.

```bash
POST /login
Content-Type: application/json

{
  "username": "operator",
  "password": "developer2510"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "operator",
    "role": "admin"
  }
}
```

### 2. Get All Products (GET)

Requires authentication via `Authorization: Bearer <token>` header.

```bash
GET /products
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Laptop",
    "price": 1000,
    "description": "High-performance laptop for development",
    "created_at": "2024-06-30T10:00:00Z",
    "updated_at": "2024-06-30T10:00:00Z"
  }
]
```

### 3. Get Product by ID (GET)

```bash
GET /products/:id
Authorization: Bearer <your-jwt-token>
```

**Example:**
```bash
curl http://localhost:3001/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Create Product (POST)

```bash
POST /products
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "Keyboard",
  "price": 75,
  "description": "Mechanical keyboard with RGB"
}
```

**Response:**
```json
{
  "id": 3,
  "name": "Keyboard",
  "price": 75,
  "description": "Mechanical keyboard with RGB"
}
```

### 5. Update Product (PUT)

```bash
PUT /products/:id
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "Gaming Mouse",
  "price": 100,
  "description": "Updated description"
}
```

### 6. Delete Product (DELETE)

```bash
DELETE /products/:id
Authorization: Bearer <your-jwt-token>
```

## Testing Workflow

### Step 1: Login and Get Token

```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"developer2510"}'
```

**Copy the returned token**

### Step 2: Use Token for Protected Endpoints

```bash
TOKEN="your-token-here"

# Get all products
curl http://localhost:3001/products \
  -H "Authorization: Bearer $TOKEN"

# Create product
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Monitor","price":300,"description":"4K Monitor"}'
```

## Testing with Postman

1. **Login Request:**
   - Method: POST
   - URL: `http://localhost:3001/login`
   - Body (JSON): `{"username":"operator","password":"developer2510"}`
   - Copy the `token` from response

2. **Add Token to Headers:**
   - Create a new request for any protected endpoint
   - Headers tab → Add key: `Authorization` → Value: `Bearer <paste-token-here>`

3. **Test Endpoints:**
   - GET /products
   - POST /products
   - PUT /products/:id
   - DELETE /products/:id

## Project Structure

```
ministore-be/
├── index.js              # Main server with all endpoints
├── db.js                 # Database initialization & connection
├── middleware.js         # Authentication middleware
├── .env                  # Environment variables
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── local.db              # SQLite database (auto-created)
└── README.md             # This file
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Turso Cloud Setup (Optional)

1. Sign up at [turso.tech](https://turso.tech)
2. Create a database
3. Get connection URL and auth token
4. Update .env:
   ```env
   TURSO_CONNECTION_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-auth-token
   ```

## Scripts

```bash
npm start    # Run server
npm run dev  # Run with nodemon (auto-reload)
```

## Error Responses

**401 Unauthorized:**
```json
{ "message": "Access token required" }
```

**403 Forbidden:**
```json
{ "message": "Invalid or expired token" }
```

**404 Not Found:**
```json
{ "message": "Product not found" }
```

**500 Server Error:**
```json
{ "message": "Internal server error" }
```

## Security Notes

⚠️ **Production Checklist:**
- [ ] Change `JWT_SECRET` in .env
- [ ] Change default `operator` password
- [ ] Use Turso Cloud for better reliability
- [ ] Enable HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Add rate limiting
- [ ] Add input validation & sanitization
- [ ] Use secure CORS origins only

## Frontend Integration

### React Example
```javascript
// Login
const response = await fetch('http://localhost:3001/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'operator', password: 'developer2510' })
});
const { token } = await response.json();

// Store token in localStorage
localStorage.setItem('token', token);

// Get products
const products = await fetch('http://localhost:3001/products', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});
```

---

Created from Express.js Foundation + Turso SQL Integration
