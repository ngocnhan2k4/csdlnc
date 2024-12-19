const express = require('express');
const router = express.Router();
const dishController = require('../../controllers/CT/dishController.js');

router.get('/searchdish', dishController.searchDish);// search dish
router.get('/bybranch/:branchID', dishController.getDishFromBranch);// get dishes from branch
router.get('/byarea/:areaID', dishController.getDishFromArea);// get dishes from area
router.post('/createdish', dishController.createDish);// create dish
router.put('/updatedish', dishController.updateDish);// update dish
router.post('/updateStatusDish', dishController.updateStatus);// update dish
router.delete('/deletedish', dishController.deleteDish);// delete dish
router.get('/searchDishInBranch', dishController.searchDishInBranch);

module.exports = router;