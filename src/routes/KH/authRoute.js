const express = require('express');
const router = express.Router();
const authController = require('../../controllers/KH/authController');


router.get('/login', authController.login); //user login
router.post('/signup', authController.register); //user register

module.exports = router;