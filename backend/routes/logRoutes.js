const express = require('express');
const { getLogs } = require('../controllers/logController');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateJWT, requireAdmin);
router.get('/', getLogs);

module.exports = router;
