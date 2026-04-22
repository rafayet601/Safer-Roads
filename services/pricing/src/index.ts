import express from 'express';
import { loadConfig, getConfig } from './shared/config.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { pricingRouter } from './routes/pricing.js';

loadConfig();
const config = getConfig();

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/v1/pricing', pricingRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.PORT, () => {
  console.log(`Pricing service running on port ${config.PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app };
