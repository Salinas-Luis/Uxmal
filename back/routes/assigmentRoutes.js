const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.post('/', assignmentController.createAssignment);
router.get('/class/:claseId', assignmentController.getAssignmentsByClass);
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;