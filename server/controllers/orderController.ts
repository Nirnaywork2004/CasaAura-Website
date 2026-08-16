import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  Order,
  IOrder,
  IOrderItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  generateOrderId,
  generateTrackingNumber,
  createTimelineEntry,
} from '../models/Order';
import { Product } from '../models/Product';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse';
import { getDatabaseStatus } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { sampleProducts } from '../seeds/seedProducts';

// In-memory fallback orders store for offline testing
interface InMemoryOrder {
  _id: string;
  id: string;
  orderId: string;
  user: string;
  userEmail?: string;
  userName?: string;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: any;
  trackingNumber: string;
  estimatedDelivery: string;
  timeline: any[];
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

const inMemoryOrders: InMemoryOrder[] = [];

/**
 * Validates shipping address payload
 */
const validateAddress = (address: any): boolean => {
  return (
    address &&
    typeof address.fullName === 'string' && address.fullName.trim() !== '' &&
    typeof address.phone === 'string' && address.phone.trim() !== '' &&
    typeof address.street === 'string' && address.street.trim() !== '' &&
    typeof address.city === 'string' && address.city.trim() !== '' &&
    typeof address.state === 'string' && address.state.trim() !== '' &&
    typeof address.postalCode === 'string' && address.postalCode.trim() !== ''
  );
};

/**
 * POST /api/orders
 * 
 * Authenticated customer checkout endpoint
 * Server-authoritative price calculation & stock verification
 */
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Authentication required to create an order', 401);
    }

    const {
      items,
      shippingAddress,
      paymentMethod = 'upi',
      couponCode,
    } = req.body;

    // 1. Validate Input Payload
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Order must contain at least one item in the cart', 400);
    }

    if (!validateAddress(shippingAddress)) {
      throw new AppError(
        'Complete shipping address is required (fullName, phone, street, city, state, postalCode)',
        400
      );
    }

    const allowedPaymentMethods: PaymentMethod[] = ['upi', 'card', 'netbanking', 'cod'];
    const selectedPaymentMethod: PaymentMethod = allowedPaymentMethods.includes(paymentMethod)
      ? paymentMethod
      : 'upi';

    const dbStatus = getDatabaseStatus();

    // 2. DATABASE CONNECTED WORKFLOW
    if (dbStatus.isConnected) {
      const orderItems: IOrderItem[] = [];
      let calculatedSubtotal = 0;
      const productsToUpdate: { productDoc: any; qty: number }[] = [];

      for (const item of items) {
        const prodId = item.productId || item.product || item.id || item._id;
        const quantity = parseInt(item.quantity, 10);

        if (!prodId || isNaN(quantity) || quantity <= 0) {
          throw new AppError('Each item must specify a valid productId and quantity >= 1', 400);
        }

        let productDoc: any = null;
        if (mongoose.Types.ObjectId.isValid(prodId)) {
          productDoc = await Product.findById(prodId);
        }

        if (!productDoc) {
          throw new AppError(`Product with ID '${prodId}' not found in catalog`, 404);
        }

        // Check stock availability
        if (productDoc.stock < quantity) {
          throw new AppError(
            `Insufficient stock for '${productDoc.name}'. Only ${productDoc.stock} available.`,
            400
          );
        }

        // Use server-side authoritative price
        const itemPrice = productDoc.price;
        calculatedSubtotal += itemPrice * quantity;

        orderItems.push({
          product: productDoc._id,
          name: productDoc.name,
          image: productDoc.images[0] || 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c',
          quantity,
          price: itemPrice,
        });

        productsToUpdate.push({ productDoc, qty: quantity });
      }

      // Calculate Shipping: Free for orders >= ₹2500, else ₹199
      const calculatedShipping = calculatedSubtotal >= 2500 ? 0 : 199;

      // Calculate Discounts (e.g. promo codes)
      let calculatedDiscount = 0;
      if (couponCode && typeof couponCode === 'string') {
        const code = couponCode.trim().toUpperCase();
        if (code === 'AURA10' || code === 'WELCOME10') {
          calculatedDiscount = Math.round(calculatedSubtotal * 0.1); // 10% off
        } else if (code === 'CASA500' && calculatedSubtotal >= 3000) {
          calculatedDiscount = 500;
        }
      }

      const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedShipping - calculatedDiscount);

      // Payment Status logic (Do NOT assume UPI is auto-paid)
      const paymentStatus: PaymentStatus =
        selectedPaymentMethod === 'cod' ? 'cod_pending' : 'pending';

      const orderId = generateOrderId();
      const trackingNumber = generateTrackingNumber();
      const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
      const initialTimeline = [createTimelineEntry('confirmed', 'Order placed and confirmed by customer.')];

      // Create Order document
      const newOrder = await Order.create({
        orderId,
        user: req.user.id,
        items: orderItems,
        subtotal: calculatedSubtotal,
        shipping: calculatedShipping,
        discount: calculatedDiscount,
        total: calculatedTotal,
        paymentMethod: selectedPaymentMethod,
        paymentStatus,
        orderStatus: 'confirmed',
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          street: shippingAddress.street.trim(),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country?.trim() || 'India',
        },
        trackingNumber,
        estimatedDelivery,
        timeline: initialTimeline,
      });

      // Reduce product stock in database
      for (const item of productsToUpdate) {
        await Product.findByIdAndUpdate(item.productDoc._id, {
          $inc: { stock: -item.qty },
        });
      }

      sendSuccess(res, 'Order created successfully', newOrder, 201);
      return;
    }

    // 3. IN-MEMORY FALLBACK (When MongoDB is not connected)
    const orderItems: IOrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const prodId = item.productId || item.product || item.id || item._id;
      const quantity = parseInt(item.quantity, 10) || 1;

      // Find in seed catalog or mock
      const foundSample = sampleProducts.find(
        (p, idx) => `mock-${idx + 1}` === prodId || p.name.toLowerCase() === String(item.name || '').toLowerCase()
      ) || sampleProducts[0];

      const itemPrice = foundSample.price;
      calculatedSubtotal += itemPrice * quantity;

      orderItems.push({
        product: new mongoose.Types.ObjectId() as any,
        name: foundSample.name,
        image: foundSample.images[0],
        quantity,
        price: itemPrice,
      });
    }

    const calculatedShipping = calculatedSubtotal >= 2500 ? 0 : 199;
    let calculatedDiscount = 0;
    if (couponCode && typeof couponCode === 'string') {
      const code = couponCode.trim().toUpperCase();
      if (code === 'AURA10' || code === 'WELCOME10') {
        calculatedDiscount = Math.round(calculatedSubtotal * 0.1);
      }
    }
    const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedShipping - calculatedDiscount);

    const paymentStatus: PaymentStatus =
      selectedPaymentMethod === 'cod' ? 'cod_pending' : 'pending';

    const orderId = generateOrderId();
    const mockId = new mongoose.Types.ObjectId().toString();
    const trackingNumber = generateTrackingNumber();
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const inMemOrder: InMemoryOrder = {
      _id: mockId,
      id: mockId,
      orderId,
      user: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      items: orderItems,
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      discount: calculatedDiscount,
      total: calculatedTotal,
      paymentMethod: selectedPaymentMethod,
      paymentStatus,
      orderStatus: 'confirmed',
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country?.trim() || 'India',
      },
      trackingNumber,
      estimatedDelivery,
      timeline: [createTimelineEntry('confirmed', 'Order placed and confirmed.')],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryOrders.unshift(inMemOrder);

    sendSuccess(
      res,
      'Order created successfully (Temporary In-Memory Mode - Connect MongoDB to persist)',
      inMemOrder,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 * 
 * Retrieves all orders belonging to authenticated customer
 */
export const getCustomerOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Authentication required to view orders', 401);
    }

    const { page = '1', limit = '10', status } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const dbStatus = getDatabaseStatus();

    if (dbStatus.isConnected) {
      const filter: Record<string, any> = { user: req.user.id };
      if (status && status !== 'all') {
        filter.orderStatus = status;
      }

      const total = await Order.countDocuments(filter);
      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      sendSuccess(res, 'Customer orders retrieved successfully', {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          hasMore: skip + orders.length < total,
        },
      });
      return;
    }

    // In-memory fallback
    let filtered = inMemoryOrders.filter((o) => o.user === req.user?.id);
    if (status && status !== 'all') {
      filtered = filtered.filter((o) => o.orderStatus === status);
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);

    sendSuccess(res, 'Customer orders retrieved successfully (Mock Mode)', {
      orders: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasMore: skip + paginated.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to lookup order by ID or orderId string
 */
const findOrderByIdOrCode = async (identifier: string, isDbConnected: boolean) => {
  if (isDbConnected) {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    if (isObjectId) {
      const byId = await Order.findById(identifier);
      if (byId) return byId;
    }
    return await Order.findOne({ orderId: identifier.toUpperCase().trim() });
  }

  return (
    inMemoryOrders.find(
      (o) =>
        o._id === identifier ||
        o.id === identifier ||
        o.orderId.toUpperCase() === identifier.toUpperCase().trim()
    ) || null
  );
};

/**
 * GET /api/orders/:orderId
 * 
 * Retrieve single order details for authorized owner (or admin)
 */
export const getCustomerOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Authentication required', 401);
    }

    const { orderId } = req.params;
    const dbStatus = getDatabaseStatus();
    const order: any = await findOrderByIdOrCode(orderId, dbStatus.isConnected);

    if (!order) {
      throw new AppError(`Order '${orderId}' not found`, 404);
    }

    // Verify ownership or admin privileges
    const orderUserId = order.user?.toString() || order.user;
    if (orderUserId !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Forbidden: You do not have permission to view this order', 403);
    }

    sendSuccess(res, 'Order details retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:orderId/cancel
 * 
 * Customer cancels their order (Allowed only before shipping)
 */
export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Authentication required to cancel an order', 401);
    }

    const { orderId } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;
    const dbStatus = getDatabaseStatus();

    const order: any = await findOrderByIdOrCode(orderId, dbStatus.isConnected);

    if (!order) {
      throw new AppError(`Order '${orderId}' not found`, 404);
    }

    // Verify ownership
    const orderUserId = order.user?.toString() || order.user;
    if (orderUserId !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Forbidden: You can only cancel your own orders', 403);
    }

    // Check cancellation eligibility
    if (order.orderStatus === 'cancelled') {
      throw new AppError('This order has already been cancelled', 400);
    }

    if (['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus)) {
      throw new AppError(
        `Cannot cancel order because it is already ${order.orderStatus.replace(/_/g, ' ')}. Please contact support.`,
        400
      );
    }

    const cancelTimelineEntry = createTimelineEntry('cancelled', reason);

    if (dbStatus.isConnected) {
      order.orderStatus = 'cancelled';
      order.cancellationReason = reason;
      order.timeline.push(cancelTimelineEntry);

      if (order.paymentStatus === 'paid') {
        order.paymentStatus = 'refunded';
      }

      await order.save();

      // Restore product stock
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }

      sendSuccess(res, 'Order cancelled successfully', order);
      return;
    }

    // In-memory update
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    order.timeline.push(cancelTimelineEntry);
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }
    order.updatedAt = new Date().toISOString();

    sendSuccess(res, 'Order cancelled successfully (Temporary Memory Mode)', order);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:orderId/tracking
 * 
 * Retrieve customer-facing order tracking & status timeline
 */
