const express = require('express');
const router = express.Router();
const manageFoodController = require('../../controllers/CT/manageFoodController.js');

router.get('/food', manageFoodController.renderManageFood);


module.exports = router;