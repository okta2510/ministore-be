# MiniStore Backend

Express + Turso SQL API with JWT auth, organized into routes, controllers, and services.

## Features

- JWT authentication
- Modular Express structure
- Turso/local SQLite support
- CRUD for products
- Pagination for product list
- Schema-based endpoints

## Setup

```bash
npm install
```

Create `.env`:

```env
PORT=3001
NODE_ENV=development
TURSO_CONNECTION_URL=file:local.db
TURSO_AUTH_TOKEN=
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:3000
```

Run:

```bash
npm run seed
npm run dev
```

The seed script creates:

- 2 users
- 15 sample products
- 1 sample order

## Default login

- Email: `operator@example.com`
- Password: `developer2510`

## API

### POST `/login`

Request:

```json
{
  "email": "operator@example.com",
  "password": "developer2510"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "operator@example.com",
    "role": "admin"
  }
}
```

curl:

```bash
curl -X POST http://localhost:3001/login -H "Content-Type: application/json" -d '{"email":"operator@example.com","password":"developer2510"}'
```

Use the returned token for POST, PUT, and DELETE requests:

```bash
Authorization: Bearer <your-token>
```

### GET `/products`

Returns paginated products.

Query params:

- `page` default: `1`
- `limit` default: `5`

curl:

```bash
curl "http://localhost:3001/products?page=1&limit=5"
```

Response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

### GET `/products/:id`

Returns one product.

curl:

```bash
curl http://localhost:3001/products/1
```

### POST `/products`

Request:

```json
{
  "name": "Keyboard",
  "price": 75,
  "category": "Accessories",
  "stock": 10,
  "description": "Mechanical keyboard",
  "image_url": "https://example.com/keyboard.png"
}
```

curl:

```bash
curl -X POST http://localhost:3001/products -H "Content-Type: application/json" -H "Authorization: Bearer <your-token>" -d '{"name":"Keyboard","price":75,"category":"Accessories","stock":10,"description":"Mechanical keyboard","image_url":"https://example.com/keyboard.png"}'
```

### PUT `/products/:id`

Updates a product with the same fields as create.

curl:

```bash
curl -X PUT http://localhost:3001/products/1 -H "Content-Type: application/json" -H "Authorization: Bearer <your-token>" -d '{"name":"Gaming Keyboard","price":99,"stock":8}'
```

### DELETE `/products/:id`

Deletes a product.

curl:

```bash
curl -X DELETE http://localhost:3001/products/1 -H "Authorization: Bearer <your-token>"
```

Only POST, PUT, and DELETE `/products` routes require `Authorization: Bearer <your-token>`.

## Schema

### User

- id
- name
- email
- password
- role
- status
- created_at

### Product

- id
- name
- price
- category
- stock
- description
- image_url
- created_at

### Order

- id
- user_id
- total_price
- status
- created_at

### Order_Product

- order_id
- product_id
- quantity

## Project structure

```text
index.js
db.js
middleware.js
seed.js
src/
  app.js
  controllers/
  routes/
  services/
  helpers/
```
