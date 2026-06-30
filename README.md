# MiniStore Backend 🚀

Express.js CRUD API for MiniStore products management

## Features

- ✅ Express.js server with CORS
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ In-memory data storage
- ✅ Request/Response validation
- ✅ Error handling middleware

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Get All Products
```bash
GET /products
```

**Response:**
```json
[
  { "id": 1, "name": "Laptop", "price": 1000 },
  { "id": 2, "name": "Mouse", "price": 50 }
]
```

### Get Product by ID
```bash
GET /products/:id
```

**Example:**
```bash
curl http://localhost:3001/products/1
```

**Response:**
```json
{ "id": 1, "name": "Laptop", "price": 1000 }
```

### Create Product (POST)
```bash
POST /products
Content-Type: application/json

{
  "name": "Keyboard",
  "price": 75
}
```

**Response:**
```json
{ "id": 3, "name": "Keyboard", "price": 75 }
```

### Update Product (PUT)
```bash
PUT /products/:id
Content-Type: application/json

{
  "name": "Gaming Mouse",
  "price": 100
}
```

**Response:**
```json
{ "id": 2, "name": "Gaming Mouse", "price": 100 }
```

### Delete Product
```bash
DELETE /products/:id
```

**Response:**
```json
{ "message": "Product deleted successfully" }
```

## Testing with cURL

```bash
# Get all products
curl http://localhost:3001/products

# Get product by ID
curl http://localhost:3001/products/1

# Create product
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Headphones", "price": 200}'

# Update product
curl -X PUT http://localhost:3001/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Gaming Laptop", "price": 1500}'

# Delete product
curl -X DELETE http://localhost:3001/products/1
```

## Testing with Postman

1. Import endpoints or create manually
2. Set request method and URL
3. For POST/PUT: Set header `Content-Type: application/json` and add JSON body
4. Send request

## Project Structure

```
ministore-be/
├── index.js           # Main server file with all CRUD endpoints
├── package.json       # Project dependencies and scripts
├── README.md          # This file
└── node_modules/      # Dependencies
```

## Middleware

- **CORS**: Enables frontend (React/Next.js) to access backend
- **express.json()**: Automatically parses JSON request bodies

## Data Model

Products have the following structure:
```javascript
{
  id: Number,
  name: String,
  price: Number
}
```

## Next Steps (Frontend Integration)

When building React/Next.js frontend, connect with:
```javascript
const response = await fetch('http://localhost:3001/products');
const data = await response.json();
```

---

Created from Express.js Foundation Tutorial
