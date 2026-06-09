const User = require('../models/User');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Users retrieved',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers };
