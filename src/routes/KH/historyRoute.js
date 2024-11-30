const express = require('express');
const router = express.Router();
const historyController = require('../../controllers/KH/historyController.js');


router.get('/:orderID', historyController.getDetailInvoice); //hiển thị Chi tiết phiếu đặt khi click vào hóa đơn
router.post('/:orderID', historyController.createDG); //Tạo đánh giá cho hóa đơn
router.get('/', historyController.getAllInoice); //Hiển thị tất cả hóa đơn
module.exports = router;