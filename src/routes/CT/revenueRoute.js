const express = require('express');
const router = express.Router();
const revenueController = require('../../controllers/CT/revenueController.js');

router.get('/dish', revenueController.getDishRevenue);// get revenue by dish
router.get('/evaluation/:type', revenueController.getAverageEvalu);// get average evaluation
router.get('/:type', revenueController.renderRevenueByType);// get revenue by type day, month, year
router.get('/', revenueController.renderRevenue);// get all revenue
router.get('/dish/:id', revenueController.getDishRevenueById);// get revenue by dish id

module.exports = router;