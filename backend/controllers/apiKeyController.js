const { v4: uuidv4 } = require('uuid');
const APIKey = require('../models/APIKey');
const User = require('../models/User');

const generateKey = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
        data: null,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    const key = `gw_${uuidv4().replace(/-/g, '')}`;
    const apiKey = await APIKey.create({ userId, key, status: 'active' });

    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      data: apiKey,
    });
  } catch (error) {
    next(error);
  }
};

const getAllKeys = async (req, res, next) => {
  try {
    const keys = await APIKey.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'API keys retrieved',
      data: keys,
    });
  } catch (error) {
    next(error);
  }
};

const revokeKey = async (req, res, next) => {
  try {
    const apiKey = await APIKey.findByIdAndUpdate(
      req.params.id,
      { status: 'revoked' },
      { new: true }
    );

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
        data: null,
      });
    }

    res.json({
      success: true,
      message: 'API key revoked successfully',
      data: apiKey,
    });
  } catch (error) {
    next(error);
  }
};

const getKeyStats = async (req, res, next) => {
  try {
    const stats = await APIKey.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
        },
      },
    ]);

    res.json({
      success: true,
      message: 'API key stats retrieved',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateKey, getAllKeys, revokeKey, getKeyStats };
