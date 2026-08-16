import React, { useState, useEffect } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { getOrderById, fetchOrderTracking } from '../services/orderService';
import { Order, OrderStatus } from '../types';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  MapPin, 
  CreditCard, 
  ArrowLeft, 
  ChevronRight,
  RotateCw,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { 
    orders, 
    selectedTrackingOrderId, 
    setSelectedTrackingOrderId, 
    setCurrentPage, 
    formatPrice,
    advanceOrderStatus,
    addToast
  } = useCartWishlist();

  const [inputQuery, setInputQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Sync with selected order ID or default to latest order
  useEffect(() => {
    async function resolveInitialOrder() {
      if (selectedTrackingOrderId) {
        const found = getOrderById(selectedTrackingOrderId);
        if (found) {
          setActiveOrder(found);
          setInputQuery(found.orderId);
          setHasSearched(true);
          return;
        } else {
          // Try fetching from API
          setIsSearchingApi(true);
          const remote = await fetchOrderTracking(selectedTrackingOrderId);
          setIsSearchingApi(false);
          if (remote) {
            setActiveOrder(remote);
            setInputQuery(remote.orderId);
            setHasSearched(true);
            return;
          }
        }
      }

      if (orders.length > 0 && !activeOrder && !hasSearched) {
        setActiveOrder(orders[0]);
        setInputQuery(orders[0].orderId);
        setHasSearched(true);
      }
    }
    resolveInitialOrder();
  }, [selectedTrackingOrderId, orders]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query) return;

    setHasSearched(true);
    const found = getOrderById(query);
    if (found) {
      setActiveOrder(found);
      setSelectedTrackingOrderId(found.orderId);
      return;
    }

    // Try fetching directly from backend tracking endpoint
    setIsSearchingApi(true);
    const remote = await fetchOrderTracking(query);
    setIsSearchingApi(false);
    if (remote) {
      setActiveOrder(remote);
      setSelectedTrackingOrderId(remote.orderId);
    } else {
      setActiveOrder(null);
    }
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedTracking(true);
    addToast('success', 'Copied to Clipboard', `Tracking number ${code} copied.`);
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedOrderId(true);
    addToast('success', 'Copied to Clipboard', `Order ID ${id} copied.`);
    setTimeout(() => setCopiedOrderId(false), 2500);
  };

  const handleSimulateNext = async () => {
    if (!activeOrder) return;
    setIsAdvancing(true);
    try {
      const updated = await advanceOrderStatus(activeOrder.orderId);
      if (updated) {
        setActiveOrder(updated);
      }
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#777777] mb-3 uppercase tracking-widest font-medium">
          <button onClick={() => setCurrentPage('home')} className="hover:text-[#1A1A1A] transition-colors">Home</button>
          <ChevronRight className="w-3 h-3 text-[#8C7E6A]" />
          <button onClick={() => setCurrentPage('orders')} className="hover:text-[#1A1A1A] transition-colors">My Orders</button>
          <ChevronRight className="w-3 h-3 text-[#8C7E6A]" />
          <span className="text-[#1A1A1A] font-semibold">Track Order</span>
        </div>

        {/* Page Title */}
        <div className="border-b border-[#E5E1D8] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] block mb-1">
              Live Shipment Tracking
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Track Your Order
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage('orders')}
            className="text-xs uppercase font-bold tracking-widest text-[#1A1A1A] hover:text-[#8C7E6A] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View All My Orders</span>
          </button>
        </div>

        {/* Search Order ID Bar */}
        <div className="bg-[#F9F7F2] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8C7E6A] mb-2">
              Enter Order ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="e.g. CASA-20260816-7F42K"
                  className="w-full pl-4 pr-10 py-3.5 bg-white border border-[#E5E1D8] rounded-2xl text-sm font-mono text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A] focus:border-[#1A1A1A] uppercase shadow-inner"
                />
                {inputQuery && (
                  <button
                    type="button"
                    onClick={() => setInputQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-[#1A1A1A]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Search className="w-4 h-4 text-[#C5A880]" />
                <span>Track Order</span>
              </button>
            </div>

            {/* Quick Suggestions / Recent Orders */}
            {orders.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#666666]">
                <span className="font-medium">Recent Orders:</span>
                {orders.slice(0, 3).map((ord) => (
                  <button
                    key={ord.orderId}
                    type="button"
                    onClick={() => {
                      setInputQuery(ord.orderId);
                      setActiveOrder(ord);
                      setSelectedTrackingOrderId(ord.orderId);
                      setHasSearched(true);
                    }}
                    className={`font-mono px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                      activeOrder?.orderId === ord.orderId
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-white hover:bg-[#EFEBE1] text-[#444444] border-[#E5E1D8]'
                    }`}
                  >
                    {ord.orderId}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Not Found State */}
        {hasSearched && !activeOrder && (
          <div className="bg-[#F9F7F2] border border-[#E5E1D8] rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#FFF3E0] border border-[#FFE0B2] text-[#E65100] flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2">
              We couldn't find an order with that ID.
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mb-6">
              Please double check the ID entered (format: CASA-YYYYMMDD-XXXXX) or select from your past orders.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage('orders')}
                className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-black"
              >
                Go to My Orders
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('shop')}
                className="px-6 py-2.5 bg-white text-[#1A1A1A] border border-[#E5E1D8] rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-[#EFEBE1]"
              >
                Browse Shop
              </button>
            </div>
          </div>
        )}

        {/* Found Order Tracking Details */}
        {activeOrder && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Header Highlights Card */}
            <div className="bg-[#F9F7F2] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5E1D8]">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#8C7E6A]">
                      Order Details
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyOrderId(activeOrder.orderId)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#666666] hover:text-[#1A1A1A] transition-colors"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? (
                        <span className="text-[#2E7D32] font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Copy ID
                        </span>
                      )}
                    </button>
                  </div>
                  <h2 className="font-mono text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                    {activeOrder.orderId}
                  </h2>
                  <p className="text-xs text-[#666666] mt-1">
                    Placed on {activeOrder.orderDate} &bull; {activeOrder.items.length} {activeOrder.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                {/* Status & Delivery Highlights */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white/80 p-4 rounded-2xl border border-[#EAE6DF]">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7E6A] block">
                      Current Status
                    </span>
                    <span className="text-sm font-bold text-[#1A1A1A] capitalize mt-0.5 block">
                      {activeOrder.orderStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-[#E5E1D8] hidden sm:block" />

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7E6A] block">
                      Expected Delivery
                    </span>
                    <span className="text-sm font-bold text-[#1A1A1A] mt-0.5 block">
                      {activeOrder.estimatedDelivery}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tracking Number Section */}
              <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#EFEBE1] border border-[#E5E1D8] flex items-center justify-center text-[#1A1A1A] shrink-0">
                    <Truck className="w-5 h-5 text-[#8C7E6A]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#666666]">
                      Air Express Carrier: <strong className="text-[#1A1A1A]">CasaAura Logistics Hub</strong>
                    </p>
                    <p className="text-sm font-mono font-bold text-[#1A1A1A] mt-0.5">
                      Tracking Number: <span className="text-[#8C7E6A]">{activeOrder.trackingNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopyTracking(activeOrder.trackingNumber)}
                    className="px-4 py-2 bg-white hover:bg-[#EFEBE1] text-[#1A1A1A] border border-[#E5E1D8] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs"
                  >
                    {copiedTracking ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <span className="text-[#2E7D32]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#666666]" />
                        <span>Copy Tracking Number</span>
                      </>
                    )}
                  </button>

                  {/* Dev / Demo Stage Advancement Simulation */}
                  <button
                    type="button"
                    onClick={handleSimulateNext}
                    className="px-3.5 py-2 bg-[#EFEBE1] hover:bg-[#E5E0D5] text-[#1A1A1A] border border-[#D5CFC5] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    title="Simulate advancing to next tracking stage for evaluation"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#8C7E6A]" />
                    <span>Simulate Next Status</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Tracking Timeline */}
            <div className="bg-[#F9F7F2] border border-[#E5E1D8] rounded-3xl p-6 sm:p-10 shadow-xs">
              <div className="flex items-center justify-between pb-6 border-b border-[#E5E1D8] mb-8">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] block">
                    Shipment Journey
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                    Order Tracking Timeline
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-[#666666]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />
                  <span>Current Stage</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] ml-2" />
                  <span>Completed</span>
                </div>
              </div>

              {/* Timeline Steps Container */}
              <div className="relative pl-6 sm:pl-8 border-l-2 border-[#E5E1D8] space-y-8 my-4 ml-3 sm:ml-4">
                {activeOrder.timeline.map((step, idx) => {
                  return (
                    <div key={step.status} className="relative group">
                      {/* Timeline Node Icon */}
                      <div className={`absolute -left-[35px] sm:-left-[43px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.isCompleted && !step.isCurrent
                          ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                          : step.isCurrent
                          ? 'bg-[#C5A880] border-[#1A1A1A] text-[#1A1A1A] shadow-md ring-4 ring-[#EFEBE1] scale-110'
                          : 'bg-[#F9F7F2] border-[#D5CFC5] text-[#888888]'
                      }`}>
                        {step.isCompleted && !step.isCurrent ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : step.isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] animate-ping" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#C5BFB5]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        step.isCurrent
                          ? 'bg-white border-[#1A1A1A] shadow-xs'
                          : step.isCompleted
                          ? 'bg-white/60 border-[#EAE6DF]'
                          : 'bg-[#F4EFEA]/40 border-dashed border-[#DCD6CA] opacity-70'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-base font-semibold ${step.isCurrent ? 'text-[#1A1A1A] font-bold' : step.isCompleted ? 'text-[#1A1A1A]' : 'text-[#777777]'}`}>
                              {step.label}
                            </h4>
                            {step.isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest">
                                In Progress
                              </span>
                            )}
                            {step.isCompleted && !step.isCurrent && (
                              <span className="text-[11px] text-[#2E7D32] font-semibold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Completed
                              </span>
                            )}
                          </div>
                          <span className={`text-xs font-mono font-medium ${step.isCompleted ? 'text-[#8C7E6A]' : 'text-[#888888]'}`}>
                            {step.timestamp}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid for Shipping Info, Payment, & Order Items */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Order Items (Left 7 Cols) */}
              <div className="lg:col-span-7 bg-[#F9F7F2] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8]">
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                    Purchased Items ({activeOrder.items.reduce((acc, it) => acc + it.quantity, 0)})
                  </h3>
                  <span className="text-xs text-[#8C7E6A] font-semibold uppercase tracking-wider">
                    Bespoke Craft
                  </span>
                </div>

                <div className="space-y-3">
                  {activeOrder.items.map((item, idx) => (
                    <div 
                      key={`${item.product.id}-${idx}`}
                      className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#EAE6DF]"
                    >
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-[#E5E1D8] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-semibold text-sm sm:text-base text-[#1A1A1A]">
                          {item.product.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#666666]">
                          {item.selectedColor && (
                            <span className="bg-[#EFEBE1] px-2 py-0.5 rounded text-[11px] font-medium text-[#444444]">
                              {item.selectedColor}
                            </span>
                          )}
                          <span>Qty: <strong className="text-[#1A1A1A]">{item.quantity}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm sm:text-base text-[#1A1A1A] block">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <span className="text-[11px] text-[#777777]">
                          {formatPrice(item.price)} each
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="pt-4 border-t border-[#E5E1D8] space-y-2 text-xs text-[#555555]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium text-[#1A1A1A]">{formatPrice(activeOrder.subtotal)}</span>
                  </div>
                  {activeOrder.discount > 0 && (
                    <div className="flex justify-between text-[#8C7E6A] font-medium">
                      <span>Promotional Discount:</span>
                      <span>-{formatPrice(activeOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping & Handling:</span>
                    <span className="font-medium text-[#1A1A1A]">{activeOrder.shipping === 0 ? 'FREE' : formatPrice(activeOrder.shipping)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E5E1D8] flex justify-between font-bold text-sm sm:text-base text-[#1A1A1A]">
                    <span>Total Paid:</span>
                    <span className="font-serif text-lg">{formatPrice(activeOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Payment Info (Right 5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Delivery Address */}
                <div className="bg-[#F9F7F2] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#E5E1D8]">
                    <MapPin className="w-4 h-4 text-[#8C7E6A]" />
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      Delivery Address
                    </h3>
                  </div>

                  <div className="text-xs sm:text-sm text-[#555555] space-y-1 leading-relaxed bg-white/80 p-4 rounded-2xl border border-[#EAE6DF]">
                    <p className="font-bold text-sm text-[#1A1A1A]">
                      {activeOrder.shippingAddress.fullName}
                    </p>
                    <p>{activeOrder.shippingAddress.address}</p>
                    <p>{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} &bull; {activeOrder.shippingAddress.pincode}</p>
                    <p>India</p>
                    <div className="pt-2 mt-2 border-t border-[#EAE6DF] text-xs text-[#777777] space-y-0.5">
                      <p>Phone: <strong className="text-[#1A1A1A]">{activeOrder.shippingAddress.phone}</strong></p>
                      <p>Email: <strong className="text-[#1A1A1A]">{activeOrder.shippingAddress.email}</strong></p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-[#F9F7F2] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#E5E1D8]">
                    <CreditCard className="w-4 h-4 text-[#8C7E6A]" />
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      Payment Information
                    </h3>
                  </div>

                  <div className="text-xs text-[#555555] space-y-3 bg-white/80 p-4 rounded-2xl border border-[#EAE6DF]">
                    <div className="flex justify-between items-center">
                      <span>Method:</span>
                      <span className="font-semibold text-[#1A1A1A]">{activeOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        activeOrder.paymentStatus === 'Paid'
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : 'bg-[#FFF3E0] text-[#E65100]'
                      }`}>
                        {activeOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-[11px] font-semibold text-[#1A1A1A]">{activeOrder.transactionId}</span>
                    </div>
                  </div>
                </div>

                {/* Help Note */}
                <div className="p-4 rounded-2xl bg-[#EFEBE1] border border-[#E5E1D8] text-xs text-[#666666] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#8C7E6A] shrink-0 mt-0.5" />
                  <p>
                    Need assistance with your delivery? Contact our 24/7 Concierge Support at <strong className="text-[#1A1A1A]">concierge@casaaura.in</strong>.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
