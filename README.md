# MiniStore Backend

Express + Turso SQL API with JWT auth, organized into routes, controllers, and services.

## Features

- JWT authentication
- Modular Express structure
- Turso/local SQLite support
- CRUD for products
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
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@example.com","password":"developer2510"}'
```

### GET `/products`

Returns all products.

curl:

```bash
curl http://localhost:3001/products \
  -H "Authorization: Bearer <token>"
```

### GET `/products/:id`

Returns one product.

curl:

```bash
curl http://localhost:3001/products/1 \
  -H "Authorization: Bearer <token>"
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
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name":"Keyboard",
    "price":75,
    "category":"Accessories",
    "stock":10,
    "description":"Mechanical keyboard",
    "image_url":"https://example.com/keyboard.png"
  }'
```

### PUT `/products/:id`

Updates a product with the same fields as create.

curl:

```bash
curl -X PUT http://localhost:3001/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name":"Gaming Keyboard",
    "price":99,
    "stock":8
  }'
```

### DELETE `/products/:id`

Deletes a product.

curl:

```bash
curl -X DELETE http://localhost:3001/products/1 \
  -H "Authorization: Bearer <token>"
```

All `/products` routes require `Authorization: Bearer <token>`.

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
