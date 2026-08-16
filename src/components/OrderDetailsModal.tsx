import React, { useState } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { 
  X, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  Copy, 
  Check, 
  Calendar,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';

export const OrderDetailsModal: React.FC = () => {
  const { 
    activeOrderDetails, 
    setActiveOrderDetails, 
    navigateToTrackOrder, 
    setCurrentPage, 
    formatPrice,
    addToast 
  } = useCartWishlist();

  const [copiedId, setCopiedId] = useState(false);
  const [copiedTrack, setCopiedTrack] = useState(false);

  if (!activeOrderDetails) return null;

  const order = activeOrderDetails;

  const handleCopy = (text: string, isTrack = false) => {
    navigator.clipboard?.writeText(text);
    if (isTrack) {
      setCopiedTrack(true);
      setTimeout(() => setCopiedTrack(false), 2000);
      addToast('success', 'Copied!', `Tracking number ${text} copied.`);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      addToast('success', 'Copied!', `Order ID ${text} copied.`);
    }
  };

  return (
    <div id="order-details-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setActiveOrderDetails(null)}
        className="fixed inset-0 bg-[#141414]/70 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative max-w-2xl w-full bg-[#F9F7F2] rounded-3xl shadow-2xl border border-[#E5E1D8] overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 bg-[#EFEBE1] border-b border-[#E5E1D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center">
              <Package className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7E6A] block">
                Order Receipt & Invoice
              </span>
              <h3 className="font-mono text-base sm:text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                {order.orderId}
                <button
                  type="button"
                  onClick={() => handleCopy(order.orderId)}
                  className="text-xs text-[#666666] hover:text-[#1A1A1A]"
                  title="Copy Order ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveOrderDetails(null)}
            className="p-1.5 rounded-lg text-[#555555] hover:bg-[#E5E0D5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {/* Top Status & Date Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-[#EAE6DF]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C7E6A] block">Date</span>
              <span className="font-medium text-[#1A1A1A] text-xs">{order.orderDate}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C7E6A] block">Status</span>
              <span className="font-bold capitalize text-[#1A1A1A] text-xs">
                {order.orderStatus.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C7E6A] block">Payment</span>
              <span className="font-bold text-[#2E7D32] text-xs">{order.paymentStatus}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C7E6A] block">Expected</span>
              <span className="font-medium text-[#1A1A1A] text-xs">{order.estimatedDelivery}</span>
            </div>
          </div>

          {/* Tracking Number Bar */}
          <div className="bg-[#EFEBE1] p-3.5 rounded-xl border border-[#E5E1D8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8C7E6A]" />
              <span className="text-xs text-[#555555]">Tracking Number:</span>
              <span className="font-mono font-bold text-xs text-[#1A1A1A]">{order.trackingNumber}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(order.trackingNumber, true)}
              className="text-[11px] font-semibold text-[#1A1A1A] hover:underline flex items-center gap-1"
            >
              {copiedTrack ? <Check className="w-3 h-3 text-[#2E7D32]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedTrack ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Items List */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#1A1A1A] mb-3">
              Order Items ({order.items.reduce((acc, it) => acc + it.quantity, 0)})
            </h4>
            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div 
                  key={`${item.product.id}-${idx}`}
                  className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#EAE6DF]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-12 h-12 object-cover rounded-lg border border-[#E5E1D8] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[#1A1A1A] truncate">{item.product.name}</p>
                      <p className="text-[11px] text-[#777777]">
                        {item.selectedColor ? `${item.selectedColor} • ` : ''}Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-[#1A1A1A] shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Address & Payment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#EAE6DF] space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-[#1A1A1A] mb-2 pb-1 border-b border-[#EAE6DF]">
                <MapPin className="w-3.5 h-3.5 text-[#8C7E6A]" />
                <span>Shipping Address</span>
              </div>
              <p className="font-semibold text-[#1A1A1A]">{order.shippingAddress.fullName}</p>
              <p className="text-[#666666]">{order.shippingAddress.address}</p>
              <p className="text-[#666666]">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="text-[#666666] pt-1">Ph: {order.shippingAddress.phone}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EAE6DF] space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-[#1A1A1A] mb-2 pb-1 border-b border-[#EAE6DF]">
                <CreditCard className="w-3.5 h-3.5 text-[#8C7E6A]" />
                <span>Payment Summary</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Method:</span>
                <span className="font-medium text-[#1A1A1A]">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Subtotal:</span>
                <span className="font-medium text-[#1A1A1A]">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#8C7E6A]">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#666666]">
                <span>Shipping:</span>
                <span className="font-medium text-[#1A1A1A]">{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
              </div>
              <div className="pt-2 border-t border-[#EAE6DF] flex justify-between font-bold text-sm text-[#1A1A1A]">
                <span>Total:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-[#EFEBE1] border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveOrderDetails(null);
              setCurrentPage('shop');
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] border border-[#D5CFC5] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Continue Shopping
          </button>

          <button
            type="button"
            onClick={() => {
              const targetId = order.orderId;
              setActiveOrderDetails(null);
              navigateToTrackOrder(targetId);
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Truck className="w-4 h-4 text-[#C5A880]" />
            <span>Track Order Timeline</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
