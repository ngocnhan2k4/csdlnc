const express = require('express');
const router = express.Router();
const authController = require('../../controllers/Auth/authController.js');

router.get('/signup', authController.getSignupForm);
router.get('/signin', authController.getSigninForm);
router.post('/signin', authController.postSignin);
router.post('/signup', authController.postSignup);

module.exports = router;