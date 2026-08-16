export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  location?: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  description: string;
  colors: { name: string; hex: string }[];
  material: string;
  dimensions: string;
  weight?: string;
  careInstructions: string[];
  inStock: boolean;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  discountPercent?: number;
  reviews: ProductReview[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
  material: string;
  searchQuery: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'newest';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  avatar: string;
  productName: string;
}

export type OrderStatus = 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  timestamp: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
}

export interface OrderShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  price: number;
}

export interface Order {
  orderId: string;
  orderDate: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending';
  transactionId: string;
  orderStatus: OrderStatus;
  estimatedDelivery: string;
  shippingAddress: OrderShippingAddress;
  trackingNumber: string;
  timeline: OrderTimelineStep[];
}
