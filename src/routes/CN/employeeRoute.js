const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/CN/employeeController.js');

router.get('/getall/:branchID', employeeController.getAllEmployeeFromBranch);// get all employee from branch
router.get('/search', employeeController.searchEmployee); // search employee
router.get('/getbyrole', employeeController.getEmployeesByRole); // get employee by role





module.exports = router;