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
- `/products` — Fetches and displays products from `http://localhost:3001/products` in a table

## API

Axios is configured in `src/api/axios.js` with `baseURL: http://localhost:3001`.

### Products

- `getProducts()` — GET /products

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
    │   └── example.js     # API functions
    └── components/
        ├── Products.jsx   # Table UI for products
        └── Example.jsx    # Example component
```