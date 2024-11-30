const express = require('express');
const router = express.Router();
const dishController = require('../../controllers/CN/dishController');

router.get('/searchDish', dishController.searchDish);// search dish
router.get('/:branchID', dishController.getDishFromBranch);// get dishes from branch
router.put('/updateState', dishController.updateState);// update state of dish
router.get('/searchDish', dishController.searchDish);// search dish

module.exports = router;