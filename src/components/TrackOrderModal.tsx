import React, { useState } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { X, Package, Truck, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const TrackOrderModal: React.FC = () => {
  const { isTrackOrderOpen, setIsTrackOrderOpen, navigateToTrackOrder, getOrderByTrackingOrId, orders } = useCartWishlist();
  const [orderQuery, setOrderQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderQuery.trim();
    if (!query) {
      setErrorMessage('Please enter an Order ID or Tracking Number');
      return;
    }

    const matched = getOrderByTrackingOrId(query);
    if (!matched && !orders.some(o => o.orderId.toLowerCase().includes(query.toLowerCase()))) {
      // Still navigate to track-order page to let them view or enter again
      setIsTrackOrderOpen(false);
      navigateToTrackOrder(query);
      return;
    }

    setIsTrackOrderOpen(false);
    navigateToTrackOrder(matched ? matched.orderId : query);
  };

  if (!isTrackOrderOpen) return null;

  return (
    <div id="track-order-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsTrackOrderOpen(false)}
        className="fixed inset-0 bg-[#1E1C1A]/70 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative max-w-lg w-full bg-[#F9F7F2] rounded-3xl shadow-2xl border border-[#E5E1D8] overflow-hidden z-10 my-auto p-6 sm:p-8"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center">
              <Truck className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">Track Your Shipment</h3>
              <p className="text-[11px] text-[#666666]">Real-time courier updates and order status timeline</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsTrackOrderOpen(false);
              setErrorMessage('');
            }}
            className="p-1.5 rounded-lg text-[#555555] hover:bg-[#EFEBE1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTrack} className="pt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1.5">
              Enter Order ID or Tracking Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => {
                  setOrderQuery(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="e.g. CASA-20260816-7F42K or TRK-948271"
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A] focus:border-[#1A1A1A]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Search className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Track</span>
              </button>
            </div>
            {errorMessage && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          {/* Quick recent orders helper if orders exist */}
          {orders.length > 0 && (
            <div className="pt-2 border-t border-[#E5E1D8]">
              <span className="text-[10px] uppercase font-bold text-[#8C7E6A] tracking-wider block mb-2">
                Recent Orders in Your Account:
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {orders.slice(0, 3).map((ord) => (
                  <button
                    key={ord.orderId}
                    type="button"
                    onClick={() => {
                      setIsTrackOrderOpen(false);
                      navigateToTrackOrder(ord.orderId);
                    }}
                    className="w-full text-left p-2.5 bg-white hover:bg-[#EFEBE1] rounded-xl border border-[#E5E1D8] transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-[#1A1A1A] block">{ord.orderId}</span>
                      <span className="text-[10px] text-[#777777]">
                        {ord.items.length} items &bull; {ord.orderStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C7E6A] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};
