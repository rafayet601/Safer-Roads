import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { loadConfig, getConfig } from './shared/config.js';
import { errorHandler, notFoundHandler, requestIdMiddleware } from './middleware/auth.js';

loadConfig();
const config = getConfig();

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'gateway' });
});

// Service proxy mappings
const SERVICE_PROXIES = {
  '/v1/auth': 'http://localhost:3000',
  '/v1/me': 'http://localhost:3000',
  '/v1/trips': 'http://localhost:3001',
  '/v1/scores': 'http://localhost:3002',
  '/v1/dashboard': 'http://localhost:3003',
  '/v1/rewards': 'http://localhost:3004',
  '/v1/pricing': 'http://localhost:3005',
  '/v1/admin': 'http://localhost:3006',
};

// Create proxy middleware for each service
Object.entries(SERVICE_PROXIES).forEach(([path, target]) => {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { [`^${path}`]: '' }, // Remove the base path when forwarding
      onProxyReq: (proxyReq, req, res) => {
        // Add request ID to proxied requests
        const requestId = req.headers['x-request-id'] as string;
        if (requestId) {
          proxyReq.setHeader('x-request-id', requestId);
        }
      },
      onError: (err, req, res) => {
        console.error(`Proxy error for ${path}:`, err);
        res.status(502).json({ 
          error: 'Bad Gateway', 
          message: `Unable to connect to service at ${target}` 
        });
      }
    })
  );
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

const server = app.listen(config.PORT, () => {
  console.log(`Gateway service running on port ${config.PORT}`);
  console.log('Service mappings:');
  Object.entries(SERVICE_PROXIES).forEach(([path, target]) => {
    console.log(`  ${path} -> ${target}`);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app };
