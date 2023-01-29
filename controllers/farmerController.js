const Product = require("../models/productModel");
const Platform = require("../models/platformModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image")) {
		cb(null, true);
	} else {
		cb(x, false);
	}
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadProductPhoto = upload.single("image");

// in this function i have used the sharp module to resize and save the image in the folder
exports.resizeProductPhoto = (req, res, next) => {
	if (!req.file) return next();
	req.file.filename = `user-${Date.now()}.jpeg`;
	sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat("jpeg")
		.jpeg({ quality: 90 })
		.toFile(`images/products/${req.file.filename}`);
	next();
};

exports.createProduct = catchAsync(async (req, res, next) => {
	if (req.file) req.body.image = req.file.filename;
	if (req.body.active) delete req.body.active;
	req.body.owner = req.user.id;
	const newProduct = await Product.create(req.body);
  const platform = await Platform.findOne({ name: "platform" });
  platform.totalProducts += 1;
  await platform.save();
	res.status(201).json({
		status: "success",
		data: {
			product: newProduct,
			message:
				"your request to sell this product to the market is sent to the admin we will respond in 24 hours",
		},
	});
});

exports.listMyProducts = catchAsync(async (req, res, next) => {
	const products = await Product.find({ owner: req.user.id });
	res.status(200).json({
		status: "success",
		results: products.length,
		data: {
			products,
		},
	});
});

exports.updateProduct = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	if (product.owner.toString() !== req.user.id.toString()) {
		return next(
			new AppError("You are not allowed to update this product", 403)
		);
	}
	if (req.file) req.body.image = req.file.filename;
	if (req.body.active) delete req.body.active;
	await product.updateOne(req.body, {
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

exports.deleteProduct = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		return next(new AppError("No product found with that ID", 404));
	}
	if (product.ownerId.toString() !== req.user._id.toString()) {
		return next(
			new AppError("You are not allowed to delete this product", 403)
		);
	}
	if (product.image !== "default.png") {
		fs.unlink(`images/products/${product.image}`, (err) => {
			if (err) {
				return next(new AppError("Failed to delete product image", 500));
			}
		});
	}
	await product.remove();
	res.status(204).json({
		status: "success",
		data: null,
	});
});
