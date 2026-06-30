# Turso Database Setup Guide

## 🚀 Quick Start with Local SQLite

The project uses **local SQLite by default** (`file:local.db`). No setup required!

```bash
npm run seed      # Initialize schema with sample data
npm run dev       # Start server
```

---

## ☁️ Setting Up Turso Cloud

### Step 1: Create Turso Account
1. Go to [turso.tech](https://turso.tech)
2. Sign up with GitHub or email
3. Verify your account

### Step 2: Create Database
```bash
# Install Turso CLI (macOS)
brew install chiselstrike/tap/turso

# Or use npm
npm install -g @tursodatabase/cli

# Login
turso auth login

# Create a new database
turso db create ministore-prod

# Get connection details
turso db show ministore-prod
```

### Step 3: Get Connection URL & Token
```bash
# Get connection URL
turso db show ministore-prod
# Output: Connection URL: libsql://ministore-prod-username.turso.io

# Generate auth token
turso db tokens create ministore-prod
# Output: Token: eyJhbGciOiJFZEdTNTEyIiwidHlwIjoiSldUIn0...
```

### Step 4: Update .env
```bash
# Copy and update your .env file
TURSO_CONNECTION_URL=libsql://ministore-prod-username.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZEdTNTEyIiwidHlwIjoiSldUIn0...
```

### Step 5: Seed the Database
```bash
npm run seed
```

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  stock INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Orders Table
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_price REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
)
```

---

## 🌱 Seed Data

Running `npm run seed` creates:

### Users
| Username | Password | Role |
|----------|----------|------|
| operator | developer2510 | admin |
| customer | user1234 | user |

### Products
- 8 sample products across 4 categories:
  - Computers (Laptop Pro 15)
  - Accessories (Mouse, Keyboard, USB Hub, Lamp)
  - Displays (4K Monitor)
  - Audio (Headphones, Webcam)

### Sample Order
- 1 completed order with 2 items

---

## 📝 Running Migrations

### Reset Everything (Drop & Recreate)
```bash
npm run seed
```

### Manual Queries
```bash
# Access SQLite locally
sqlite3 local.db

# Access Turso Cloud
turso db shell ministore-prod
```

---

## 🔄 Switching Between Environments

### Local Development
```bash
# .env
TURSO_CONNECTION_URL=file:local.db
TURSO_AUTH_TOKEN=
```

### Turso Cloud Staging
```bash
# .env
TURSO_CONNECTION_URL=libsql://staging-db.turso.io
TURSO_AUTH_TOKEN=staging-token
```

### Turso Cloud Production
```bash
# .env
TURSO_CONNECTION_URL=libsql://prod-db.turso.io
TURSO_AUTH_TOKEN=prod-token
```

---

## 🛠️ Common Commands

```bash
# Seed database
npm run seed

# View Turso databases
turso db list

# View database shell access
turso db shell ministore-prod

# Create backup
turso db backup create ministore-prod

# List backups
turso db backup list ministore-prod

# Delete database
turso db destroy ministore-prod
```

---

## 📊 Checking Database Status

### Local
```bash
# Check if local.db exists
ls -lh local.db

# Query with SQLite
sqlite3 local.db "SELECT COUNT(*) FROM products;"
```

### Turso Cloud
```bash
# Check database status
turso db show ministore-prod

# Check usage
turso db usage ministore-prod

# List database members
turso db members list ministore-prod
```

---

## 🔐 Security Notes

⚠️ **Keep tokens safe:**
- Never commit `.env` to git
- Don't share `TURSO_AUTH_TOKEN`
- Use `.env.local` for sensitive data
- Rotate tokens periodically

**Production Checklist:**
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Monitor database usage
- [ ] Regular backups
- [ ] Separate prod/staging databases

---

## 🆘 Troubleshooting

### Issue: "Cannot authenticate with Turso"
```bash
# Verify token
echo $TURSO_AUTH_TOKEN

# Re-login
turso auth logout
turso auth login
```

### Issue: "Connection refused"
```bash
# Check internet connection
# Verify TURSO_CONNECTION_URL is correct
# For local: use file:local.db
```

### Issue: "Database locked"
```bash
# Close other connections
# Try again in a few moments
```

### Issue: Seed script fails
```bash
# Make sure .env exists
# Check TURSO_CONNECTION_URL is valid
# npm run seed
```

---

## 📚 Resources

- [Turso Docs](https://docs.turso.tech/)
- [Turso CLI Reference](https://docs.turso.tech/reference/cli)
- [SQLite Docs](https://www.sqlite.org/lang.html)
- [libsql-client](https://github.com/tursodatabase/libsql-client-js)

---

## 🎯 Next Steps

1. **For Local Development:**
   ```bash
   npm run seed
   npm run dev
   ```

2. **For Cloud Deployment:**
   ```bash
   # Create Turso database
   turso db create ministore-prod
   
   # Update .env with credentials
   # Then:
   npm run seed
   npm start
   ```

3. **Connect Frontend:**
   - Login endpoint: `POST /login`
   - Protected endpoints: Add `Authorization: Bearer <token>`

---

**Happy coding! 🚀**
