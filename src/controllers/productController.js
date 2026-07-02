const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../services/productService');
const { ApiError } = require('../helpers/apiError');
const { isNonEmptyString, toNumber } = require('../helpers/validators');

const validateProductPayload = (body, partial = false) => {
  const price = body.price !== undefined ? toNumber(body.price) : undefined;
  const stock = body.stock !== undefined ? toNumber(body.stock) : undefined;

  if (!partial) {
    if (!isNonEmptyString(body.name)) throw new ApiError(400, 'Name is required');
    if (price === null || price === undefined) throw new ApiError(400, 'Price is required');
  }

  if (price === null) throw new ApiError(400, 'Price must be a valid number');
  if (stock === null) throw new ApiError(400, 'Stock must be a valid number');

  return {
    name: body.name?.trim(),
    price,
    description: body.description,
    stock,
    category: body.category,
    image_url: body.image_url,
  };
};

const listProductsHandler = async (req, res, next) => {
  try {
    res.json(await listProducts());
  } catch (error) {
    next(error);
  }
};

const getProductHandler = async (req, res, next) => {
  try {
    res.json(await getProductById(Number(req.params.id)));
  } catch (error) {
    next(error);
  }
};

const createProductHandler = async (req, res, next) => {
  try {
    const payload = validateProductPayload(req.body);
    res.status(201).json(await createProduct(payload));
  } catch (error) {
    next(error);
  }
};

const updateProductHandler = async (req, res, next) => {
  try {
    const payload = validateProductPayload(req.body, true);
    res.json(await updateProduct(Number(req.params.id), payload));
  } catch (error) {
    next(error);
  }
};

const deleteProductHandler = async (req, res, next) => {
  try {
    await deleteProduct(Number(req.params.id));
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProductsHandler,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
};
