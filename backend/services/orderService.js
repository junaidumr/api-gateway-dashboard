const express = require('express');
const listen = require('../config/listen');

const createOrderService = async (port = 4003) => {
  const app = express();
  app.use(express.json());

  const mockOrders = [
    { id: 'ord_001', product: 'Premium Plan', quantity: 1, status: 'delivered', userId: '1', total: 99.99 },
    { id: 'ord_002', product: 'Basic Plan', quantity: 2, status: 'shipped', userId: '2', total: 49.98 },
    { id: 'ord_003', product: 'Enterprise Plan', quantity: 1, status: 'processing', userId: '3', total: 299.99 },
  ];

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Order service is healthy', data: { service: 'orders' } });
  });

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: mockOrders,
    });
  });

  app.get('/status', (_req, res) => {
    const statusCounts = mockOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    res.json({
      success: true,
      message: 'Order status summary retrieved',
      data: statusCounts,
    });
  });

  app.get('/:id', (req, res) => {
    const order = mockOrders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', data: null });
    }
    res.json({ success: true, message: 'Order retrieved', data: order });
  });

  app.post('/', (req, res) => {
    const newOrder = {
      id: `ord_${String(mockOrders.length + 1).padStart(3, '0')}`,
      status: 'processing',
      ...req.body,
    };
    mockOrders.push(newOrder);
    res.status(201).json({ success: true, message: 'Order created', data: newOrder });
  });

  return listen(app, port, 'Order Service');
};

module.exports = createOrderService;
