import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (requires Bearer JWT)
router.get('/me', authMiddleware as any, getMe);

export default router;
