const mongoose = require('mongoose')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Product = require('../models/productModel')

exports.listActivateProducts = catchAsync(async (req, res, next) => {
    const products = await Product.find({ active:false });
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
});

exports.getProduct = catchAsync(async (req,res,next)=>{
    const product = await Product.findById(req.params.id);
    res.status(200).json({
        status:'success',
        data: {
            product
        }
    })
})