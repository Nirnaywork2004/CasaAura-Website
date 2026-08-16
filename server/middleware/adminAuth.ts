import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse';

export interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    role?: string;
    email?: string;
  };
}

/**
 * Admin Authentication & Authorization Middleware
 * 
 * Protects administrative mutation endpoints (POST, PUT, DELETE).
 * Accepts:
 * 1. Bearer JWT token signed with JWT_SECRET containing `{ role: 'admin' }`
 * 2. Or 'x-admin-key' / Bearer header matching ADMIN_API_KEY environment variable.
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const adminKeyHeader = req.headers['x-admin-key'] as string | undefined;
  const configuredAdminKey = process.env.ADMIN_API_KEY || process.env.ADMIN_KEY || 'casaaura-admin-secret-2026';
  const jwtSecret = process.env.JWT_SECRET || 'casaaura-jwt-dev-secret';

  // 1. Check direct admin API key header (useful for automated jobs/scripts)
  if (adminKeyHeader && adminKeyHeader === configuredAdminKey) {
    req.user = { role: 'admin', email: 'admin@casaaura.internal' };
    return next();
  }

  // 2. Check Authorization Bearer Header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    // Direct match with admin API key in Bearer token
    if (token === configuredAdminKey) {
      req.user = { role: 'admin', email: 'admin@casaaura.internal' };
      return next();
    }

    // Attempt JWT verification
    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        id?: string;
        role?: string;
        email?: string;
      };

      if (decoded.role === 'admin') {
        req.user = decoded;
        return next();
      }

      sendError(res, 'Forbidden: Admin privileges required to perform this action', 403);
      return;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        sendError(res, 'Unauthorized: Admin authentication token has expired', 401);
        return;
      }
      sendError(res, 'Unauthorized: Invalid authentication token provided', 401);
      return;
    }
  }

  sendError(
    res,
    'Unauthorized: Admin authentication required. Provide a valid Bearer token or x-admin-key header.',
    401
  );
};
