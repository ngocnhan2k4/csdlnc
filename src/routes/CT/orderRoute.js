const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/CT/orderController.js');

router.get('/', orderController.getAllOrder);// get all order
router.get('/type/:Loai', orderController.getAllOrderByType);
router.get('/branch/:MaChiNhanh', orderController.getAllOrderByBranch);
router.get('/branch/type/:MaChiNhanh', orderController.getAllOrderBranchType);
router.get('/evaluation/:MaHoaDon', orderController.getEvaluation);





module.exports = router;