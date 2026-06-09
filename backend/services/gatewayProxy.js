const { createProxyMiddleware } = require('http-proxy-middleware');

const serviceRoutes = {
  '/api/users': process.env.USER_SERVICE_URL || 'http://localhost:4001',
  '/api/payments': process.env.PAYMENT_SERVICE_URL || 'http://localhost:4002',
  '/api/orders': process.env.ORDER_SERVICE_URL || 'http://localhost:4003',
};

const createGatewayProxies = () => {
  const proxies = {};

  for (const [route, target] of Object.entries(serviceRoutes)) {
    const pathRewrite = {};
    pathRewrite[`^${route}`] = '';

    proxies[route] = createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite,
      on: {
        proxyReq: (proxyReq, req) => {
          if (req.user?._id) {
            proxyReq.setHeader('x-user-id', req.user._id.toString());
          }
        },
        error: (err, req, res) => {
          console.error(`Proxy error for ${req.url}:`, err.message);
          res.status(502).json({
            success: false,
            message: 'Upstream service unavailable',
            data: null,
          });
        },
      },
    });
  }

  return proxies;
};

module.exports = { createGatewayProxies, serviceRoutes };
