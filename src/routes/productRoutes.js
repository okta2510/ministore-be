const express = require('express');
const { authenticateToken } = require('../../middleware');
const {
  listProductsHandler,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} = require('../controllers/productController');

const router = express.Router();

router.use(authenticateToken);
router.get('/', listProductsHandler);
router.get('/:id', getProductHandler);
router.post('/', createProductHandler);
router.put('/:id', updateProductHandler);
router.delete('/:id', deleteProductHandler);

module.exports = router;
