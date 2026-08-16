import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/apiResponse';

/**
 * Centralized API Error Handling Middleware
 * 
 * Captures all operational and unhandled runtime errors,
 * formats them uniformly as { success: false, message: "..." },
 * and returns the appropriate HTTP status code.
 */
export const errorHandler = (
  err: Error | AppError | any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorDetails: unknown = null;

  // Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    const validationMessages = Object.values(err.errors).map((e: any) => e.message);
    message = validationMessages.join(', ') || 'Validation error';
    errorDetails = err.errors;
  }
  // Mongoose CastError (invalid ObjectId, etc.)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource parameter: ${err.path}`;
  }
  // MongoDB duplicate key error
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }
  // SyntaxError in JSON body parsing
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }
  // Standard Error fallback
  else if (err instanceof Error) {
    message = err.message || message;
    errorDetails = err.stack;
  }

  // Log in server console for debugging
  if (statusCode >= 500) {
    console.error(`[API Error 500] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(`[API Client Error ${statusCode}] ${req.method} ${req.originalUrl}: ${message}`);
  }

  sendError(res, message, statusCode, errorDetails);
};
