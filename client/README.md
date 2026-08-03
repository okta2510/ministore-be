# Ministore Client

React frontend for the Ministore API. Displays products in a styled table with Tailwind CSS and React Router.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The dev server runs on `http://localhost:3000` and proxies `/api` and `/products` requests to `http://localhost:3001`.

## Build

```bash
npm run build
```

## Tech Stack

- **React 18** — UI library
- **React Router DOM v6** — client-side routing
- **Tailwind CSS v4** — utility-first styling
- **Axios** — HTTP client
- **Vite** — build tool and dev server

## Routing

- `/` — Home page
- `/products` — Displays products in a CRUD table with create/edit/delete modals

## Auth

Write operations (create, update, delete) require the `adminkey` header. The admin key (`secret123`) is stored in `localStorage` under `adminKey` and automatically attached to all API requests via an Axios request interceptor defined in `src/api/axios.js`.

## API

Axios is configured in `src/api/axios.js` with `baseURL: http://localhost:3001`.

### Products

Located in `src/api/products.js`.

- `getProducts()` — GET /products
- `getProductById(id)` — GET /products/:id
- `createProduct(data)` — POST /products (admin key required)
- `updateProduct(id, data)` — PUT /products/:id (admin key required)
- `deleteProduct(id)` — DELETE /products/:id (admin key required)

### Items

- `getItems()` — GET /items
- `getItemById(id)` — GET /items/:id
- `createItem(data)` — POST /items
- `updateItem(id, data)` — PUT /items/:id
- `deleteItem(id)` — DELETE /items/:id

## Project Structure

```
client/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── .gitignore
├── README.md
└── src/
    ├── index.jsx          # React entry point
    ├── index.css          # Tailwind CSS entry
    ├── App.jsx            # Root component with routing
    ├── api/
    │   ├── axios.js       # Axios instance with interceptors
    │   ├── example.js     # API functions
    │   └── products.js    # Product CRUD API functions
    └── components/
        ├── Products.jsx       # CRUD table UI for products
        ├── ProductModal.jsx   # Modal form for create/edit
        └── Example.jsx        # Example component
```

## Features

- **Products Table** — fetches from `GET http://localhost:3001/products` and displays in a styled table with columns: ID, Name, Category, Description, Price, Tags, Actions
- **Create Product** — "Add Product" button opens a modal form (requires admin key)
- **Update Product** — "Edit" button opens a pre-filled modal form (requires admin key)
- **Delete Product** — "Delete" button removes a product with confirmation (requires admin key)
- **Price formatting** — Indonesian Rupiah (IDR) format
- **Tailwind CSS** — responsive, hover effects, badges for category and tags
- **Axios interceptors** — automatic admin key attachment and error handling
- **Vite proxy** — `/api` requests proxied to port 3001