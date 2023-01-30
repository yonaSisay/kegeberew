const express = require("express");
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");
const router = express.Router();

router
	.route("/")
	.get(
		authController.protect,
		authController.restrictTo("admin"),
		adminController.DeactiveProducts
	);
router
	.route("/transactions")
	.get(
		authController.protect,
		authController.restrictTo("admin"),
		adminController.getAllTransactions
	);
router
	.route("/transactions/:id")
	.get(
		authController.protect,
		authController.restrictTo("admin"),
		adminController.getOneTransaction
	);
router
	.route("/customers")
	.get(
		authController.protect,
		authController.restrictTo("admin"),
		adminController.getAllCustomers
	);
module.exports = router;