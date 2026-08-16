import { Response } from 'express';

/**
 * Custom application error class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standardized successful API response format
 */
export const sendSuccess = <T = unknown>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  const payload: Record<string, unknown> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Standardized error API response format
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown
): Response => {
  const payload: Record<string, unknown> = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development' && details) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};
