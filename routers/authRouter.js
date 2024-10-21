const express = require("express")
const authController = require('../controllers/authController');
const { indentifier } = require("../middlewares/indentification");

const router = express.Router()

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', indentifier, authController.signout);
router.patch('/change-password', indentifier, authController.changePasword);

router.patch('/send-verification-code', indentifier, authController.sendVerificationCode);
router.patch('/verify-verification-code', indentifier, authController.verifyVerificationCode);
router.patch('/send-forgot-password-code', authController.sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', authController.verifyForgotPasswordCode);


module.exports = router