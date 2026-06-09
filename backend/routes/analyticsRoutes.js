const express = require('express');
const {
  getOverview,
  getRequestsByEndpoint,
  getDailyTraffic,
  getTopUsers,
  getStatusCodeDistribution,
} = require('../controllers/analyticsController');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateJWT, requireAdmin);

router.get('/overview', getOverview);
router.get('/requests-by-endpoint', getRequestsByEndpoint);
router.get('/daily-traffic', getDailyTraffic);
router.get('/top-users', getTopUsers);
router.get('/status-distribution', getStatusCodeDistribution);

module.exports = router;
