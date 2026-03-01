const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/', postController.createPost);
router.get('/class/:claseId', postController.getPostsByClass);

module.exports = router;