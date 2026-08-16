import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, ToastMessage, Order, OrderStatus } from '../types';
import { 
  getOrders, 
  createOrder as saveOrderViaService, 
  simulateNextStatus as advanceStatusViaService, 
  fetchUserOrders,
  CreateOrderParams 
} from '../services/orderService';
import { authApi, AuthUser, productsApi, ProductQueryParams } from '../services/api';
import { products as fallbackStaticProducts } from '../data/products';

interface CartWishlistContextType {
  // Products from Backend API
  productsList: Product[];
  isLoadingProducts: boolean;
  productsError: string | null;
  fetchProducts: (params?: ProductQueryParams) => Promise<void>;

  // Authentication State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Cart State
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackOrderOpen: boolean;
  setIsTrackOrderOpen: (open: boolean) => void;
  activeModalProduct: Product | null;
  setActiveModalProduct: (product: Product | null) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number, selectedColor?: string, openDrawer?: boolean) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  
  // Coupon
  couponCode: string;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Wishlist Actions
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  
  // Toast Notifications
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  
  // Orders Management
  orders: Order[];
  isLoadingOrders: boolean;
  selectedTrackingOrderId: string | null;
  setSelectedTrackingOrderId: (id: string | null) => void;
  activeOrderDetails: Order | null;
  setActiveOrderDetails: (order: Order | null) => void;
  createNewOrder: (params: CreateOrderParams) => Promise<Order>;
  advanceOrderStatus: (orderId: string) => Promise<Order | null>;
  navigateToTrackOrder: (orderId?: string) => void;
  navigateToMyOrders: () => void;
  lastPlacedOrder: Order | null;
  setLastPlacedOrder: (order: Order | null) => void;
  refreshOrders: () => Promise<void>;

  // Format Currency
  formatPrice: (amount: number) => string;
  freeShippingThreshold: number;
}

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined);

