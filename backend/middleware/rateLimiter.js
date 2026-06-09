const rateLimit = require('express-rate-limit');

const createRateLimiter = () => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000;
  const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      if (req.user?._id) return req.user._id.toString();
      if (req.apiKey?._id) return `key:${req.apiKey._id}`;
      return req.ip;
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Maximum ${max} requests per ${windowMs / 1000} seconds.`,
        data: null,
      });
    },
  });
};

module.exports = createRateLimiter;
