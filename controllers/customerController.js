const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Product = require('../models/productModel')

exports.getAllProducts = catchAsync(async (req,res,next) =>{
    let query = {}
    if (req.query.search) {
        query.name = new RegExp(req.query.search, "i");
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        const sortBy = parts[0]
        const order = parts[1] === 'desc' ? -1: 1;
        query = query.sort({[sortBy]: order})
    }

    const products = await Product.find(query);
    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });
})
exports.getProduct = catchAsync(async (req,res,next) => {
   const product = await Product.findById(req.params.id)
   if(!product) return next(new AppError('No product found with that id'))

   res.status(200).json({
    status: 'success',
    data: {
        product
    }
   })
})
