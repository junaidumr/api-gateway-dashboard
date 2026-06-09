const express = require('express');
const listen = require('../config/listen');

const createUserService = async (port = 4001) => {
  const app = express();
  app.use(express.json());

  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
  ];

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'User service is healthy', data: { service: 'users' } });
  });

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: mockUsers,
    });
  });

  app.get('/profile', (_req, res) => {
    res.json({
      success: true,
      message: 'User profile retrieved',
      data: mockUsers[0],
    });
  });

  app.get('/:id', (req, res) => {
    const user = mockUsers.find((u) => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }
    res.json({ success: true, message: 'User retrieved', data: user });
  });

  app.post('/', (req, res) => {
    const newUser = { id: String(mockUsers.length + 1), ...req.body };
    mockUsers.push(newUser);
    res.status(201).json({ success: true, message: 'User created', data: newUser });
  });

  return listen(app, port, 'User Service');
};

module.exports = createUserService;
