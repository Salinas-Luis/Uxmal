const express = require('express');
const router = express.Router();
const rubricController = require('../controllers/rubricController');


router.get('/', rubricController.getAllRubrics);
router.post('/', rubricController.createGlobalRubric);
router.put('/:id', rubricController.updateRubric);
router.delete('/:id', rubricController.deleteRubric);


router.get('/task/:tareaId', rubricController.getRubricsByTask);

// Calificaciones por rúbrica
router.get('/submission/:entregaId', rubricController.getSubmissionGrades);
router.post('/submission/:entregaId/grades', rubricController.gradeSubmissionRubrics);

module.exports = router;
