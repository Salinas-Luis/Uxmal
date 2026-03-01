const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const upload = require('../config/multer'); 

router.get('/class/:claseId', assignmentController.getAssignmentsByClass);

router.delete('/:id', assignmentController.deleteAssignment);

router.post('/', upload.single('archivo_guia'), assignmentController.createAssignment);

module.exports = router;