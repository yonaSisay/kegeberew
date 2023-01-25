const express = require('express')
const custController = require('../controllers/customerController')
const authController = require('../controllers/authController')
const router = express.Router()

router
    .route('/')
    .get(custController.getAllProducts)
router
    .route('/:id')
    .get(custController.getProduct)
