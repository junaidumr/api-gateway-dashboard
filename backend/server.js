require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const listen = require('./config/listen');
const createRateLimiter = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const { authenticateGateway } = require('./middleware/auth');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { createGatewayProxies } = require('./services/gatewayProxy');

const createUserService = require('./services/userService');
const createPaymentService = require('./services/paymentService');
const createOrderService = require('./services/orderService');

const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const logRoutes = require('./routes/logRoutes');
const userRoutes = require('./routes/userRoutes');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();

  await Promise.all([
    createUserService(4001),
    createPaymentService(4002),
    createOrderService(4003),
  ]);

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'API Gateway is healthy',
      data: {
        version: '1.0.0',
        services: ['users', 'payments', 'orders'],
      },
    });
  });

  app.use('/admin/auth', authRoutes);
  app.use('/admin/analytics', analyticsRoutes);
  app.use('/admin/api-keys', apiKeyRoutes);
  app.use('/admin/logs', logRoutes);
  app.use('/admin/users', userRoutes);

  const rateLimiter = createRateLimiter();
  const proxies = createGatewayProxies();

  app.use('/api', authenticateGateway, rateLimiter, requestLogger);

  for (const [route, proxy] of Object.entries(proxies)) {
    app.use(route, proxy);
  }

  app.use(notFound);
  app.use(errorHandler);

  await listen(app, PORT, 'API Gateway', { required: true });
  console.log(`Admin API: http://localhost:${PORT}/admin`);
  console.log(`Gateway routes: /api/users, /api/payments, /api/orders`);
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
