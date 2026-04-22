import express from 'express';
import { loadConfig, getConfig } from './shared/config.js';
import { errorHandler, notFoundHandler, requestIdMiddleware, authenticate } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { userRouter } from './routes/user.js';
import { logger } from './utils/logger.js';

loadConfig();
const config = getConfig();

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.headers['x-request-id']
    });
  });
  next();
});

app.get('/health', (_req, res) => {
  logger.info('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/v1/auth', authRouter);
app.use('/v1/me', userRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.PORT, () => {
  logger.info(`User service running on port ${config.PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app };
