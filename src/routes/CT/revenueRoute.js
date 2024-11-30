const express = require('express');
const router = express.Router();
const revenueController = require('../../controllers/CT/revenueController.js');

router.get('/dish', revenueController.getDishRevenue);// get revenue by dish
router.get('/evaluation/:type', revenueController.getAverageEvalu);// get average evaluation
router.get('/:type', revenueController.getRevenue);// get revenue by type day, month, year

module.exports = router;