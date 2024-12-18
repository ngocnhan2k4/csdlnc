const express = require('express');
const router = express.Router();
const companyController = require('../../controllers/CT/companyController.js');

router.get('/', manageFoodController.renderArea);
router.get('/area', manageFoodController.getArea);
router.get('/branch', manageFoodController.getBranch);

module.exports = router;