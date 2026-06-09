const RequestLog = require('../models/RequestLog');

const getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const oneMinuteAgo = new Date(now - 60 * 1000);

    const [totalRequests, activeUsers, errorCount, requestsLastMinute, requestsLastHour, requestsLastDay] =
      await Promise.all([
        RequestLog.countDocuments(),
        RequestLog.distinct('userId', { timestamp: { $gte: oneDayAgo }, userId: { $ne: null } }),
        RequestLog.countDocuments({ statusCode: { $gte: 400 } }),
        RequestLog.countDocuments({ timestamp: { $gte: oneMinuteAgo } }),
        RequestLog.countDocuments({ timestamp: { $gte: oneHourAgo } }),
        RequestLog.countDocuments({ timestamp: { $gte: oneDayAgo } }),
      ]);

    const errorRate = totalRequests > 0 ? ((errorCount / totalRequests) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      message: 'Overview analytics retrieved',
      data: {
        totalRequests,
        activeUsers: activeUsers.length,
        errorRate: parseFloat(errorRate),
        requestsPerMinute: requestsLastMinute,
        requestsPerHour: requestsLastHour,
        requestsPerDay: requestsLastDay,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRequestsByEndpoint = async (req, res, next) => {
  try {
    const data = await RequestLog.aggregate([
      { $group: { _id: '$endpoint', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { endpoint: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      message: 'Requests by endpoint retrieved',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getDailyTraffic = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const data = await RequestLog.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
          errors: { $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, errors: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      message: 'Daily traffic retrieved',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getTopUsers = async (req, res, next) => {
  try {
    const data = await RequestLog.aggregate([
      { $match: { userId: { $ne: null } } },
      { $group: { _id: '$userId', requestCount: { $sum: 1 } } },
      { $sort: { requestCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          requestCount: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      message: 'Top users retrieved',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getStatusCodeDistribution = async (req, res, next) => {
  try {
    const data = await RequestLog.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$statusCode', 300] }, then: '2xx' },
                { case: { $lt: ['$statusCode', 400] }, then: '3xx' },
                { case: { $lt: ['$statusCode', 500] }, then: '4xx' },
              ],
              default: '5xx',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      message: 'Status code distribution retrieved',
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getRequestsByEndpoint,
  getDailyTraffic,
  getTopUsers,
  getStatusCodeDistribution,
};
