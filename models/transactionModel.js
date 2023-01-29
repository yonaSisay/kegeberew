const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Product must belong to a farmer']
    },
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Transaction must belong to a customer']
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Transaction must have a product']
    },
    quantity: {
        type: Number,
        required: [true, 'Transaction must have a quantity']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Transaction must have a total price']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    review: {
        type: String,
    },
    platformProfit: { type: Number, required: true },
    farmerProfit: { 
        type: Number, 
        default: this.totalPrice - this.platformProfit
     },
},{timestamps:true}
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
