const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/KH/orderController');


router.get('/delivery', orderController.getDeliveryFood); // lấy những món ăn hỗ trợ giao hàng từ một khu vực
router.get('/online', orderController.getOnlineFood); // lấy những món ăn hỗ trợ giao hàng từ một khu vực
router.post('/delivery', orderController.creatDeliveryFood); // tạo phiếu đặt giao hàng
router.post('/online', orderController.creatOnlineFood); // tạo phiếu đặt bàn online
router.get('/area', orderController.getArea);// lấy khu vực
router.get('/branch', orderController.getBranchFromArea);// lấy chi nhánh từ khu vực
router.post('/orderDetail', orderController.createOrderDetail);// tạo chi tiết đơn hàng
router.post('/createInvoice', orderController.createInvoice);// tạo đơn hàng
router.get('/freetable',orderController.getFreeTableOfBranch);// lấy bàn trống



module.exports = router;