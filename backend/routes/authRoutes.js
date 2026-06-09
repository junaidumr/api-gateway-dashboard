const express = require('express');
const { login, getProfile } = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/profile', authenticateJWT, getProfile);

module.exports = router;
