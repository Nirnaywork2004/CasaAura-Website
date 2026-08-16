import { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { getDatabaseStatus } from '../config/db';

/**
 * Health check controller
 * Endpoint: GET /api/health
 */
export const getHealth = (_req: Request, res: Response): void => {
  const dbStatus = getDatabaseStatus();

  sendSuccess(res, 'CasaAura API is running', {
    service: 'CasaAura API Server',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbStatus.isConnected,
      state: dbStatus.state,
    },
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
};
