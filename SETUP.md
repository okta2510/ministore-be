# 🚀 MiniStore Backend - Setup & Usage Guide

## ✅ What's Installed

### Core Dependencies
- **express** - Web framework
- **cors** - Cross-origin requests
- **@libsql/client** - Turso SQLite database client
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management

### Dev Dependencies
- **nodemon** - Auto-reload during development

## 📁 Project Files

```
ministore-be/
├── index.js              # Main server + all CRUD endpoints
├── db.js                 # Database initialization & Turso connection
├── middleware.js         # JWT authentication middleware
├── .env                  # Your configuration (git ignored)
├── .env.example          # Configuration template
├── .gitignore            # Git rules (protects .env, node_modules)
├── package.json          # Dependencies & scripts
├── README.md             # Complete API documentation
├── SETUP.md              # This file
└── test-api.sh           # Bash script to test API
```

## 🔧 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

You'll see:
```
🔄 Initializing database...
✅ Default admin user created: operator/developer2510
✅ Sample products inserted
✅ Database initialized successfully
✅ Server running on http://localhost:3001
```

### 3. Test Login
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"developer2510"}'
```

**Response includes your JWT token!**

## 🔐 Authentication Flow

1. **Login** → GET JWT token
2. **Store** → Save token in localStorage (frontend)
3. **Use** → Add `Authorization: Bearer <token>` header to protected endpoints
4. **Refresh** → Token valid for 24 hours

## 📡 API Endpoints Summary

### Public
- `POST /login` - Get JWT token (no auth required)

### Protected (require JWT token)
- `GET /products` - Get all products
- `GET /products/:id` - Get specific product
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

## 🗄️ Database

### Local SQLite (Default)
- Stored in `local.db`
- Perfect for development
- No setup required!

### Turso Cloud (Optional)
1. Sign up: https://turso.tech
2. Create database
3. Update .env with credentials:
```env
TURSO_CONNECTION_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

## 📚 API Testing

### Using cURL
```bash
# 1. Get token
TOKEN=$(curl -s -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"developer2510"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Use token
curl http://localhost:3001/products \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman
1. Create POST request to `/login` with credentials
2. Copy token from response
3. Create new request with header `Authorization: Bearer <token>`
4. Test any protected endpoint

### Using Test Script
```bash
chmod +x test-api.sh
./test-api.sh
```

## 🔐 Environment Variables

Edit `.env`:
```env
PORT=3001                              # Server port
NODE_ENV=development                   # dev/production
TURSO_CONNECTION_URL=file:local.db    # Database URL
TURSO_AUTH_TOKEN=                     # For cloud (optional)
JWT_SECRET=your-secret-key            # Change in production!
CORS_ORIGIN=http://localhost:3000     # Your frontend URL
```

## 🚨 Default Credentials

| Field | Value |
|-------|-------|
| **Username** | `operator` |
| **Password** | `developer2510` |
| **Role** | `admin` |

⚠️ **Change these in production!**

## 🐛 Common Issues

### Issue: "Cannot find module '@libsql/client'"
**Solution:** Run `npm install`

### Issue: "Port 3001 already in use"
**Solution:** 
- Kill process: `lsof -ti:3001 | xargs kill -9`
- Or change PORT in .env

### Issue: "Invalid token" on protected endpoints
**Solution:** 
- Make sure to include full header: `Authorization: Bearer <token>`
- Token expires after 24 hours (login again)

### Issue: "Product not found" on update/delete
**Solution:** Check product ID exists first with GET /products/:id

## 📊 Database Tables

### Users
- id (integer, primary key)
- username (string, unique)
- password (string, hashed)
- role (string: 'admin', 'user')
- created_at (timestamp)

### Products
- id (integer, primary key)
- name (string)
- price (number)
- description (text, optional)
- created_at (timestamp)
- updated_at (timestamp)

## 🎯 Next Steps

1. **Test the API** using test script or Postman
2. **Connect Frontend** - Follow README.md frontend integration section
3. **Add More Users** - Modify db.js initializeDatabase() function
4. **Customize Products** - Add fields to products table schema
5. **Deploy** - Use Turso Cloud + Node hosting (Railway, Heroku, etc.)

## 📖 Resources

- [Express.js Docs](https://expressjs.com/)
- [Turso Docs](https://docs.turso.tech/)
- [JWT Intro](https://jwt.io/introduction)
- [bcryptjs Docs](https://github.com/dcodeIO/bcrypt.js)

## 💡 Production Checklist

- [ ] Change JWT_SECRET
- [ ] Change operator password in db.js
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Use Turso Cloud database
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Set CORS_ORIGIN to your domain only
- [ ] Add database backups
- [ ] Monitor server logs

---

**Questions?** Check README.md or revisit the code comments! 🚀
