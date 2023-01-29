const express = require("express");
const farmerController = require("../controllers/farmerController");
const authController = require("../controllers/authController");
const { createProductCheck } = require("../middleware/validationCheck");

const router = express.Router();
//Farmer route
router
	.route("/")
	.post(
		authController.protect,
		authController.restrictTo("farmer"),
		farmerController.uploadProductPhoto,
		farmerController.resizeProductPhoto,
		createProductCheck,
		farmerController.createProduct
	);
router.get(
	"/",
	authController.protect,
	authController.restrictTo("farmer"),
	farmerController.listMyProducts
);
router
	.route("/:id")
	.patch(
		authController.protect,
		authController.restrictTo("farmer"),
		farmerController.uploadProductPhoto,
		farmerController.resizeProductPhoto,
		farmerController.updateProduct
	)
	.delete(
		authController.protect,
		authController.restrictTo("farmer"),
		farmerController.deleteProduct
	);

module.exports = router;
