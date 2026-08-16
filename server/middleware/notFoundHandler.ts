import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * 404 Route Not Found Middleware
 * Intercepts requests to undefined /api/* endpoints
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  if (req.path.startsWith('/api')) {
    sendError(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
    return;
  }
  _next();
};
