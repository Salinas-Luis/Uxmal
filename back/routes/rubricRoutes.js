const express = require('express');
const router = express.Router();
const rubricController = require('../controllers/rubricController');

router.post('/', rubricController.createRubric);
router.get('/task/:tareaId', rubricController.getRubricsByTask);
router.put('/:id', rubricController.updateRubric);
router.delete('/:id', rubricController.deleteRubric);

router.get('/submission/:entregaId', rubricController.getSubmissionGrades);
router.post('/submission/:entregaId/grades', rubricController.gradeSubmissionRubrics);

module.exports = router;
