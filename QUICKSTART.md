# 🚀 MiniStore - Quick Start Guide

## ⚡ 30-Second Setup

### 1. Install & Seed
```bash
npm install
npm run seed
```

### 2. Start Server
```bash
npm run dev
```

### 3. Login & Test
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"developer2510"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Get products
curl http://localhost:3001/products \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Complete Workflow

### With Postman
1. **POST /login**
   - Body: `{"username":"operator","password":"developer2510"}`
   - Copy token from response

2. **GET /products**
   - Header: `Authorization: Bearer <paste-token>`
   - See all 8 sample products

3. **POST /products**
   - Header: `Authorization: Bearer <paste-token>`
   - Body: `{"name":"iPad","price":599,"description":"Tablet"}`
   - Create new product

---

## 🗄️ Database Setup

### Local (Default)
```bash
npm run seed
```
Creates `local.db` with schema + sample data

### Turso Cloud
1. Create account: https://turso.tech
2. Create database
3. Get connection URL & token
4. Update .env:
   ```
   TURSO_CONNECTION_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   ```
5. Run: `npm run seed`

---

## 📖 File Guide

| File | Purpose |
|------|---------|
| `index.js` | Main API server |
| `seed.js` | Database initialization |
| `db.js` | Database connection |
| `middleware.js` | JWT authentication |
| `README.md` | Full API docs |
| `SCHEMA.md` | Database structure |
| `TURSO.md` | Cloud setup guide |
| `.env` | Configuration |

---

## 🔐 Credentials

**Admin Account:**
- Username: `operator`
- Password: `developer2510`
- Role: `admin`

**Customer Account:**
- Username: `customer`
- Password: `user1234`
- Role: `user`

---

## 🎯 API Endpoints

```
POST   /login              Get JWT token
GET    /products           Get all products
GET    /products/:id       Get product by ID
POST   /products           Create product
PUT    /products/:id       Update product
DELETE /products/:id       Delete product
```

All endpoints except `/login` require `Authorization: Bearer <token>`

---

## 🔧 Common Tasks

### View Database
```bash
# Local
sqlite3 local.db

# Turso Cloud
turso db shell ministore-prod
```

### Reset Database
```bash
npm run seed
```

### Check Server Status
```bash
curl http://localhost:3001/
```

### Change Port
Edit `.env`: `PORT=3002`

---

## 🚨 Troubleshooting

**"Cannot find module"**
→ Run: `npm install`

**"Port 3001 already in use"**
→ Change PORT in .env or kill process: `lsof -ti:3001 | xargs kill -9`

**"Token invalid"**
→ Login again: `POST /login`

**"Product not found"**
→ Check product ID exists: `GET /products`

---

## 📱 Frontend Integration

```javascript
// Login
const response = await fetch('http://localhost:3001/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'operator', password: 'developer2510' })
});
const { token } = await response.json();
localStorage.setItem('token', token);

// Get products
const products = await fetch('http://localhost:3001/products', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});
```

---

## 📊 Sample Data

**8 Products:**
- Laptop Pro 15 ($1299.99)
- Wireless Mouse ($49.99)
- Mechanical Keyboard ($129.99)
- 4K Monitor ($599.99)
- Wireless Headphones ($199.99)
- USB-C Hub ($79.99)
- Webcam 4K ($149.99)
- Desk Lamp LED ($59.99)

---

## 🎓 Learn More

- Full docs: `README.md`
- Database schema: `SCHEMA.md`
- Turso setup: `TURSO.md`
- Complete setup: `SETUP.md`

---

**Ready? Run `npm run dev` 🚀**
