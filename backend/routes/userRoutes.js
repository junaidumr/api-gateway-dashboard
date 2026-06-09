const express = require('express');
const { getAllUsers } = require('../controllers/userController');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateJWT, requireAdmin);
router.get('/', getAllUsers);

module.exports = router;
