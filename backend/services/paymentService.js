const express = require('express');
const listen = require('../config/listen');

const createPaymentService = async (port = 4002) => {
  const app = express();
  app.use(express.json());

  const mockPayments = [
    { id: 'pay_001', amount: 99.99, currency: 'USD', status: 'completed', userId: '1' },
    { id: 'pay_002', amount: 49.99, currency: 'USD', status: 'completed', userId: '2' },
    { id: 'pay_003', amount: 199.99, currency: 'USD', status: 'pending', userId: '1' },
  ];

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Payment service is healthy', data: { service: 'payments' } });
  });

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Payments retrieved successfully',
      data: mockPayments,
    });
  });

  app.get('/history', (_req, res) => {
    res.json({
      success: true,
      message: 'Payment history retrieved',
      data: mockPayments.filter((p) => p.status === 'completed'),
    });
  });

  app.get('/:id', (req, res) => {
    const payment = mockPayments.find((p) => p.id === req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found', data: null });
    }
    res.json({ success: true, message: 'Payment retrieved', data: payment });
  });

  app.post('/', (req, res) => {
    const newPayment = {
      id: `pay_${String(mockPayments.length + 1).padStart(3, '0')}`,
      status: 'pending',
      currency: 'USD',
      ...req.body,
    };
    mockPayments.push(newPayment);
    res.status(201).json({ success: true, message: 'Payment created', data: newPayment });
  });

  return listen(app, port, 'Payment Service');
};

module.exports = createPaymentService;
