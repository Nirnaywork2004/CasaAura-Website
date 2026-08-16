import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, hashPassword } from '../models/User';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse';
import { getDatabaseStatus } from '../config/db';
import { AuthRequest } from '../middleware/auth';

// In-memory user store for dev/testing when MongoDB URI is not yet configured
interface InMemoryUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses: any[];
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

const inMemoryUsers: InMemoryUser[] = [];

/**
 * Validates email format using standard RFC 5322 regex pattern
 */
const isValidEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

/**
 * POST /api/auth/register
 * 
 * Body: { name, email, password, phone, role? }
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    // 1. Validation checks
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new AppError('Name is required and must be at least 2 characters long', 400);
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      throw new AppError('Please provide a valid email address', 400);
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new AppError('Password is required and must be at least 6 characters long', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();
    const assignedRole = role === 'admin' ? 'admin' : 'customer';
    const dbStatus = getDatabaseStatus();

    // 2. Database Connected Workflow
    if (dbStatus.isConnected) {
      // Check for existing user
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw new AppError('An account with this email address already exists', 409);
      }

      // Hash password using bcrypt
      const passwordHash = await hashPassword(password);

      // Create user record
      const newUser = await User.create({
        name: sanitizedName,
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : undefined,
        role: assignedRole,
        addresses: [],
        wishlist: [],
      });

      // Generate JWT
      const token = generateToken({
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      // Format response without passwordHash
      const userResponse = {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        addresses: newUser.addresses,
        wishlist: newUser.wishlist,
        createdAt: newUser.createdAt,
      };

      sendSuccess(
        res,
        'Account registered successfully',
        {
          token,
          user: userResponse,
        },
        201
      );
      return;
    }

    // 3. In-memory Fallback (When MongoDB is not connected)
    const existingInMemory = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (existingInMemory) {
      throw new AppError('An account with this email address already exists', 409);
    }

    const passwordHash = await hashPassword(password);
    const mockId = new mongoose.Types.ObjectId().toString();
    const newUserRecord: InMemoryUser = {
      _id: mockId,
      id: mockId,
      name: sanitizedName,
      email: normalizedEmail,
      passwordHash,
      phone: phone ? phone.trim() : undefined,
      role: assignedRole,
      addresses: [],
      wishlist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryUsers.push(newUserRecord);

    const token = generateToken({
      id: mockId,
      email: normalizedEmail,
      role: assignedRole,
    });

    const userResponse = {
      id: mockId,
      name: sanitizedName,
      email: normalizedEmail,
      role: assignedRole,
      phone: newUserRecord.phone,
      addresses: newUserRecord.addresses,
      wishlist: newUserRecord.wishlist,
      createdAt: newUserRecord.createdAt,
    };

    sendSuccess(
      res,
      'Account registered successfully (Temporary In-Memory Mode - Connect MongoDB to persist)',
      {
        token,
        user: userResponse,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * 
 * Body: { email, password }
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      throw new AppError('Please provide both email and password', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const dbStatus = getDatabaseStatus();

    // 2. Database Connected Workflow
    if (dbStatus.isConnected) {
      // Find user and explicitly select passwordHash
      const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Verify bcrypt password
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate JWT
      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const userResponse = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        wishlist: user.wishlist,
        createdAt: user.createdAt,
      };

      sendSuccess(res, 'Login successful', {
        token,
        user: userResponse,
      });
      return;
    }

    // 3. In-memory Fallback
    const user = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
      wishlist: user.wishlist,
      createdAt: user.createdAt,
    };

    sendSuccess(res, 'Login successful (Temporary In-Memory Mode)', {
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me (Protected by authMiddleware)
 */
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized: Not authenticated', 401);
    }

    const dbStatus = getDatabaseStatus();

    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id).select('-passwordHash');

      if (!user) {
        throw new AppError('User profile not found', 404);
      }

      sendSuccess(res, 'Current user profile retrieved', user);
      return;
    }

    // In-memory or verified token user
    const inMem = inMemoryUsers.find((u) => u.id === req.user?.id || u._id === req.user?.id);
    if (inMem) {
      const { passwordHash, ...userClean } = inMem;
      sendSuccess(res, 'Current user profile retrieved', userClean);
      return;
    }

    sendSuccess(res, 'Current user profile retrieved from token session', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    sendSuccess(res, 'Logged out successfully', { success: true });
  } catch (error) {
    next(error);
  }
};
