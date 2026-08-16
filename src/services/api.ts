/**
 * CasaAura Centralized API Client Service
 * 
 * Interacts with the backend Express API for Authentication, Products,
 * Orders, Tracking, and Admin operations.
 */

import { Product, Order, OrderStatus } from '../types';

export const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_URL || '').replace(/\/$/, '');

const AUTH_TOKEN_KEY = 'casaaura_auth_token';
const ADMIN_KEY_STORAGE = 'casaaura_admin_key';

// Token Management
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to store auth token in localStorage', e);
  }
};

export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (e) {
    console.error('Failed to remove auth token', e);
  }
};

export const getStoredAdminKey = (): string | null => {
  try {
    return localStorage.getItem(ADMIN_KEY_STORAGE);
  } catch {
    return null;
  }
};

export const setStoredAdminKey = (key: string): void => {
  try {
    localStorage.setItem(ADMIN_KEY_STORAGE, key);
  } catch (e) {
    console.error('Failed to store admin key', e);
  }
};

/**
 * Generic Fetch Wrapper with JSON handling & Bearer Auth injection
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string; [key: string]: any }> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const adminKey = getStoredAdminKey();
  if (adminKey && !headers['x-admin-key']) {
    headers['x-admin-key'] = adminKey;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let json: any;
    try {
      json = await res.json();
    } catch {
      json = { success: res.ok, message: res.statusText };
    }

    if (!res.ok) {
      const errorMsg = json.error || json.message || `Request failed with status ${res.status}`;
      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
        status: res.status,
      };
    }

    return json;
  } catch (err: any) {
    console.warn(`[API] Network error on ${endpoint}:`, err);
    return {
      success: false,
      error: err.message || 'Network request failed. Check server connection.',
      message: err.message || 'Network request failed.',
    };
  }
}

// -------------------------------------------------------------
// Product Normalization (Translates DB documents to UI Product)
// -------------------------------------------------------------
export function normalizeProduct(raw: any): Product {
  if (!raw) {
    return {
      id: 'unknown',
      name: 'Product',
      tagline: '',
      category: 'living-room',
      price: 0,
      rating: 4.8,
      reviewsCount: 1,
      image: '',
      images: [],
      description: '',
      colors: [{ name: 'Default', hex: '#E5E1D8' }],
      material: 'Artisan Decor',
      dimensions: 'Standard',
      careInstructions: [],
      inStock: true,
      reviews: [],
    };
  }

  const id = raw.id || raw._id || raw.sku || Math.random().toString(36).substring(2, 9);
  const images = Array.isArray(raw.images) && raw.images.length > 0
    ? raw.images
    : (raw.image ? [raw.image] : ['https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80']);
  const image = raw.image || images[0];

  const colors = Array.isArray(raw.colors) && raw.colors.length > 0
    ? raw.colors.map((c: any) => typeof c === 'string' ? { name: c, hex: '#C5A880' } : c)
    : [{ name: 'Default', hex: '#C5A880' }];

  const reviews = Array.isArray(raw.reviews)
    ? raw.reviews.map((r: any, idx: number) => ({
        id: r.id || r._id || `rev-${idx}`,
        author: r.author || r.user?.name || 'Verified Buyer',
        rating: r.rating || 5,
        date: r.date || 'Recently',
        comment: r.comment || '',
        verified: r.verified !== undefined ? r.verified : true,
        location: r.location || 'India',
      }))
    : [];

  return {
    id: String(id),
    name: raw.name || 'Artisan Piece',
    tagline: raw.tagline || (raw.description ? raw.description.substring(0, 45) : 'Handcrafted decor'),
    category: raw.category || 'living-room',
    price: Number(raw.price) || 0,
    originalPrice: raw.originalPrice ? Number(raw.originalPrice) : undefined,
    rating: Number(raw.rating) || 4.8,
    reviewsCount: Number(raw.reviewsCount || (reviews.length ? reviews.length : 12)),
    image,
    images,
    description: raw.description || '',
    colors,
    material: raw.material || 'Organic Materials',
    dimensions: raw.dimensions || 'Handmade Proportion',
    weight: raw.weight,
    careInstructions: Array.isArray(raw.careInstructions) ? raw.careInstructions : ['Dust gently with a dry microfiber cloth.'],
    inStock: raw.inStock !== undefined ? Boolean(raw.inStock) : (raw.stock !== undefined ? raw.stock > 0 : true),
    featured: Boolean(raw.featured),
    bestseller: Boolean(raw.bestseller),
    newArrival: Boolean(raw.newArrival),
    discountPercent: raw.discountPercent,
    reviews,
  };
}

// -------------------------------------------------------------
// Authentication API
// -------------------------------------------------------------
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses?: any[];
  wishlist?: string[];
}

export const authApi = {
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await request<{ user: AuthUser; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },

  async login(data: { email: string; password: string }) {
    const res = await request<{ user: AuthUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },

  async getMe() {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'No active session token' };
    return request<{ user: AuthUser }>('/api/auth/me');
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout
    } finally {
      removeAuthToken();
    }
  }
};

// -------------------------------------------------------------
// Users Profile & Addresses & Wishlist API
// -------------------------------------------------------------
export interface AddressPayload {
  id?: string;
  _id?: string;
  label?: string;
  name?: string;
  phone?: string;
  street?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  pincode?: string;
  country?: string;
  isDefault?: boolean;
}

export const usersApi = {
  async getProfile() {
    return request<{ user: AuthUser; name: string; email: string; phone?: string; addresses?: any[]; wishlist?: any[] }>('/api/users/me');
  },

  async updateProfile(data: { name?: string; phone?: string }) {
    return request<{ user: AuthUser; name: string; email: string; phone?: string }>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAddresses() {
    return request<any[]>('/api/users/me/addresses');
  },

  async addAddress(address: AddressPayload) {
    return request<any>('/api/users/me/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  async updateAddress(addressId: string, address: AddressPayload) {
    return request<any>(`/api/users/me/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  },

  async deleteAddress(addressId: string) {
    return request<{ success: boolean }>(`/api/users/me/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  async getWishlist() {
    return request<any[]>('/api/users/me/wishlist');
  },

  async addToWishlist(productId: string) {
    return request<{ wishlist: string[] }>('/api/users/me/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  async removeFromWishlist(productId: string) {
    return request<{ wishlist: string[] }>(`/api/users/me/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },
};

// -------------------------------------------------------------
// Products API
// -------------------------------------------------------------
export interface ProductQueryParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  material?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  async getProducts(params: ProductQueryParams = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
    if (params.inStock !== undefined) query.append('inStock', String(params.inStock));
    if (params.material && params.material !== 'all') query.append('material', params.material);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const endpoint = `/api/products${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await request<{ products: any[]; pagination?: any; total?: number }>(endpoint);

    if (res.success && Array.isArray(res.data?.products)) {
      return {
        ...res,
        products: res.data.products.map(normalizeProduct),
        pagination: res.data.pagination,
      };
    }
    return {
      ...res,
      products: [] as Product[],
    };
  },

  async getProductById(id: string) {
    const res = await request<{ product: any }>(`/api/products/${id}`);
    if (res.success && res.data?.product) {
      return {
        ...res,
        product: normalizeProduct(res.data.product),
      };
    }
    return res;
  },
};

// -------------------------------------------------------------
// Orders API
// -------------------------------------------------------------
export interface CreateOrderPayload {
  items: Array<{
    productId?: string;
    id?: string;
    product?: Product;
    quantity: number;
    selectedColor?: string;
    price?: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    email?: string;
    address?: string;
    street?: string;
    city: string;
    state: string;
    pincode?: string;
    postalCode?: string;
    country?: string;
  };
  paymentMethod: string;
  couponCode?: string;
  customer?: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export const ordersApi = {
  async createOrder(payload: CreateOrderPayload) {
    // Standardize items payload for backend schema
    const formattedItems = payload.items.map((it) => {
      const pid = it.productId || it.product?.id || it.id;
      return {
        productId: pid,
        quantity: it.quantity,
        selectedColor: it.selectedColor || 'Default',
        price: it.price || it.product?.price || 0,
      };
    });

    // Standardize shipping address
    const streetAddress = payload.shippingAddress.address || payload.shippingAddress.street || '';
    const postalCode = payload.shippingAddress.pincode || payload.shippingAddress.postalCode || '';

    const backendPayload = {
      items: formattedItems,
      shippingAddress: {
        fullName: payload.shippingAddress.fullName,
        phone: payload.shippingAddress.phone,
        street: streetAddress,
        city: payload.shippingAddress.city,
        state: payload.shippingAddress.state,
        postalCode: postalCode,
        country: payload.shippingAddress.country || 'India',
      },
      paymentMethod: payload.paymentMethod || 'upi',
      couponCode: payload.couponCode || undefined,
    };

    return request<{ order: any; message: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
  },

  async getMyOrders(params?: { page?: number; limit?: number; status?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const endpoint = `/api/orders${query.toString() ? `?${query.toString()}` : ''}`;
    return request<{ orders: any[]; pagination?: any }>(endpoint);
  },

  async getOrderById(orderId: string) {
    return request<{ order: any }>(`/api/orders/${orderId}`);
  },

  async getOrderTracking(orderId: string) {
    return request<{ tracking: any; order?: any }>(`/api/orders/${orderId}/tracking`);
  },

  async cancelOrder(orderId: string, reason?: string) {
    return request<{ order: any; message: string }>(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// -------------------------------------------------------------
// Admin Orders API
// -------------------------------------------------------------
export const adminApi = {
  async getOrders(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const endpoint = `/api/admin/orders${query.toString() ? `?${query.toString()}` : ''}`;
    return request<{ orders: any[]; pagination?: any; summary?: any }>(endpoint);
  },

  async updateOrderStatus(orderId: string, payload: { status: OrderStatus; note?: string; trackingNumber?: string }) {
    return request<{ order: any; message: string }>(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
