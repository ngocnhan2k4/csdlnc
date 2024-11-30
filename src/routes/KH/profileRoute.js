const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/KH/profileController');


router.get('/:userID', profileController.getCustomer); //hiển thị thông tin khách hàng
router.post('/:userID', profileController.editCustomer); //cập nhật thông tin khách hàng

module.exports = router;