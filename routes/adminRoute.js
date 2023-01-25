const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController')
const router = express.Router()

router
    .route('/')
    .get(authController.protect,authController.restrictTo('admin'),adminController.DeactiveProducts)
router
    .route('/:id')
    .get(authController.protect,authController.restrictTo('admin'),adminController.getProduct)
    .patch(authController.protect,authController.restrictTo('admin'),adminController.updateProduct)
    
