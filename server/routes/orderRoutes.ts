import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
  getCustomerOrderById,
  cancelOrder,
  getOrderTracking,
} from '../controllers/orderController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/orders/:orderId/tracking - Public & authenticated tracking timeline
router.get('/:orderId/tracking', optionalAuthMiddleware as any, getOrderTracking);

// Customer Order Endpoints (Require authentication)
router.use(authMiddleware as any);

// POST /api/orders - Create a new order
router.post('/', createOrder);

// GET /api/orders - List customer orders
router.get('/', getCustomerOrders);

// GET /api/orders/:orderId - Get single order details
router.get('/:orderId', getCustomerOrderById);

// POST /api/orders/:orderId/cancel - Cancel pending order
router.post('/:orderId/cancel', cancelOrder);

export default router;

