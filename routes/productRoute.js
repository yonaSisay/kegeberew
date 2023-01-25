const express = require('express');
const farmerController = require('../controllers/farmerController');
const authController = require('../controllers/authController')
const { createProductCheck } = require('../middleware/validationCheck');

const router = express.Router();
//Farmer route
router
  .route('/')
  .post(authController.protect,authController.restrictTo('admin', 'farmer'),
  farmerController.uploadProductPhoto,farmerController.resizeProductPhoto,createProductCheck,farmerController.createProduct);
router
  .get('/listMyProducts', authController.protect,authController.restrictTo('farmer'), farmerController.listMyProducts);
router
  .route('/:id')
  .patch(authController.protect,authController.restrictTo('farmer'),farmerController.uploadProductPhoto,farmerController.resizeProductPhoto,farmerController.updateProduct)
  .delete(authController.protect,authController.restrictTo('farmer'),farmerController.deleteProduct)

// then next the i will create the admin part that will activate the product to be sold 
// and see the transaction data from the customer to the farmer so that we increase every time our amount of money
module.exports = router;
