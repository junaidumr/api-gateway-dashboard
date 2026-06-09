const RequestLog = require('../models/RequestLog');

const getLogs = async (req, res, next) => {
  try {
    const { endpoint, userId, startDate, endDate, statusCode, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (endpoint) filter.endpoint = { $regex: endpoint, $options: 'i' };
    if (userId) filter.userId = userId;
    if (statusCode) filter.statusCode = parseInt(statusCode, 10);

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      RequestLog.find(filter)
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      RequestLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: 'Request logs retrieved',
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLogs };
