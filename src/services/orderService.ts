import { Order, OrderStatus, OrderTimelineStep, OrderItem, OrderShippingAddress, OrderCustomer } from '../types';
import { products } from '../data/products';
import { ordersApi, adminApi, normalizeProduct } from './api';

const STORAGE_KEY = 'casaaura_orders';

/**
 * Ordered list of status stages
 */
export const ORDER_STAGES: OrderStatus[] = [
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

export const STAGE_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Order Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

/**
 * Format timestamp helper
 */
export function formatTimestamp(base: Date, addDays = 0, addMinutes = 0): string {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + addDays);
  d.setMinutes(d.getMinutes() + addMinutes);
  
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day} ${month}, ${hours}:${minutes} ${ampm}`;
}

/**
 * Build timeline steps for an order given its current status
 */
export function buildTimeline(currentStatus: OrderStatus, orderDateStr?: string): OrderTimelineStep[] {
  const currentIndex = ORDER_STAGES.indexOf(currentStatus);
  const baseDate = orderDateStr ? new Date(orderDateStr) : new Date();

  return [
    {
      status: 'confirmed',
      label: 'Order Confirmed',
      timestamp: formatTimestamp(baseDate, 0, 0),
      description: 'Order placed & verified by CasaAura Artisan Desk',
      isCompleted: currentIndex >= 0,
      isCurrent: currentIndex === 0,
    },
    {
      status: 'processing',
      label: 'Processing',
      timestamp: currentIndex >= 1 ? formatTimestamp(baseDate, 0, 45) : 'Expected soon',
      description: 'Quality inspection & artisan inventory allocation',
      isCompleted: currentIndex >= 1,
      isCurrent: currentIndex === 1,
    },
    {
      status: 'packed',
      label: 'Packed',
      timestamp: currentIndex >= 2 ? formatTimestamp(baseDate, 1, 120) : 'Expected next business day',
      description: 'Carefully wrapped in eco-friendly honeycomb cushioning',
      isCompleted: currentIndex >= 2,
      isCurrent: currentIndex === 2,
    },
    {
      status: 'shipped',
      label: 'Shipped',
      timestamp: currentIndex >= 3 ? formatTimestamp(baseDate, 2, 240) : 'Expected in 1-2 days',
      description: 'Dispatched via CasaAura Air Express Cargo',
      isCompleted: currentIndex >= 3,
      isCurrent: currentIndex === 3,
    },
    {
      status: 'out_for_delivery',
      label: 'Out for Delivery',
      timestamp: currentIndex >= 4 ? formatTimestamp(baseDate, 3, 400) : 'Expected on arrival',
      description: 'Delivery associate assigned for doorstep drop-off',
      isCompleted: currentIndex >= 4,
      isCurrent: currentIndex === 4,
    },
    {
      status: 'delivered',
      label: 'Delivered',
      timestamp: currentIndex >= 5 ? formatTimestamp(baseDate, 3, 580) : 'Estimated delivery within 3–5 days',
      description: 'Safely handed over to customer with OTP verification',
      isCompleted: currentIndex >= 5,
      isCurrent: currentIndex === 5,
    },
  ];
}

/**
 * Normalize an order from MongoDB backend format to frontend UI format
 */
export function normalizeOrder(raw: any): Order {
  if (!raw) {
    throw new Error('Invalid order data received');
  }

  const rawStatus = (raw.orderStatus || raw.status || 'confirmed').toLowerCase() as OrderStatus;
  const status: OrderStatus = ORDER_STAGES.includes(rawStatus) ? rawStatus : 'confirmed';
  
  const createdDate = raw.createdAt ? new Date(raw.createdAt) : new Date();
  const orderDate = raw.orderDate || formatTimestamp(createdDate, 0, 0);

  // Normalize items
  const items: OrderItem[] = Array.isArray(raw.items)
    ? raw.items.map((item: any) => {
        let productObj = typeof item.product === 'object' && item.product !== null
          ? normalizeProduct(item.product)
          : products.find(p => p.id === String(item.product || item.productId)) || {
              id: String(item.product || item.productId || 'p-gen'),
              name: item.name || 'Artisan Decor Piece',
              tagline: 'Curated living accent',
              category: 'living-room',
              price: item.price || 0,
              rating: 4.9,
              reviewsCount: 24,
              image: item.image || 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
              images: [item.image || 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80'],
              description: 'Handcrafted piece from CasaAura catalog.',
              colors: [{ name: item.selectedColor || 'Default', hex: '#E6DFD5' }],
              material: 'Artisan Finish',
              dimensions: 'Standard Size',
              careInstructions: [],
              inStock: true,
              reviews: [],
            };

        return {
          product: productObj,
          quantity: Number(item.quantity) || 1,
          selectedColor: item.selectedColor || 'Default',
          price: Number(item.price) || productObj.price || 0,
        };
      })
    : [];

  // Normalize shipping address
  const addr = raw.shippingAddress || {};
  const shippingAddress: OrderShippingAddress = {
    fullName: addr.fullName || raw.customer?.fullName || 'Valued Customer',
    email: addr.email || raw.customer?.email || 'customer@casaaura.in',
    phone: addr.phone || raw.customer?.phone || '+91 98765 43210',
    address: addr.address || addr.street || 'Address not specified',
    city: addr.city || 'Bengaluru',
    state: addr.state || 'Karnataka',
    pincode: addr.pincode || addr.postalCode || '560001',
  };

  const customer: OrderCustomer = {
    fullName: raw.customer?.fullName || shippingAddress.fullName,
    email: raw.customer?.email || shippingAddress.email,
    phone: raw.customer?.phone || shippingAddress.phone,
  };

  // Build timeline: prefer backend timeline if populated with formatted steps, else build dynamically
  const timeline: OrderTimelineStep[] = Array.isArray(raw.timeline) && raw.timeline.length > 0
    ? raw.timeline.map((t: any) => ({
        status: (t.status || 'confirmed').toLowerCase() as OrderStatus,
        label: t.label || STAGE_LABELS[t.status as OrderStatus] || t.status,
        timestamp: t.timestamp || formatTimestamp(createdDate),
        description: t.description || '',
        isCompleted: Boolean(t.isCompleted),
        isCurrent: Boolean(t.isCurrent),
      }))
    : buildTimeline(status, createdDate.toISOString());

  return {
    orderId: raw.orderId || `CASA-${Date.now()}`,
    orderDate,
    customer,
    items,
    subtotal: Number(raw.subtotal) || 0,
    shipping: Number(raw.shipping) || 0,
    discount: Number(raw.discount) || 0,
    total: Number(raw.total) || 0,
    paymentMethod: raw.paymentMethod || 'UPI / Online',
    paymentStatus: raw.paymentStatus || 'Paid',
    transactionId: raw.transactionId || raw.orderId || 'TXN-ONLINE',
    orderStatus: status,
    estimatedDelivery: raw.estimatedDelivery || 'Within 4–6 business days',
    shippingAddress,
    trackingNumber: raw.trackingNumber || `CA${Math.floor(100000000 + Math.random() * 900000000)}IN`,
    timeline,
  };
}

/**
 * Local fallback sample orders
 */
function getInitialSampleOrders(): Order[] {
  const now = new Date();
  const sample1Date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const sample1Id = 'CASA-20260815-9A21P';
  const sample2Date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sample2Id = 'CASA-20260812-4D91M';

  return [
    {
      orderId: sample1Id,
      orderDate: formatTimestamp(sample1Date, 0, 0),
      customer: {
        fullName: 'Nirnay Mondal',
        email: 'nirnay@example.com',
        phone: '+91 98765 43210',
      },
      items: [
        {
          product: products[0],
          quantity: 1,
          selectedColor: 'Oatmeal Chalk',
          price: 899,
        },
        {
          product: products[1],
          quantity: 1,
          selectedColor: 'Warm Cream',
          price: 1299,
        },
      ],
      subtotal: 2198,
      shipping: 0,
      discount: 0,
      total: 2198,
      paymentMethod: 'UPI / GPay / PhonePe',
      paymentStatus: 'Paid',
      transactionId: 'UPI-CA-92837461',
      orderStatus: 'shipped',
      estimatedDelivery: '20–22 August 2026',
      shippingAddress: {
        fullName: 'Nirnay Mondal',
        email: 'nirnay@example.com',
        phone: '+91 98765 43210',
        address: '123 Heritage Park, Ballygunge',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700019',
      },
      trackingNumber: 'CA784512963IN',
      timeline: buildTimeline('shipped', sample1Date.toISOString()),
    },
    {
      orderId: sample2Id,
      orderDate: formatTimestamp(sample2Date, 0, 0),
      customer: {
        fullName: 'Nirnay Mondal',
        email: 'nirnay@example.com',
        phone: '+91 98765 43210',
      },
      items: [
        {
          product: products[2],
          quantity: 1,
          selectedColor: 'Earthy Sand',
          price: 1499,
        },
      ],
      subtotal: 1499,
      shipping: 0,
      discount: 150,
      total: 1349,
      paymentMethod: 'Visa & Mastercard',
      paymentStatus: 'Paid',
      transactionId: 'CARD-AUTH-83920194',
      orderStatus: 'delivered',
      estimatedDelivery: '14 August 2026',
      shippingAddress: {
        fullName: 'Nirnay Mondal',
        email: 'nirnay@example.com',
        phone: '+91 98765 43210',
        address: '123 Heritage Park, Ballygunge',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700019',
      },
      trackingNumber: 'CA994821034IN',
      timeline: buildTimeline('delivered', sample2Date.toISOString()),
    },
  ];
}

/**
 * Retrieve cached local orders
 */
export function getLocalCachedOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSampleOrders();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return getInitialSampleOrders();
  }
}

/**
 * Save orders to local storage cache
 */
export function saveLocalCachedOrders(ordersList: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordersList));
  } catch (err) {
    console.error('Failed to save orders to localStorage', err);
  }
}

/**
 * Fetch orders from backend API with fallback to localStorage
 */
export async function fetchUserOrders(): Promise<Order[]> {
  try {
    const res = await ordersApi.getMyOrders();
    if (res.success && Array.isArray(res.data?.orders)) {
      const normalized = res.data.orders.map(normalizeOrder);
      saveLocalCachedOrders(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('[orderService] fetchUserOrders fallback to local storage', err);
  }
  return getLocalCachedOrders();
}

/**
 * Synchronous getOrders (for instant context initialization)
 */
export function getOrders(): Order[] {
  return getLocalCachedOrders();
}

/**
 * Fetch single order by ID or tracking number from API
 */
export async function fetchOrderById(orderId: string): Promise<Order | null> {
  if (!orderId) return null;
  const cleanId = orderId.trim().toUpperCase();

  try {
    // Try full order endpoint first
    const res = await ordersApi.getOrderById(cleanId);
    if (res.success && res.data?.order) {
      return normalizeOrder(res.data.order);
    }
  } catch {
    // Continue to tracking endpoint
  }

  try {
    // Try public tracking endpoint
    const trackingRes = await ordersApi.getOrderTracking(cleanId);
    if (trackingRes.success && trackingRes.data?.tracking) {
      const tr = trackingRes.data.tracking;
      return normalizeOrder({
        orderId: tr.orderId || cleanId,
        orderStatus: tr.currentStatus,
        trackingNumber: tr.trackingNumber,
        estimatedDelivery: tr.estimatedDelivery,
        timeline: tr.timeline,
        items: Array.isArray(tr.items) ? tr.items : [],
        total: tr.totalAmount || 0,
        shippingAddress: {
          city: tr.destinationCity || 'India',
        },
      });
    }
  } catch (err) {
    console.warn('[orderService] fetchOrderById fallback to cache', err);
  }

  // Fallback to local cache
  const local = getLocalCachedOrders();
  return local.find((o) => o.orderId.toUpperCase() === cleanId || o.trackingNumber.toUpperCase() === cleanId) || null;
}

export const fetchOrderTracking = fetchOrderById;

/**
 * Sync get order by ID from cache
 */
export function getOrderById(orderId: string): Order | undefined {
  if (!orderId) return undefined;
  const cleanId = orderId.trim().toUpperCase();
  const allOrders = getLocalCachedOrders();
  return allOrders.find((o) => o.orderId.toUpperCase() === cleanId || o.trackingNumber.toUpperCase() === cleanId);
}

export interface CreateOrderParams {
  customer: OrderCustomer;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: 'Paid' | 'Pending';
  couponCode?: string;
}

/**
 * Create a new order via Backend API (with graceful local fallback)
 */
export async function createOrder(params: CreateOrderParams): Promise<Order> {
  try {
    const res = await ordersApi.createOrder({
      items: params.items.map((it) => ({
        productId: it.product?.id,
        quantity: it.quantity,
        selectedColor: it.selectedColor,
        price: it.price || it.product?.price,
      })),
      shippingAddress: {
        fullName: params.shippingAddress.fullName,
        phone: params.shippingAddress.phone,
        street: params.shippingAddress.address,
        city: params.shippingAddress.city,
        state: params.shippingAddress.state,
        postalCode: params.shippingAddress.pincode,
        country: 'India',
      },
      paymentMethod: params.paymentMethod,
      couponCode: params.couponCode,
    });

    if (res.success && res.data?.order) {
      const normalized = normalizeOrder(res.data.order);
      const existing = getLocalCachedOrders();
      const updated = [normalized, ...existing.filter(o => o.orderId !== normalized.orderId)];
      saveLocalCachedOrders(updated);
      return normalized;
    }
  } catch (err) {
    console.warn('[orderService] API createOrder failed, generating local order fallback', err);
  }

  // Local fallback creation if API is unavailable
  const orderId = `CASA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const trackingNumber = `CA${Math.floor(100000000 + Math.random() * 900000000)}IN`;
  const now = new Date();
  
  const startDel = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const endDel = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const estimatedDelivery = `${startDel.getDate()}–${endDel.getDate()} ${months[endDel.getMonth()]} ${endDel.getFullYear()}`;

  const isCOD = params.paymentMethod.toLowerCase().includes('cash on delivery') || params.paymentMethod.toLowerCase().includes('cod');
  const paymentStatus: 'Paid' | 'Pending' = params.paymentStatus || (isCOD ? 'Pending' : 'Paid');
  const orderDate = formatTimestamp(now, 0, 0);

  const initialStatus: OrderStatus = 'confirmed';
  const timeline = buildTimeline(initialStatus, now.toISOString());

  const newOrder: Order = {
    orderId,
    orderDate,
    customer: params.customer,
    items: params.items,
    subtotal: params.subtotal,
    shipping: params.shipping,
    discount: params.discount,
    total: params.total,
    paymentMethod: params.paymentMethod,
    paymentStatus,
    transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
    orderStatus: initialStatus,
    estimatedDelivery,
    shippingAddress: params.shippingAddress,
    trackingNumber,
    timeline,
  };

  const existing = getLocalCachedOrders();
  const updated = [newOrder, ...existing];
  saveLocalCachedOrders(updated);

  return newOrder;
}

