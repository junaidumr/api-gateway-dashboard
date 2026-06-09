const jwt = require('jsonwebtoken');
const User = require('../models/User');
const APIKey = require('../models/APIKey');

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message, data: null });
};

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'Invalid token. User not found.');
    }

    req.user = user;
    next();
  } catch {
    return sendError(res, 401, 'Invalid or expired token.');
  }
};

const authenticateAPIKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return sendError(res, 401, 'API key required. Provide x-api-key header.');
  }

  try {
    const keyDoc = await APIKey.findOne({ key: apiKey, status: 'active' }).populate('userId');

    if (!keyDoc) {
      return sendError(res, 401, 'Invalid or revoked API key.');
    }

    keyDoc.lastUsedAt = new Date();
    keyDoc.usageCount += 1;
    await keyDoc.save();

    req.user = keyDoc.userId;
    req.apiKey = keyDoc;
    next();
  } catch {
    return sendError(res, 500, 'API key validation failed.');
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'Admin access required.');
  }
  next();
};

const authenticateGateway = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const authHeader = req.headers.authorization;

  if (apiKey) {
    return authenticateAPIKey(req, res, next);
  }

  if (authHeader?.startsWith('Bearer ')) {
    return authenticateJWT(req, res, next);
  }

  return sendError(res, 401, 'Authentication required. Provide JWT or API key.');
};

module.exports = {
  authenticateJWT,
  authenticateAPIKey,
  authenticateGateway,
  requireAdmin,
};
