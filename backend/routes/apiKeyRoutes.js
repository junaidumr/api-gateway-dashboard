const express = require('express');
const { generateKey, getAllKeys, revokeKey, getKeyStats } = require('../controllers/apiKeyController');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateJWT, requireAdmin);

router.get('/', getAllKeys);
router.get('/stats', getKeyStats);
router.post('/', generateKey);
router.patch('/:id/revoke', revokeKey);

module.exports = router;
