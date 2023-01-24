const express = require('express');
const farmerController = require('../controllers/farmerController');
const authController = require('../controllers/authController')
const { createProductCheck } = require('../middleware/validationCheck');

const router = express.Router();

router
  .route('/')
  .post(authController.protect,authController.restrictTo('admin', 'farmer'),createProductCheck,farmerController.createProduct);
// router.get('/listMyProducts', authMiddleware, productController.listMyProducts);
module.exports = router;
