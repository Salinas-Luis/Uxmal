const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

router.post('/create', classController.createClass);
router.post('/join', classController.joinClass);

module.exports = router;