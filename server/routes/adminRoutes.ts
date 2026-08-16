import { Router } from 'express';
import {
  getAdminOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Protect all admin routes with authentication & admin role guard
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

// GET /api/admin/orders - Retrieve all customer orders
router.get('/orders', getAdminOrders);

// PATCH /api/admin/orders/:orderId/status - Update order status, tracking, and delivery date
router.patch('/orders/:orderId/status', updateOrderStatus);

export default router;
