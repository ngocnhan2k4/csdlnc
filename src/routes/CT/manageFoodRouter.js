const express = require('express');
const router = express.Router();
const companyController = require('../../controllers/CT/companyController.js');

router.get('/',  companyController.homeCompany);

router.get('/area', companyController.getArea);

module.exports = router;