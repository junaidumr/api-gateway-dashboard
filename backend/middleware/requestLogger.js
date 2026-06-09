const RequestLog = require('../models/RequestLog');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;

    RequestLog.create({
      userId: req.user?._id || null,
      endpoint: req.originalUrl || req.url,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
    }).catch((err) => {
      console.error('Failed to log request:', err.message);
    });
  });

  next();
};

module.exports = requestLogger;
