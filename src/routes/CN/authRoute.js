const express = require('express');
const router = express.Router();
const authController = require('../../controllers/CN/authController.js');


router.get('/login', authController.login); //branch login

module.exports = router;