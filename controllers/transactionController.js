const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Product = require("../models/productModel");
const Transaction = require("../models/transactionModel");
const Notification = require("../models/notificationModel");
const User = require("../models/user");
const Platform = require("../models/platformModel");

exports.buyProduct = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	const farmer = await User.findById(product.owner);
	const customer = await User.findById(req.user._id);
	const platform = await Platform.findOne({ name: "platform" });

	if (!product) return next(new AppError("No product found with that id"));
	if (!farmer) return next(new AppError("No farmer found with that id"));
	if (!customer) return next(new AppError("No customer found with that id"));
	if (!platform) return next(new AppError("No platform found with that id"));
	if (product.quantity < req.body.quantity)
		return next(new AppError("Not enough quantity"));
	if (product.price * req.body.quantity > req.user.money)
		return next(new AppError("Not enough money"));

	const platformProfit = 0.1 * product.price * req.body.quantity;
	const farmerProfit = product.price * req.body.quantity - platformProfit;

	farmer.money += farmerProfit;
	customer.money -= product.price * req.body.quantity;
	product.quantity -= req.body.quantity;
	platform.totalTransaction += 1;
	platform.totalProfit += platformProfit;

	await farmer.save();
	await customer.save();
	await product.save();
	await platform.save();

	const transaction = await Transaction.create({
		farmer: product.owner,
		customer: req.user._id,
		product: product._id,
		quantity: req.body.quantity,
		totalPrice: product.price * req.body.quantity,
		platformProfit: platformProfit,
		status: "pending",
	});

	res.status(200).json({
		status: "success",
		data: {
			transaction,
			message: "Transaction created successfully",
		},
	});
});

exports.myPurchases = catchAsync(async (req, res, next) => {
	const transactions = await Transaction.find({ customer: req.user._id });
	if (!transactions) return next(new AppError("No transactions found"));

	res.status(200).json({
		status: "success",
		data: {
			transactions,
		},
	});
});

exports.updateTransaction = catchAsync(async (req, res, next) => {
	const transaction = await Transaction.findById(req.params.id);

	if (!transaction)
		return next(new AppError("No transaction found with that id"));
	if (
		req.user.id !== transaction.farmer.toString() &&
		req.user.id !== transaction.customer.toString()
	)
		return next(
			new AppError("You are not authorized to update this transaction")
		);
	if (transaction.status !== "pending")
		return next(
			new AppError("Transaction has already been accepted or rejected")
		);
	if (transaction.customer.toString() !== req.user._id.toString())
		return next(
			new AppError("You are not authorized to update this transaction")
		);

	transaction.status = req.body.status;

	if (req.body.review) transaction.review = req.body.review;

	await transaction.save();

	res.status(200).json({
		status: "success",
		data: {
			transaction,
			message: "Transaction updated successfully",
		},
	});
});

exports.mySales = catchAsync(async (req, res, next) => {
	const transactions = await Transaction.find({ farmer: req.user._id }).sort({
		createdAt: -1,
	});
	if (!transactions) return next(new AppError("No transactions found"));

	res.status(200).json({
		status: "success",
		data: {
			transactions,
		},
	});
});
