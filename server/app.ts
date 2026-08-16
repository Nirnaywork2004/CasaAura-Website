import express, { Express } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler, notFoundHandler } from './middleware';

/**
 * Creates and configures the Express application
 */
export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger in development
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
      if (req.path.startsWith('/api')) {
        console.log(`[API Request] ${req.method} ${req.path}`);
      }
      next();
    });
  }

  // Primary API Router -> /api
  app.use('/api', apiRouter);

  // 404 handler for API routes
  app.use(notFoundHandler);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};

export default createApp;
