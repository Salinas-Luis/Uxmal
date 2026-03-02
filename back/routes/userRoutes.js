const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../config/multer');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/update-avatar', upload.single('avatar'), userController.updateAvatar);

module.exports = router;