/**
 * Update order status via Admin API (with local fallback)
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order | null> {
  try {
    const res = await adminApi.updateOrderStatus(orderId, { status: newStatus });
    if (res.success && res.data?.order) {
      const normalized = normalizeOrder(res.data.order);
      const orders = getLocalCachedOrders();
      const idx = orders.findIndex(o => o.orderId.toUpperCase() === orderId.trim().toUpperCase());
      if (idx !== -1) {
        orders[idx] = normalized;
        saveLocalCachedOrders(orders);
      }
      return normalized;
    }
  } catch (err) {
    console.warn('[orderService] Admin status update fallback to local', err);
  }

  // Local fallback
  const orders = getLocalCachedOrders();
  const index = orders.findIndex((o) => o.orderId.toUpperCase() === orderId.trim().toUpperCase());
  if (index === -1) return null;

  const currentOrder = orders[index];
  const updatedTimeline = buildTimeline(newStatus);

  const updatedOrder: Order = {
    ...currentOrder,
    orderStatus: newStatus,
    timeline: updatedTimeline,
  };

  orders[index] = updatedOrder;
  saveLocalCachedOrders(orders);

  return updatedOrder;
}

/**
 * Advance status to next stage
 */
export async function simulateNextStatus(orderId: string): Promise<Order | null> {
  const order = getOrderById(orderId);
  if (!order) return null;

  const currentIndex = ORDER_STAGES.indexOf(order.orderStatus);
  if (currentIndex === -1 || currentIndex >= ORDER_STAGES.length - 1) {
    return updateOrderStatus(orderId, 'confirmed');
  }

  const nextStatus = ORDER_STAGES[currentIndex + 1];
  return updateOrderStatus(orderId, nextStatus);
}
