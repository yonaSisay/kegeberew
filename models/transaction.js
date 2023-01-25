const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Farmer',
        required: [true, 'Transaction must belong to a farmer']
    },
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
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
    platformProfit: { type: Number, required: true },
},{timestamps:true}
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
