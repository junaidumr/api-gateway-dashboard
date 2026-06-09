require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const APIKey = require('../models/APIKey');
const RequestLog = require('../models/RequestLog');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/api-gateway';
  await mongoose.connect(uri);

  await Promise.all([User.deleteMany({}), APIKey.deleteMany({}), RequestLog.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@gateway.io',
    password: 'admin123',
    role: 'admin',
  });

  const users = await Promise.all([
    User.create({ name: 'John Doe', email: 'john@example.com', password: 'user123', role: 'user' }),
    User.create({ name: 'Jane Smith', email: 'jane@example.com', password: 'user123', role: 'user' }),
    User.create({ name: 'Bob Wilson', email: 'bob@example.com', password: 'user123', role: 'user' }),
    User.create({ name: 'Alice Brown', email: 'alice@example.com', password: 'user123', role: 'user' }),
  ]);

  const apiKeys = await APIKey.insertMany([
    { userId: users[0]._id, key: `gw_${uuidv4().replace(/-/g, '')}`, status: 'active' },
    { userId: users[1]._id, key: `gw_${uuidv4().replace(/-/g, '')}`, status: 'active' },
    { userId: users[2]._id, key: `gw_${uuidv4().replace(/-/g, '')}`, status: 'revoked' },
  ]);

  const endpoints = [
    '/api/users',
    '/api/users/profile',
    '/api/payments',
    '/api/payments/history',
    '/api/orders',
    '/api/orders/status',
  ];
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const statusCodes = [200, 200, 200, 201, 400, 401, 403, 404, 500];

  const logs = [];
  const now = Date.now();

  for (let i = 0; i < 500; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000 - minutesAgo * 60000);
    const user = users[Math.floor(Math.random() * users.length)];
    const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];

    logs.push({
      userId: user._id,
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      statusCode,
      responseTime: Math.floor(Math.random() * 500) + 10,
      timestamp,
    });
  }

  await RequestLog.insertMany(logs);

  console.log('Database seeded successfully');
  console.log('Admin login: admin@gateway.io / admin123');
  console.log('API Keys:', apiKeys.map((k) => k.key).join(', '));

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
