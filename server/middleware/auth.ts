import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError, AppError } from '../utils/apiResponse';
import { getDatabaseStatus } from '../config/db';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name?: string;
  addresses?: any[];
  wishlist?: any[];
  phone?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Authentication Middleware
 * 
 * Extracts Bearer token from Authorization header,
 * verifies signature and validity against JWT_SECRET,
 * fetches user data, and attaches req.user.
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminKeyHeader = req.headers['x-admin-key'] as string | undefined;
    const configuredAdminKey =
      process.env.ADMIN_API_KEY || process.env.ADMIN_KEY || 'casaaura-admin-secret-2026';

    // 1. Direct admin API key support via x-admin-key header
    if (adminKeyHeader && adminKeyHeader === configuredAdminKey) {
      req.user = {
        id: 'system-admin',
        email: 'admin@casaaura.internal',
        role: 'admin',
        name: 'CasaAura Administrator',
      };
      return next();
    }

    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      sendError(
        res,
        'Authentication required. Please provide a valid Bearer token in the Authorization header or x-admin-key header.',
        401
      );
      return;
    }

    // 2. Direct admin key passed as Bearer token
    if (token === configuredAdminKey) {
      req.user = {
        id: 'system-admin',
        email: 'admin@casaaura.internal',
        role: 'admin',
        name: 'CasaAura Administrator',
      };
      return next();
    }

    let decoded: TokenPayload;
    try {
      decoded = verifyToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        sendError(res, 'Authentication token has expired. Please log in again.', 401);
        return;
      }
      sendError(res, 'Invalid authentication token provided.', 401);
      return;
    }

    const dbStatus = getDatabaseStatus();

    // 3. If MongoDB is connected, load the fresh user document
    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(decoded.id)) {
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        sendError(res, 'User account associated with this token no longer exists.', 401);
        return;
      }

      req.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        wishlist: user.wishlist,
      };
      return next();
    }

    // 4. Fallback in-memory or verified token payload
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Role Protection Middleware
 * 
 * Validates that authenticated user has the 'admin' role or provided an admin key.
 */
export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const adminKeyHeader = req.headers['x-admin-key'] as string | undefined;
  const configuredAdminKey =
    process.env.ADMIN_API_KEY || process.env.ADMIN_KEY || 'casaaura-admin-secret-2026';

  // Check admin key bypass
  if (adminKeyHeader && adminKeyHeader === configuredAdminKey) {
    req.user = {
      id: 'system-admin',
      email: 'admin@casaaura.internal',
      role: 'admin',
      name: 'CasaAura Administrator',
    };
    return next();
  }

  // Check user attached by authMiddleware
  if (!req.user) {
    sendError(res, 'Authentication required to access admin resources.', 401);
    return;
  }

  if (req.user.role !== 'admin') {
    sendError(res, 'Forbidden: Administrative privileges required.', 403);
    return;
  }

  next();
};

/**
 * Optional Authentication Middleware
 * 
 * If a token is provided and valid, attaches req.user.
 * If no token is provided, passes through without failing (req.user remains undefined).
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        req.user = {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        };
      }
    } catch {
      // Invalid token in optional auth is ignored, req.user remains undefined
    }

    next();
  } catch (error) {
    next(error);
  }
};
