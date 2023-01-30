const contactUs = require("../controllers/contactController");
const authController = require("../controllers/authController");
const express = require("express");
const router = express.Router();

router.route("/").post(contactUs.contactUs).get(contactUs.getContactUs);
router.route("/admin").get(authController.protect,authController.restrictTo("admin"), contactUs.getContactUs)

module.exports = router;