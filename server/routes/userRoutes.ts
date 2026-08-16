import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protect all user profile, address, and wishlist endpoints with authMiddleware
router.use(authMiddleware as any);

// Profile
router.get('/me', getProfile);
router.put('/me', updateProfile);

// Saved Addresses
router.get('/me/addresses', getAddresses);
router.post('/me/addresses', addAddress);
router.put('/me/addresses/:id', updateAddress);
router.delete('/me/addresses/:id', deleteAddress);

// Wishlist
router.get('/me/wishlist', getWishlist);
router.post('/me/wishlist', addToWishlist);
router.delete('/me/wishlist/:productId', removeFromWishlist);

export default router;