export const CartWishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const FREE_SHIPPING_THRESHOLD = 999;

  // Authentication state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Products from Backend
  const [productsList, setProductsList] = useState<Product[]>(fallbackStaticProducts);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // LocalStorage Cart & Wishlist Init
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('casaaura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('casaaura_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders state initialized from cache / fallback
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);
  const [activeOrderDetails, setActiveOrderDetails] = useState<Order | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add Toast helper
  const addToast = useCallback((type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch products from backend API
  const fetchProducts = useCallback(async (params?: ProductQueryParams) => {
    setIsLoadingProducts(true);
    setProductsError(null);
    try {
      const res = await productsApi.getProducts(params);
      if (res.success && res.products && res.products.length > 0) {
        setProductsList(res.products);
      } else {
        // Fallback to static products if backend returns empty/offline
        setProductsList(fallbackStaticProducts);
      }
    } catch (err: any) {
      console.warn('[Context] Failed to fetch products from API, using fallback:', err);
      setProductsError('Using offline catalog');
      setProductsList(fallbackStaticProducts);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Hydrate user session on mount
  useEffect(() => {
    async function loadUserSession() {
      try {
        const res = await authApi.getMe();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
        }
      } catch {
        // No active or valid token
      }
    }
    loadUserSession();
    fetchProducts();
  }, [fetchProducts]);

  // Persist Cart
  useEffect(() => {
    try {
      localStorage.setItem('casaaura_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Persist Wishlist
  useEffect(() => {
    try {
      localStorage.setItem('casaaura_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Sync orders from Backend API
  const refreshOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const remoteOrders = await fetchUserOrders();
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
      }
    } catch (e) {
      console.warn('[Context] refreshOrders error:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  // Refresh orders on mount and when user logs in
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders, user]);

  // Auth Handlers
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await authApi.login({ email, password: pass });
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      addToast('success', 'Welcome Back', `Signed in as ${res.data.user.name}`);
      refreshOrders();
      return { success: true };
    }
    const err = res.error || res.message || 'Login failed. Please verify credentials.';
    addToast('warning', 'Sign In Failed', err);
    return { success: false, error: err };
  };

  const register = async (name: string, email: string, pass: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    const res = await authApi.register({ name, email, password: pass, phone });
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      addToast('success', 'Account Created', `Welcome to CasaAura, ${res.data.user.name}`);
      refreshOrders();
      return { success: true };
    }
    const err = res.error || res.message || 'Registration failed. Please check your details.';
    addToast('warning', 'Registration Failed', err);
    return { success: false, error: err };
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    addToast('info', 'Signed Out', 'You have been signed out.');
  };

  // Orders Actions (API Connected)
  const createNewOrder = async (params: CreateOrderParams): Promise<Order> => {
    // If not authenticated and we have customer info, try registering or passing through
    const newOrder = await saveOrderViaService(params);
    setOrders((prev) => [newOrder, ...prev.filter(o => o.orderId !== newOrder.orderId)]);
    setLastPlacedOrder(newOrder);
    return newOrder;
  };

  const advanceOrderStatus = async (orderId: string): Promise<Order | null> => {
    const updated = await advanceStatusViaService(orderId);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.orderId === updated.orderId ? updated : o)));
      addToast(
        'info', 
        'Order Status Updated', 
        `Order ${updated.orderId} is now: ${updated.orderStatus.replace('_', ' ').toUpperCase()}`
      );
    }
    return updated;
  };

  const navigateToTrackOrder = (orderId?: string) => {
    if (orderId) {
      setSelectedTrackingOrderId(orderId);
    } else if (orders.length > 0 && !selectedTrackingOrderId) {
      setSelectedTrackingOrderId(orders[0].orderId);
    }
    setIsTrackOrderOpen(false);
    setCurrentPage('track-order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToMyOrders = () => {
    setIsTrackOrderOpen(false);
    setCurrentPage('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add to Cart
  const addToCart = (product: Product, quantity = 1, selectedColor?: string, openDrawer = true) => {
    const color = selectedColor || (product.colors && product.colors[0]?.name) || 'Default';
    
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, selectedColor: color }];
      }
    });

    addToast(
      'success',
      'Added to Bag',
      `${quantity} × "${product.name}" added to your shopping bag.`
    );

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  // Remove from Cart
  const removeFromCart = (productId: string, selectedColor?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && (selectedColor ? item.selectedColor === selectedColor : true))
      )
    );
    addToast('info', 'Item Removed', 'Product removed from your shopping bag.');
  };

  // Update Quantity
  const updateQuantity = (productId: string, quantity: number, selectedColor?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && (!selectedColor || item.selectedColor === selectedColor)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponDiscount(0);
  };

  // Wishlist toggle
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        addToast('info', 'Wishlist Updated', `"${product.name}" removed from your wishlist.`);
        return prev.filter((id) => id !== product.id);
      } else {
        addToast('success', 'Saved to Wishlist', `"${product.name}" saved to your wishlist.`);
        return [...prev, product.id];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Cart calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Coupon handling
  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === 'CASA10') {
      const discount = Math.round(cartSubtotal * 0.1);
      setCouponCode('CASA10');
      setCouponDiscount(discount);
      addToast('success', 'Coupon Applied!', '10% discount applied to your order.');
      return { success: true, message: '10% discount applied!' };
    } else if (formatted === 'AURA15' && cartSubtotal >= 2000) {
      const discount = Math.round(cartSubtotal * 0.15);
      setCouponCode('AURA15');
      setCouponDiscount(discount);
      addToast('success', 'Coupon Applied!', '15% luxury discount applied!');
      return { success: true, message: '15% discount applied!' };
    } else if (formatted === 'AURA15' && cartSubtotal < 2000) {
      return { success: false, message: 'Coupon AURA15 requires minimum order value of ₹2,000' };
    } else {
      return { success: false, message: 'Invalid promo code. Try CASA10 for 10% off.' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    addToast('info', 'Coupon Removed', 'Promotional discount removed.');
  };

  // Currency Formatter
  const formatPrice = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <CartWishlistContext.Provider
      value={{
        productsList,
        isLoadingProducts,
        productsError,
        fetchProducts,
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isAdminModalOpen,
        setIsAdminModalOpen,
        login,
        register,
        logout,
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackOrderOpen,
        setIsTrackOrderOpen,
        activeModalProduct,
        setActiveModalProduct,
        currentPage,
        setCurrentPage,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        searchQuery,
        setSearchQuery,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        couponCode,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        toasts,
        addToast,
        removeToast,
        orders,
        isLoadingOrders,
        selectedTrackingOrderId,
        setSelectedTrackingOrderId,
        activeOrderDetails,
        setActiveOrderDetails,
        createNewOrder,
        advanceOrderStatus,
        navigateToTrackOrder,
        navigateToMyOrders,
        lastPlacedOrder,
        setLastPlacedOrder,
        refreshOrders,
        formatPrice,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
};

export const useCartWishlist = () => {
  const context = useContext(CartWishlistContext);
  if (!context) {
    throw new Error('useCartWishlist must be used within a CartWishlistProvider');
  }
  return context;
};
