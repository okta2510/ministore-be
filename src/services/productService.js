const { getClient } = require('../../db');
const { ApiError } = require('../helpers/apiError');

const mapProduct = (row) => ({
  id: row.id,
  name: row.name,
  price: row.price,
  description: row.description,
  stock: row.stock,
  category: row.category,
  image_url: row.image_url,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const listProducts = async ({ page = 1, limit = 5 } = {}) => {
  const db = getClient();
  const offset = (page - 1) * limit;

  const totalResult = await db.execute('SELECT COUNT(*) AS total FROM Product');
  const totalItems = Number(totalResult.rows[0]?.total ?? 0);
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  const result = await db.execute(
    'SELECT * FROM Product ORDER BY id ASC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  return {
    data: result.rows.map(mapProduct),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

const getProductById = async (id) => {
  const db = getClient();
  const result = await db.execute('SELECT * FROM Product WHERE id = ? LIMIT 1', [id]);
  const product = result.rows[0];
  if (!product) throw new ApiError(404, 'Product not found');
  return mapProduct(product);
};

const createProduct = async (payload) => {
  const db = getClient();
  const result = await db.execute(
    `INSERT INTO Product (name, price, description, stock, category, image_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.price,
      payload.description ?? null,
      payload.stock ?? 0,
      payload.category ?? null,
      payload.image_url ?? null,
    ]
  );

  return getProductById(result.lastInsertRowid);
};

const updateProduct = async (id, payload) => {
  const existing = await getProductById(id);
  const db = getClient();

  await db.execute(
    `UPDATE Product
     SET name = ?, price = ?, description = ?, stock = ?, category = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      payload.name ?? existing.name,
      payload.price ?? existing.price,
      payload.description ?? existing.description,
      payload.stock ?? existing.stock,
      payload.category ?? existing.category,
      payload.image_url ?? existing.image_url,
      id,
    ]
  );

  return getProductById(id);
};

const deleteProduct = async (id) => {
  await getProductById(id);
  const db = getClient();
  await db.execute('DELETE FROM Product WHERE id = ?', [id]);
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
