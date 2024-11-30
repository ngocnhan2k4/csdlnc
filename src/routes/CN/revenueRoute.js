const express = require('express');
const router = express.Router();
const revenueController = require('../../controllers/CN/revenueController');

router.get('/dish', revenueController.getDishRevenue);// get revenue by dish
router.get('/:type', revenueController.getRevenue);// get revenue by type day, month, year

module.exports = router;