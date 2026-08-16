import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Product } from '../models/Product';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse';
import { getDatabaseStatus } from '../config/db';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/users/me
 * Get current authenticated user profile
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized: Please log in to continue', 401);
    }

    const dbStatus = getDatabaseStatus();
    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id)
        .select('-passwordHash')
        .populate('wishlist');

      if (!user) {
        throw new AppError('User profile not found', 404);
      }

      sendSuccess(res, 'User profile retrieved successfully', user);
      return;
    }

    sendSuccess(res, 'User profile retrieved successfully (Session mode)', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/me
 * Update user profile (Name, Phone only; forbids role, passwordHash, or ID modification)
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized: Please log in to continue', 401);
    }

    const { name, phone } = req.body;

    const updates: { name?: string; phone?: string } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        throw new AppError('Name must be at least 2 characters long', 400);
      }
      updates.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone === 'string') {
        updates.phone = phone.trim();
      }
    }

    const dbStatus = getDatabaseStatus();
    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-passwordHash');

      if (!updatedUser) {
        throw new AppError('User profile not found', 404);
      }

      sendSuccess(res, 'Profile updated successfully', updatedUser);
      return;
    }

    // In-memory update
    const updatedSession = {
      ...req.user,
      ...updates,
    };

    sendSuccess(res, 'Profile updated successfully', updatedSession);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/me/addresses
 * List user delivery addresses
 */
export const getAddresses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized: Please log in to continue', 401);
    }

    const dbStatus = getDatabaseStatus();
    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id).select('addresses');
      sendSuccess(res, 'Addresses retrieved', user?.addresses || []);
      return;
    }

    sendSuccess(res, 'Addresses retrieved', req.user.addresses || []);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/me/addresses
 * Add a new delivery address
 */
export const addAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized: Please log in to continue', 401);
    }

    const {
      label = 'Home',
      street,
      addressLine1,
      city,
      state,
      postalCode,
      pincode,
      country = 'India',
      isDefault = false,
    } = req.body;

    const finalStreet = (street || addressLine1 || '').trim();
    const finalPostalCode = (postalCode || pincode || '').trim();
    const finalCity = (city || '').trim();
    const finalState = (state || '').trim();

    if (!finalStreet || !finalCity || !finalState || !finalPostalCode) {
      throw new AppError(
        'Please provide complete address details (street/addressLine1, city, state, postalCode/pincode)',
        400
      );
    }

    const newAddr = {
      label: label.trim(),
      street: finalStreet,
      city: finalCity,
      state: finalState,
      postalCode: finalPostalCode,
      country: country.trim(),
      isDefault: Boolean(isDefault),
    };

    const dbStatus = getDatabaseStatus();
    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (newAddr.isDefault) {
        user.addresses.forEach((a) => (a.isDefault = false));
      }

      user.addresses.push(newAddr as any);
      await user.save();

      const created = user.addresses[user.addresses.length - 1];
      sendSuccess(res, 'Address added successfully', created, 201);
      return;
    }

    sendSuccess(
      res,
      'Address added successfully (Session mode)',
      { id: `addr-${Date.now()}`, ...newAddr },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/me/addresses/:id
 * Update an existing delivery address
 */
export const updateAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized: Please log in to continue', 401);
    }

    const { id } = req.params;
    const {
      label,
      street,
      addressLine1,
      city,
      state,
      postalCode,
      pincode,
      country,
      isDefault,
    } = req.body;

    const dbStatus = getDatabaseStatus();
    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const addressDoc = (user.addresses as any).id(id);
      if (!addressDoc) {
        throw new AppError('Address not found', 404);
      }

      if (label !== undefined) addressDoc.label = label.trim();
      if (street !== undefined || addressLine1 !== undefined)
        addressDoc.street = (street || addressLine1).trim();
      if (city !== undefined) addressDoc.city = city.trim();
      if (state !== undefined) addressDoc.state = state.trim();
      if (postalCode !== undefined || pincode !== undefined)
        addressDoc.postalCode = (postalCode || pincode).trim();
      if (country !== undefined) addressDoc.country = country.trim();

      if (isDefault) {
        user.addresses.forEach((a) => (a.isDefault = false));
        addressDoc.isDefault = true;
      } else if (isDefault === false) {
        addressDoc.isDefault = false;
      }

      await user.save();
      sendSuccess(res, 'Address updated successfully', addressDoc);
      return;
    }

    sendSuccess(res, 'Address updated successfully (Session mode)', { id, ...req.body });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/me/addresses/:id
 * Remove a delivery address
 */
export const deleteAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized: Please log in to continue', 401);
    }

    const { id } = req.params;
    const dbStatus = getDatabaseStatus();

    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const addrIndex = user.addresses.findIndex(
        (a: any) => a._id?.toString() === id || a.id === id
      );

      if (addrIndex === -1) {
        throw new AppError('Address not found', 404);
      }

      user.addresses.splice(addrIndex, 1);
      await user.save();

      sendSuccess(res, 'Address removed successfully', { success: true });
      return;
    }

    sendSuccess(res, 'Address removed successfully (Session mode)', { success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/me/wishlist
 * Get authenticated user wishlist
 */
export const getWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized: Please log in to continue', 401);
    }

    const dbStatus = getDatabaseStatus();
    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id).populate('wishlist');
      sendSuccess(res, 'Wishlist retrieved', user?.wishlist || []);
      return;
    }

    sendSuccess(res, 'Wishlist retrieved', req.user.wishlist || []);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/me/wishlist
 * Add item to wishlist
 */
export const addToWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized: Please log in to continue', 401);
    }

    const { productId } = req.body;
    if (!productId) {
      throw new AppError('productId is required', 400);
    }

    const dbStatus = getDatabaseStatus();
    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (mongoose.Types.ObjectId.isValid(productId)) {
        if (!user.wishlist.some((w: any) => w.toString() === productId)) {
          user.wishlist.push(new mongoose.Types.ObjectId(productId) as any);
          await user.save();
        }
      }

      sendSuccess(res, 'Product added to wishlist', { wishlist: user.wishlist });
      return;
    }

    sendSuccess(res, 'Product added to wishlist (Session mode)', { productId });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/me/wishlist/:productId
 * Remove item from wishlist
 */
export const removeFromWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized: Please log in to continue', 401);
    }

    const { productId } = req.params;
    const dbStatus = getDatabaseStatus();

    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.wishlist = user.wishlist.filter(
        (w: any) => w.toString() !== productId && String(w) !== productId
      );
      await user.save();

      sendSuccess(res, 'Product removed from wishlist', { wishlist: user.wishlist });
      return;
    }

    sendSuccess(res, 'Product removed from wishlist (Session mode)', { productId });
  } catch (error) {
    next(error);
  }
};
