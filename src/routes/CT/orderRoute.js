const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/CT/orderController.js');

router.get('/', orderController.getAllOrder);// get all order
router.get('/type/:Loai', orderController.getAllOrderByType);// get all order by type
router.get('/branch/:MaChiNhanh', orderController.getAllOrderByBranch);// get all order by branch
router.get('/evaluation/:MaHoaDon', orderController.getEvaluation);// get evaluation by order





module.exports = router;