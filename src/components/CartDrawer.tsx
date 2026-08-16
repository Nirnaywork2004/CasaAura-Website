import React, { useState } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Tag,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    cartCount, 
    cartSubtotal, 
    removeFromCart, 
    updateQuantity, 
    formatPrice, 
    freeShippingThreshold,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen,
    setCurrentPage,
    setSelectedCategoryFilter
  } = useCartWishlist();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping || cart.length === 0 ? 0 : 99;
  const grandTotal = Math.max(0, cartSubtotal - couponDiscount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!inputCoupon.trim()) return;

    const result = applyCoupon(inputCoupon);
    if (!result.success) {
      setCouponError(result.message);
    } else {
      setInputCoupon('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleStartShopping = () => {
    setIsCartOpen(false);
    setSelectedCategoryFilter('all');
    setCurrentPage('shop');
  };

  if (!isCartOpen) return null;

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-[#1E1C1A]/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="w-screen max-w-md bg-[#F9F7F2] shadow-2xl flex flex-col justify-between border-l border-[#E5E1D8]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E5E1D8] bg-[#F9F7F2]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#1A1A1A]" />
                <h2 className="font-serif text-lg font-semibold text-[#1A1A1A]">
                  Shopping Bag ({cartCount})
                </h2>
              </div>

              <button
                type="button"
                id="cart-drawer-close"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-[#555555] hover:text-[#1A1A1A] hover:bg-[#EFEBE1] transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Meter */}
            <div className="mt-4 p-3 rounded-xl bg-[#EFEBE1] border border-[#E5E1D8] space-y-2">
              <div className="flex items-center justify-between text-xs">
                {isFreeShipping ? (
                  <span className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C7E6A]" />
                    You’ve unlocked free pan-India delivery!
                  </span>
                ) : (
                  <span className="text-[#555555]">
                    Add <strong className="text-[#1A1A1A]">{formatPrice(amountNeededForFreeShipping)}</strong> more for free delivery
                  </span>
                )}
                <span className="text-[11px] font-bold text-[#1A1A1A]">
                  {Math.round(freeShippingProgress)}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-[#E5E1D8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1A1A1A] transition-all duration-500 rounded-full"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Item List / Empty State */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EFEBE1] flex items-center justify-center text-[#8C7E6A]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-semibold text-[#1A1A1A]">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-[#555555] max-w-xs">
                    Explore our curated collection of ceramics, textiles, and lighting to fill your home with warmth.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartShopping}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-[#F9F7F2] rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors shadow-xs"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.selectedColor || index}`}
                    className="flex gap-4 p-3.5 rounded-2xl bg-white border border-[#E5E1D8] shadow-2xs group"
                  >
                    {/* Thumbnail */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-xl object-cover bg-[#EFEBE1] shrink-0 border border-[#E5E1D8]"
                    />

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-sm font-semibold text-[#1A1A1A] truncate">
                            {item.product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                            className="text-[#888888] hover:text-[#B34040] transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.selectedColor && (
                          <p className="text-[11px] text-[#777777] capitalize mt-0.5">
                            Color: {item.selectedColor}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2 border border-[#E5E1D8] bg-[#EFEBE1] rounded-lg px-2 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)}
                            className="text-[#555555] hover:text-[#1A1A1A]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-[#1A1A1A] min-w-[16px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)}
                            className="text-[#555555] hover:text-[#1A1A1A]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#E5E1D8] bg-[#F9F7F2] space-y-4">
              
              {/* Coupon input */}
              <div className="space-y-1.5">
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#8C7E6A] text-xs">
                    <div className="flex items-center gap-1.5 text-[#1A1A1A] font-medium">
                      <Tag className="w-3.5 h-3.5 text-[#8C7E6A]" />
                      <span>Code <strong>{couponCode}</strong> applied (-{formatPrice(couponDiscount)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-[#8C7E6A] hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      placeholder="Promo code (try CASA10)"
                      className="flex-1 px-3 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A] placeholder-[#888888] uppercase focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-600 pl-1">{couponError}</p>
                )}
              </div>

              {/* Cost Summary */}
              <div className="space-y-1.5 text-xs text-[#555555]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1A1A1A]">{formatPrice(cartSubtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#8C7E6A]">
                    <span>Promotional Discount</span>
                    <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {shippingFee === 0 ? <span className="text-[#1A1A1A] font-bold">FREE</span> : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E5E1D8] flex justify-between text-sm font-bold text-[#1A1A1A]">
                  <span>Estimated Total</span>
                  <span className="font-serif text-base">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                id="cart-checkout-btn"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-[#1A1A1A] hover:bg-black active:scale-98 text-[#F9F7F2] rounded-xl text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#C5A880]" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#777777]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8C7E6A]" />
                <span>256-bit SSL encrypted &bull; 7-Day Easy Returns</span>
              </div>

            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
