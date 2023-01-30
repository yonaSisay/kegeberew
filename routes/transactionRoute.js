const express = require("express");
const transactionController = require("../controllers/transactionController");
const authController = require("../controllers/authController");
const { buyProductCheck } = require("../middleware/validationCheck");

const router = express.Router();

router
	.route("/")
	.post(
		authController.protect,
		authController.restrictTo("customer"),
		buyProductCheck,
		transactionController.buyProduct
	);
router
	.route("/:id")
	.patch(
		authController.protect,
		authController.restrictTo("farmer customer"),
		transactionController.updateTransaction
	)
	.get(
		authController.protect,
		authController.restrictTo("farmer customer"),
		transactionController.getOneTransaction
	);
router
	.route("/farmer")
	.get(
		authController.protect,
		authController.restrictTo("farmer"),
		transactionController.mySales
	);
router
	.route("/customer")
	.get(
		authController.protect,
		authController.restrictTo("customer"),
		transactionController.myPurchases
	);

module.exports = router;
