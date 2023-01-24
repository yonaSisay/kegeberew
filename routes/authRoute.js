const express = require('express')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')

const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
    '/updateMyPassword',
    authController.protect,
    authController.updatePassword
  );

router.patch(
    '/updateUser/:id',authController.protect,userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateUser
)

router.delete('/deleteUser/:id',authController.protect,userController.deleteAccount)
module.exports = router