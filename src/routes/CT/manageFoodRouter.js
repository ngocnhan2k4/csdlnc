const express = require('express');
const router = express.Router();
const manageFoodController = require('../../controllers/CT/manageFoodController.js');

router.get('/', manageFoodController.renderArea);
router.get('/area', manageFoodController.getArea);
router.get('/food', manageFoodController.renderManageFoodArea);


module.exports = router;