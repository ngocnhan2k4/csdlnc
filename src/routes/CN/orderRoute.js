const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/CN/orderController.js');

router.get('/ordertype/:branchID', orderController.getOrderFromBranchWithType);// get all orders from a branch with a specific type
router.get('/:branchID', orderController.getOrderFromBranch);// get all orders from a branch
router.post('/offline', orderController.creatOfflineFood);// create an offline order
router.post('/orderdetail', orderController.createOrderDetail);// create an order detail
router.post('/createInvoice', orderController.createInvoice);// tạo đơn hàng
router.post('/createDG', orderController.createDG);// tạo đánh giá
router.get('/delete/:MaPhieuDat', orderController.deleteOfflineOrder);// xóa đơn hàng



module.exports = router;