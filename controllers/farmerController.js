const Product = require("../models/productModel");
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