export const getOrderTracking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const dbStatus = getDatabaseStatus();

    const order: any = await findOrderByIdOrCode(orderId, dbStatus.isConnected);

    if (!order) {
      throw new AppError(`Order '${orderId}' not found`, 404);
    }

    // Verify ownership if user is logged in
    if (req.user) {
      const orderUserId = order.user?.toString() || order.user;
      if (orderUserId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Forbidden: You do not have permission to view tracking for this order', 403);
      }
    }

    const trackingData = {
      orderId: order.orderId,
      currentStatus: order.orderStatus,
      trackingNumber: order.trackingNumber || generateTrackingNumber(),
      estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 5 * 86400000),
      itemsCount: order.items ? order.items.length : 0,
      totalAmount: order.total,
      destinationCity: order.shippingAddress ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : 'India',
      timeline: order.timeline || [],
      updatedAt: order.updatedAt,
    };

    sendSuccess(res, 'Order tracking details retrieved', trackingData);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders (Admin Only)
 * 
 * Retrieve all orders with filtering and pagination
 */
export const getAdminOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      paymentStatus,
      search,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const dbStatus = getDatabaseStatus();

    if (dbStatus.isConnected) {
      const filter: Record<string, any> = {};

      if (status && status !== 'all') {
        filter.orderStatus = status;
      }

      if (paymentStatus && paymentStatus !== 'all') {
        filter.paymentStatus = paymentStatus;
      }

      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim();
        filter.$or = [
          { orderId: { $regex: q, $options: 'i' } },
          { 'shippingAddress.fullName': { $regex: q, $options: 'i' } },
          { 'shippingAddress.phone': { $regex: q, $options: 'i' } },
          { trackingNumber: { $regex: q, $options: 'i' } },
        ];
      }

      const sortOption: Record<string, 1 | -1> = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

      const total = await Order.countDocuments(filter);
      const orders = await Order.find(filter)
        .populate('user', 'name email phone')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

      sendSuccess(res, 'Admin orders retrieved successfully', {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          hasMore: skip + orders.length < total,
        },
      });
      return;
    }

    // In-memory fallback for admin
    let filtered = [...inMemoryOrders];

    if (status && status !== 'all') {
      filtered = filtered.filter((o) => o.orderStatus === status);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      filtered = filtered.filter((o) => o.paymentStatus === paymentStatus);
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.shippingAddress?.fullName.toLowerCase().includes(q) ||
          o.shippingAddress?.phone.includes(q) ||
          o.trackingNumber?.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);

    sendSuccess(res, 'Admin orders retrieved successfully (Mock Mode)', {
      orders: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasMore: skip + paginated.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/orders/:orderId/status (Admin Only)
 * 
 * Update order status, tracking number, or estimated delivery date
 */
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const {
      status,
      trackingNumber,
      estimatedDelivery,
      note,
      paymentStatus,
    } = req.body;

    const validStatuses: OrderStatus[] = [
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ];

    if (status && !validStatuses.includes(status)) {
      throw new AppError(
        `Invalid order status. Must be one of: ${validStatuses.join(', ')}`,
        400
      );
    }

    const dbStatus = getDatabaseStatus();
    const order: any = await findOrderByIdOrCode(orderId, dbStatus.isConnected);

    if (!order) {
      throw new AppError(`Order '${orderId}' not found`, 404);
    }

    // Apply updates
    if (status && status !== order.orderStatus) {
      const timelineEntry = createTimelineEntry(status, note);
      order.orderStatus = status;
      order.timeline.push(timelineEntry);

      // If marked delivered & cod -> mark paymentStatus paid
      if (status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'cod_pending') {
        order.paymentStatus = 'paid';
      }
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber.trim();
    }

    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (dbStatus.isConnected) {
      await order.save();
      sendSuccess(res, `Order '${order.orderId}' updated successfully`, order);
      return;
    }

    order.updatedAt = new Date().toISOString();
    sendSuccess(res, `Order '${order.orderId}' updated successfully (Temporary Memory Mode)`, order);
  } catch (error) {
    next(error);
  }
};
