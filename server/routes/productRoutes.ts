import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Public read routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin protected mutation routes (JWT with role: 'admin' OR x-admin-key header)
router.post('/', authMiddleware as any, adminMiddleware as any, createProduct);
router.put('/:id', authMiddleware as any, adminMiddleware as any, updateProduct);
router.delete('/:id', authMiddleware as any, adminMiddleware as any, deleteProduct);

export default router;
