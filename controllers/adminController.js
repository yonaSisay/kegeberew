const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Product = require("../models/productModel");
const User = require("../models/user");
const Transaction = require("../models/transactionModel");

exports.getAllTransactions = catchAsync(async (req, res, next) => {
	let query = {};
	if (req.query.status) {
		query.status = req.query.status;
	}
	if (req.query.search) {
		query.name = new RegExp(req.query.search, "i");
	}
	if (req.query.farmer) {
		const farmer = await User.findOne({ firstName: req.query.farmer });
		if (!farmer)
			return next(new AppError("No farmer found with that name", 404));

		query.farmer = farmer._id;
	}
	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(":");
		const sortBy = parts[0];
		const order = parts[1] === "desc" ? -1 : 1;
		query = query.sort({ [sortBy]: order });
	}
	const transactions = await Transaction.find(query);

	res.status(200).json({
		status: "success",
		results: transactions.length,
		data: {
			transactions,
		},
	});
});

exports.getOneTransaction = catchAsync(async (req, res, next) => {
	const transaction = await Transaction.findById(req.params.id)
		.populate({ path: "farmer", select: "firstName lastName" })
		.populate({ path: "customer", select: "firstName lastName" });
	if (!transaction) {
		return next(new AppError("No transaction found with that ID", 404));
	}
	res.status(200).json({
		status: "success",
		data: {
			transaction,
		},
	});
});

exports.DeactiveProducts = catchAsync(async (req, res, next) => {
	let query = {};
	if (req.query.active) {
		query.active = req.query.active;
	}
	// Searching
	if (req.query.search) {
		query.name = new RegExp(req.query.search, "i");
	}
	if (req.query.farmer) {
		// Find the farmer with the specified name
		const farmer = await User.findOne({ firstName: req.query.farmer });
		if (!farmer)
			return next(new AppError("No farmer found with that name", 404));
		// Use the farmer's _id to query the product collection
		query.farmer = farmer._id;
	}
	//Sorting
	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(":");
		const sortBy = parts[0];
		const order = parts[1] === "desc" ? -1 : 1;
		query = query.sort({ [sortBy]: order });
	}
	const products = await Product.find(query);
	res.status(200).json({
		status: "success",
		results: products.length,
		data: {
			products,
		},
	});
});

exports.updateProduct = catchAsync(async (req, res, next) => {
	const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	res.status(200).json({
		status: "success",
		data: {
			product,
		},
	});
});

exports.getProduct = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	res.status(200).json({
		status: "success",
		data: {
			product,
		},
	});
});
