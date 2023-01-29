const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Product = require('../models/productModel')
const Transaction = require('../models/transactionModel')
const Notification = require('../models/notificationModel')
const User = require('../models/userModel')


exports.buyProduct = catchAsync(async (req,res,next) => {
    const product = await Product.findById(req.params.id)
    const farmer = await User.findById(product.owner)
    const customer = await User.findById(req.user._id)
    
    if(!product) return next(new AppError('No product found with that id'))
    if(!farmer) return next(new AppError('No farmer found with that id'))
    if(product.quantity < req.body.quantity) return next(new AppError('Not enough quantity'))
    if(product.price * req.body.quantity > req.user.money) return next(new AppError('Not enough money'))
    

    const platformProfit = 0.1 * product.price * req.body.quantity
    const farmerProfit = product.price * req.body.quantity - platformProfit
    
    farmer.money += farmerProfit
    customer.money -= product.price * req.body.quantity
    product.quantity -= req.body.quantity
    
    await farmer.save()
    await customer.save()
    await product.save()

    // Create a notification for the farmer
    
    const farmerNotification = await Notification.create({
        recipient: farmer._id,
        message: `You have successfully sold ${req.body.quantity} ${product.name} for a total of ${product.price * req.body.quantity}`
    });
    await farmerNotification.save();
    // Create a notification for the customer
    const customerNotification = await Notification.create({
        recipient: customer._id,
        message: `You have successfully purchased ${req.body.quantity} ${product.name} for a total of ${product.price * req.body.quantity}`
    });
    await customerNotification.save();


    const transaction = await Transaction.create({
        farmer: product.owner,
        customer: req.user._id,
        product: product._id,
        quantity: req.body.quantity,
        totalPrice: product.price * req.body.quantity,
        platformProfit: platformProfit,
        status: 'pending'
    })

    res.status(200).json({
        status: 'success',
        data: {
            transaction,
            message: 'Transaction created successfully'
        }
    })
})
