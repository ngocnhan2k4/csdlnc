const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/CT/employeeController.js');

router.get('/bybranch/:branchID', employeeController.getAllEmployeeFromBranch);// get all employee from branch
router.get('/search', employeeController.searchEmployee); // search employee
router.post('/created', employeeController.createEmployee); // create employee
router.put('/updated', employeeController.updateEmployee); // update employee
router.delete('/deleted', employeeController.deleteEmployee); // delete employee
router.put('/reassign', employeeController.reassignEmployee); // reassign employee
router.get('/', employeeController.getAllEmployee); // get all employee


module.exports = router;