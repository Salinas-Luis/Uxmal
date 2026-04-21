const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assigmentController');
const upload = require('../config/multer'); 

router.get('/class/:claseId', assignmentController.getAssignmentsByClass);

router.delete('/:id', assignmentController.deleteAssignment);

router.delete('/submission/:id', assignmentController.cancelSubmission);

router.post('/', upload.single('archivo_guia'), assignmentController.createAssignment);

router.post('/submit', upload.single('archivo_entrega'), assignmentController.submitSubmission);

router.put('/grade/:id', assignmentController.gradeSubmission);

module.exports = router;