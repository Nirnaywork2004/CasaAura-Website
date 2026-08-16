import mongoose, { Document, Schema, Model } from 'mongoose';

export type OrderStatus =
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'cod_pending';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IStatusTimelineItem {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: Date;
  completed: boolean;
}

export interface IOrder extends Document {
  orderId: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: IShippingAddress;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  timeline: IStatusTimelineItem[];
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: true }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
  },
  { _id: false }
);

const StatusTimelineSchema = new Schema<IStatusTimelineItem>(
  {
    status: {
      type: String,
      enum: ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    completed: { type: Boolean, default: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (v: IOrderItem[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one product item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    shipping: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Shipping cost cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'cod'],
      default: 'upi',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'cod_pending'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    estimatedDelivery: {
      type: Date,
    },
    timeline: {
      type: [StatusTimelineSchema],
      default: [],
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Helper function to generate human-readable unique Order IDs
export const generateOrderId = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CASA-${dateStr}-${randomSuffix}`;
};

// Helper function to generate initial tracking number
export const generateTrackingNumber = (): string => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `DEL-CASA-${randomDigits}`;
};

// Helper function to create status timeline entry
export const createTimelineEntry = (
  status: OrderStatus,
  customNote?: string
): IStatusTimelineItem => {
  const statusMeta: Record<OrderStatus, { title: string; description: string }> = {
    confirmed: {
      title: 'Order Confirmed',
      description: customNote || 'Your order has been placed and confirmed by CasaAura.',
    },
    processing: {
      title: 'Order Processing',
      description: customNote || 'We have verified item availability and are preparing your order.',
    },
    packed: {
      title: 'Order Packed',
      description: customNote || 'Items have been quality checked and securely packaged for shipment.',
    },
    shipped: {
      title: 'Dispatched / Shipped',
      description: customNote || 'Package handed over to our premier courier partner.',
    },
    out_for_delivery: {
      title: 'Out for Delivery',
      description: customNote || 'The delivery agent is en route to your shipping destination.',
    },
    delivered: {
      title: 'Delivered',
      description: customNote || 'Package was successfully delivered to your address.',
    },
    cancelled: {
      title: 'Order Cancelled',
      description: customNote || 'Order has been cancelled.',
    },
  };

  const meta = statusMeta[status] || {
    title: status.toUpperCase(),
    description: customNote || `Order status updated to ${status}.`,
  };

  return {
    status,
    title: meta.title,
    description: meta.description,
    timestamp: new Date(),
    completed: true,
  };
};

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
