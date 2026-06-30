# MiniStore Backend - Complete Project Index

## 📚 Documentation Files

### Quick References
- **QUICKSTART.md** - 30-second setup & common tasks
- **README.md** - Complete API documentation with all endpoints
- **SCHEMA.md** - Database design with ERD and sample queries
- **TURSO.md** - Turso Cloud setup instructions
- **SETUP.md** - Detailed installation & troubleshooting

### This File
- **INDEX.md** - Project overview (you are here)

---

## 💻 Source Code Files

### Core Application
- **index.js** - Main Express server with all CRUD endpoints & login
- **db.js** - Turso database connection & initialization
- **middleware.js** - JWT authentication middleware

### Database Seeding
- **seed.js** - Initialize new database with schema & sample data

### Configuration
- **.env** - Environment variables (git ignored)
- **.env.example** - Configuration template
- **.gitignore** - Git rules

---

## 📦 Dependencies

### Production
```json
{
  "express": "^4.x",
  "@libsql/client": "^0.17.4",
  "cors": "^2.x",
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^3.0.3",
  "dotenv": "^17.4.2"
}
```

### Development
- **nodemon** - Auto-reload during development

---

## 🎯 Quick Start Commands

```bash
# Install dependencies
npm install

# Initialize database with schema & sample data
npm run seed

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

---

## 🗄️ Database Schema

### Tables
1. **users** - User accounts with roles
2. **products** - Product inventory with categories
3. **orders** - Customer orders
4. **order_items** - Items within orders

### Features
- Foreign key relationships
- Automatic timestamps (created_at, updated_at)
- Role-based access (admin/user)
- Stock inventory tracking
- Order status management

---

## 🔐 Authentication

### Default Credentials
| User | Password | Role |
|------|----------|------|
| operator | developer2510 | admin |
| customer | user1234 | user |

### How It Works
1. POST /login → Get JWT token
2. Store token in localStorage
3. Add `Authorization: Bearer <token>` to protected endpoints
4. Tokens expire after 24 hours

---

## 📡 API Endpoints

### Public
- `POST /login` - Get JWT token

### Protected (require auth)
- `GET /products` - Get all products
- `GET /products/:id` - Get specific product
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

---

## 🌐 Environment Configuration

```env
# Server
PORT=3001
NODE_ENV=development

# Database
TURSO_CONNECTION_URL=file:local.db
TURSO_AUTH_TOKEN=

# Security
JWT_SECRET=change-in-production

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 📊 Sample Data

### Users (2)
- operator (admin) - password: developer2510
- customer (user) - password: user1234

### Products (8)
- Laptop Pro 15
- Wireless Mouse
- Mechanical Keyboard
- 4K Monitor
- Wireless Headphones
- USB-C Hub
- Webcam 4K
- Desk Lamp LED

### Orders (1)
- Sample completed order with 2 items

---

## 🚀 Deployment Options

### Local Development
```bash
npm run seed
npm run dev
```
Uses: SQLite file at `local.db`

### Turso Cloud
```bash
# 1. Create Turso account at turso.tech
# 2. Create database
# 3. Get connection URL & token
# 4. Update .env
npm run seed
npm start
```

---

## 📁 Project Structure

```
ministore-be/
├── Core Application
│   ├── index.js              Main server
│   ├── db.js                 Database connection
│   ├── middleware.js         Auth middleware
│   └── seed.js               Database initialization
├── Configuration
│   ├── .env                  Environment vars
│   ├── .env.example          Template
│   ├── .gitignore            Git rules
│   └── package.json          Dependencies
├── Documentation
│   ├── README.md             API reference
│   ├── SCHEMA.md             Database design
│   ├── TURSO.md              Cloud setup
│   ├── SETUP.md              Installation
│   ├── QUICKSTART.md         Quick reference
│   └── INDEX.md              This file
└── Dependencies
    └── node_modules/         Installed packages
```

---

## 🎓 Learning Path

### 1. Quick Start (5 minutes)
- Read: QUICKSTART.md
- Run: `npm run seed` → `npm run dev`
- Test: Login and get products

### 2. Understanding API (15 minutes)
- Read: README.md
- Try all endpoints in Postman
- Review response formats

### 3. Database Design (20 minutes)
- Read: SCHEMA.md
- Review tables and relationships
- Try sample SQL queries

### 4. Cloud Setup (30 minutes)
- Read: TURSO.md
- Create Turso account
- Set up cloud database

### 5. Deep Dive (ongoing)
- Review source code
- Customize schema
- Add features

---

## 🔧 Common Development Tasks

### Change Port
Edit `.env`: `PORT=3002`

### Reset Database
```bash
npm run seed
```

### Query Database
```bash
# Local
sqlite3 local.db "SELECT * FROM products;"

# Turso Cloud
turso db shell ministore-prod
```

### View Logs
```bash
npm run dev
# Logs appear in terminal
```

### Debug Seed Script
```bash
npm run seed 2>&1
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Cannot find module | `npm install` |
| Port 3001 already in use | Change PORT in .env or `lsof -ti:3001 \| xargs kill -9` |
| Database locked | Close other connections, try again |
| Token invalid | Login again: `POST /login` |
| Product not found | Check product ID exists: `GET /products` |

---

## ✅ Checklist for Production

- [ ] Change JWT_SECRET in .env
- [ ] Change default passwords
- [ ] Use Turso Cloud database
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Set secure CORS_ORIGIN
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Set up monitoring
- [ ] Regular backups

---

## 📖 External Resources

- [Express.js Docs](https://expressjs.com/)
- [Turso Docs](https://docs.turso.tech/)
- [SQLite Docs](https://www.sqlite.org/)
- [JWT.io](https://jwt.io/)
- [bcryptjs Docs](https://github.com/dcodeIO/bcrypt.js)

---

## 🤝 File Relationships

```
User Request
    ↓
middleware.js → Verify JWT token
    ↓
index.js → Route to endpoint
    ↓
db.js → Connect to Turso/SQLite
    ↓
seed.js → Create schema (one-time)
    ↓
Database (local.db or Turso Cloud)
```

---

## 📝 Notes

- All passwords are bcrypt hashed
- Tokens expire after 24 hours
- Cascade deletes for referential integrity
- Local SQLite for development
- Turso Cloud for production
- Git safely ignores .env and node_modules

---

## 🎉 You're All Set!

This project includes:
✅ Complete REST API
✅ JWT Authentication
✅ Database with 4 tables
✅ Sample data ready to go
✅ Comprehensive documentation
✅ Local & cloud support

**Start here:** Run `npm run seed` then `npm run dev` 🚀

---

**Last updated:** 2024-06-30
**Version:** 1.0.0
**Status:** Production Ready ✨
