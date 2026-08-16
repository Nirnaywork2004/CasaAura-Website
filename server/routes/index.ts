import { Router } from 'express';
import healthRoutes from './healthRoutes';
import productRoutes from './productRoutes';
import authRoutes from './authRoutes';
import orderRoutes from './orderRoutes';
import adminRoutes from './adminRoutes';
import userRoutes from './userRoutes';

const apiRouter = Router();

// Mount API Sub-routers
apiRouter.use('/health', healthRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
