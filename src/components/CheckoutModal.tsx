import React, { useState } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { Order } from '../types';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  ArrowRight, 
  Lock, 
  QrCode,
  PackageCheck,
  Smartphone,
  Check,
  Copy,
  Info,
  Calendar,
  ShoppingBag,
  Package
} from 'lucide-react';
import { motion } from 'motion/react';

type PaymentMethodType = 'upi' | 'card_visa_mc' | 'rupay' | 'cod';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartSubtotal, 
    couponDiscount, 
    formatPrice, 
    freeShippingThreshold,
    clearCart,
    addToast,
    createNewOrder,
    navigateToTrackOrder,
    navigateToMyOrders,
    setCurrentPage,
    user
  } = useCartWishlist();

  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // UPI Specific State
  const [upiOption, setUpiOption] = useState<'app' | 'id' | 'qr'>('app');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card Form State (for Visa/MasterCard and RuPay demo)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Shipping Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.addresses?.[0]?.address || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [state, setState] = useState(user?.addresses?.[0]?.state || 'Karnataka');
  const [pincode, setPincode] = useState(user?.addresses?.[0]?.pincode || '');
  const [formError, setFormError] = useState('');

  // Sync user info if user logs in
  React.useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name);
      if (!email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses[0];
        if (!address) setAddress(defaultAddr.address);
        if (!city) setCity(defaultAddr.city);
        if (defaultAddr.state) setState(defaultAddr.state);
        if (!pincode) setPincode(defaultAddr.pincode);
      }
    }
  }, [user]);

  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping || cart.length === 0 ? 0 : 99;
  const grandTotal = Math.max(0, cartSubtotal - couponDiscount + shippingFee);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      setFormError('Please fill in all required delivery fields.');
      return;
    }
    setFormError('');
    setPaymentMethod('upi'); // Reset to default UPI when moving to payment step
    setStep('payment');
  };

  const handleVerifyUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim() || !upiId.includes('@')) {
      addToast('warning', 'Invalid UPI ID', 'Please enter a valid UPI address (e.g., name@okaxis or 9876543210@paytm)');
      return;
    }
    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setIsUpiVerified(true);
      addToast('success', 'UPI ID Verified', `Verified account linked to ${upiId}`);
    }, 600);
  };

  const handleCopyCasaAuraUpi = () => {
    navigator.clipboard.writeText('casaaura@hdfcbank');
    setCopiedUpi(true);
    addToast('info', 'UPI ID Copied', 'casaaura@hdfcbank copied to clipboard');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedOrderId(true);
    addToast('info', 'Copied', `Order ID ${id} copied to clipboard`);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      addToast('warning', 'Cart is Empty', 'Please add items before completing checkout.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      let methodText = 'UPI / GPay / PhonePe';
      if (paymentMethod === 'card_visa_mc') methodText = 'Visa & Mastercard';
      if (paymentMethod === 'rupay') methodText = 'RuPay';
      if (paymentMethod === 'cod') methodText = 'Cash on Delivery';

      const isCod = paymentMethod === 'cod';

      const orderItems = cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        price: item.product.price,
      }));

      const newOrder = await createNewOrder({
        customer: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
        shippingAddress: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim() || 'Bengaluru',
          state: state.trim() || 'Karnataka',
          pincode: pincode.trim(),
        },
        items: orderItems,
        subtotal: cartSubtotal,
        shipping: shippingFee,
        discount: couponDiscount,
        total: grandTotal,
        paymentMethod: methodText,
        paymentStatus: isCod ? 'Pending' : 'Paid',
      });

      setCreatedOrder(newOrder);
      setStep('success');
      clearCart();

      addToast('success', 'Order Confirmed!', `Order ${newOrder.orderId} successfully placed.`);
    } catch (err: any) {
      console.error('Failed to create order:', err);
      addToast('warning', 'Order Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep('shipping');
    setCreatedOrder(null);
  };

  const handleTrackCreatedOrder = () => {
    if (!createdOrder) return;
    const targetId = createdOrder.orderId;
    handleClose();
    navigateToTrackOrder(targetId);
  };

  const handleGoToMyOrders = () => {
    handleClose();
    navigateToMyOrders();
  };

  const handleContinueShopping = () => {
    handleClose();
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isCheckoutOpen) return null;

  return (
    <div id="checkout-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-[#1E1C1A]/70 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative max-w-2xl w-full bg-[#F9F7F2] rounded-3xl shadow-2xl border border-[#E5E1D8] overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5E1D8] flex items-center justify-between bg-[#F9F7F2]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#8C7E6A]" />
            <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A]">
              {step === 'shipping' && 'Shipping & Delivery Address'}
              {step === 'payment' && 'Secure Payment Selection'}
              {step === 'success' && 'Order Successfully Placed!'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#555555] hover:text-[#1A1A1A] hover:bg-[#EFEBE1] transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          
          {/* STEP 1: SHIPPING FORM */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A] focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A] focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">Email for Order Invoice *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. priya@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A] focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">Street Address / Apartment *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 402, Lotus Orchid, Indiranagar"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A] focus:border-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A] focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A] focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560038"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A] focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-600 pl-1">{formError}</p>
              )}

              {/* Order total review */}
              <div className="p-4 rounded-2xl bg-[#EFEBE1] border border-[#E5E1D8] flex items-center justify-between text-xs">
                <div>
                  <p className="text-[#666666]">{cart.length} unique items in order</p>
                  <p className="font-bold text-sm text-[#1A1A1A] mt-0.5">Grand Total: {formatPrice(grandTotal)}</p>
                </div>
                <span className="text-[#8C7E6A] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#8C7E6A]" />
                  Free Delivery Unlocked
                </span>
              </div>

              <button
                type="submit"
                id="continue-to-payment-btn"
                className="w-full py-3.5 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4 text-[#C5A880]" />
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD SELECTION */}
          {step === 'payment' && (
            <div className="space-y-6">
              
              {/* Payment Method Selector List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">
                    Choose Payment Method
                  </p>
                  <span className="text-[11px] text-[#666666]">
                    100% Encrypted & Safe
                  </span>
                </div>

                <div className="space-y-2.5">
                  
                  {/* Option 1: UPI / GPay / PhonePe (Default Selected) */}
                  <div
                    id="payment-method-upi"
                    onClick={() => setPaymentMethod('upi')}
                    className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                      paymentMethod === 'upi'
                        ? 'border-[#1A1A1A] bg-[#EFEBE1] shadow-xs ring-1 ring-[#1A1A1A]'
                        : 'border-[#E5E1D8] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="p-4 flex items-center gap-3.5">
                      {/* Radio Indicator */}
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        paymentMethod === 'upi'
                          ? 'border-[#1A1A1A] bg-[#1A1A1A]'
                          : 'border-[#CCCCCC] bg-white'
                      }`}>
                        {paymentMethod === 'upi' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E1D8] flex items-center justify-center shrink-0 text-[#1A1A1A]">
                        <Smartphone className="w-5 h-5 text-[#8C7E6A]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                            UPI / GPay / PhonePe
                          </p>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2]">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-[#666666] mt-0.5">
                          Google Pay, PhonePe, Paytm, BHIM & Instant UPI ID
                        </p>
                      </div>

                      {/* Fast badge */}
                      <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-[#8C7E6A] shrink-0">
                        <span>Instant Refundable</span>
                      </div>
                    </div>

                    {/* Expandable UPI Payment Sub-Interface when UPI is selected */}
                    {paymentMethod === 'upi' && (
                      <div className="px-4 pb-4 pt-1 border-t border-[#E0D9CB]/80 space-y-4">
                        
                        {/* UPI Modes Tab (Apps / UPI ID / Scan QR) */}
                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/80 rounded-xl border border-[#E5E1D8]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUpiOption('app');
                            }}
                            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                              upiOption === 'app'
                                ? 'bg-[#1A1A1A] text-white shadow-xs'
                                : 'text-[#555555] hover:text-[#1A1A1A]'
                            }`}
                          >
                            UPI Apps
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUpiOption('id');
                            }}
                            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                              upiOption === 'id'
                                ? 'bg-[#1A1A1A] text-white shadow-xs'
                                : 'text-[#555555] hover:text-[#1A1A1A]'
                            }`}
                          >
                            UPI ID / VPA
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUpiOption('qr');
                            }}
                            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                              upiOption === 'qr'
                                ? 'bg-[#1A1A1A] text-white shadow-xs'
                                : 'text-[#555555] hover:text-[#1A1A1A]'
                            }`}
                          >
                            Scan QR
                          </button>
                        </div>

                        {/* MODE 1: Popular UPI Apps */}
                        {upiOption === 'app' && (
                          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                            <p className="text-[11px] text-[#666666]">
                              Select your preferred app to initiate seamless checkout:
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {[
                                { id: 'gpay', name: 'Google Pay', short: 'GPay', iconColor: 'text-[#4285F4]' },
                                { id: 'phonepe', name: 'PhonePe', short: 'PhonePe', iconColor: 'text-[#5F259F]' },
                                { id: 'paytm', name: 'Paytm UPI', short: 'Paytm', iconColor: 'text-[#00B9F1]' },
                                { id: 'bhim', name: 'BHIM UPI', short: 'BHIM', iconColor: 'text-[#00529C]' },
                              ].map((app) => (
                                <button
                                  key={app.id}
                                  type="button"
                                  onClick={() => setSelectedUpiApp(app.id as any)}
                                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                                    selectedUpiApp === app.id
                                      ? 'border-[#1A1A1A] bg-white shadow-xs ring-1 ring-[#1A1A1A]'
                                      : 'border-[#E5E1D8] bg-white/60 hover:bg-white text-[#555555]'
                                  }`}
                                >
                                  <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E5E1D8] flex items-center justify-center font-bold text-xs">
                                    <span className={app.iconColor}>₹</span>
                                  </div>
                                  <span className="text-xs font-semibold text-[#1A1A1A]">
                                    {app.short}
                                  </span>
                                </button>
                              ))}
                            </div>
                            <p className="text-[11px] text-[#777777] flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-[#8C7E6A]" />
                              <span>Clicking confirm will simulate payment authorization on <strong>{selectedUpiApp === 'gpay' ? 'Google Pay' : selectedUpiApp === 'phonepe' ? 'PhonePe' : selectedUpiApp === 'paytm' ? 'Paytm' : 'BHIM'}</strong>.</span>
                            </p>
                          </div>
                        )}

                        {/* MODE 2: Custom UPI ID Input */}
                        {upiOption === 'id' && (
                          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">
                                Enter your UPI ID / Virtual Payment Address
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={upiId}
                                  onChange={(e) => {
                                    setUpiId(e.target.value);
                                    setIsUpiVerified(false);
                                  }}
                                  placeholder="e.g. yourname@oksbi or mobile@ybl"
                                  className="flex-1 px-3.5 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyUpi}
                                  disabled={isVerifyingUpi || !upiId.trim()}
                                  className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition-all shrink-0"
                                >
                                  {isVerifyingUpi ? 'Verifying...' : isUpiVerified ? 'Verified ✓' : 'Verify'}
                                </button>
                              </div>
                            </div>
                            {isUpiVerified && (
                              <div className="flex items-center gap-1.5 text-xs text-[#2E6830] font-semibold bg-[#E2EBE0] px-3 py-1.5 rounded-xl border border-[#C5DAC0]">
                                <Check className="w-4 h-4" />
                                <span>Verified: Account linked to {upiId}</span>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="text-[10px] text-[#777777] self-center mr-1">Popular handles:</span>
                              {['@okaxis', '@okhdfcbank', '@ybl', '@paytm'].map((handle) => (
                                <button
                                  key={handle}
                                  type="button"
                                  onClick={() => {
                                    const base = upiId.split('@')[0] || 'user';
                                    setUpiId(`${base}${handle}`);
                                  }}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#E5E1D8] text-[#555555] hover:border-[#1A1A1A]"
                                >
                                  {handle}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* MODE 3: Dynamic QR Code Scanner */}
                        {upiOption === 'qr' && (
                          <div className="space-y-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-block p-3 bg-white rounded-2xl border border-[#E5E1D8] shadow-xs">
                              {/* Stylized QR Code Visual */}
                              <div className="w-36 h-36 mx-auto bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl flex flex-col items-center justify-center p-2 relative overflow-hidden">
                                <QrCode className="w-24 h-24 text-[#1A1A1A]" />
                                <div className="absolute inset-x-0 bottom-0 bg-[#1A1A1A] text-[#F9F7F2] py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
                                  {formatPrice(grandTotal)}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-[#1A1A1A]">
                                Scan using any UPI App on your phone
                              </p>
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-[11px] font-mono text-[#666666] bg-white px-2 py-0.5 rounded border border-[#E5E1D8]">
                                  casaaura@hdfcbank
                                </span>
                                <button
                                  type="button"
                                  onClick={handleCopyCasaAuraUpi}
                                  className="text-[11px] font-semibold text-[#8C7E6A] hover:text-[#1A1A1A] flex items-center gap-0.5"
                                >
                                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>

                  {/* Option 2: Visa & Mastercard */}
                  <div
                    id="payment-method-card-visa-mc"
                    onClick={() => setPaymentMethod('card_visa_mc')}
                    className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                      paymentMethod === 'card_visa_mc'
                        ? 'border-[#1A1A1A] bg-[#EFEBE1] shadow-xs ring-1 ring-[#1A1A1A]'
                        : 'border-[#E5E1D8] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="p-4 flex items-center gap-3.5">
                      {/* Radio Indicator */}
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        paymentMethod === 'card_visa_mc'
                          ? 'border-[#1A1A1A] bg-[#1A1A1A]'
                          : 'border-[#CCCCCC] bg-white'
                      }`}>
                        {paymentMethod === 'card_visa_mc' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E1D8] flex items-center justify-center shrink-0 text-[#1A1A1A]">
                        <CreditCard className="w-5 h-5 text-[#8C7E6A]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                            Visa & Mastercard
                          </p>
                          <span className="text-[10px] font-semibold text-[#666666] bg-white px-1.5 py-0.5 rounded border border-[#E5E1D8]">
                            Credit / Debit
                          </span>
                        </div>
                        <p className="text-[11px] text-[#666666] mt-0.5">
                          All international and domestic Visa & Mastercard networks
                        </p>
                      </div>
                    </div>

                    {/* Expanded Card Details Demo */}
                    {paymentMethod === 'card_visa_mc' && (
                      <div className="px-4 pb-4 pt-1 border-t border-[#E0D9CB]/80 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4111 2222 3333 4444"
                            className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">
                              Expiry (MM/YY)
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="08/28"
                              className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">
                              CVV / CVC
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="123"
                              className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="e.g. Priya Sharma"
                            className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 3: RuPay */}
                  <div
                    id="payment-method-rupay"
                    onClick={() => setPaymentMethod('rupay')}
                    className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                      paymentMethod === 'rupay'
                        ? 'border-[#1A1A1A] bg-[#EFEBE1] shadow-xs ring-1 ring-[#1A1A1A]'
                        : 'border-[#E5E1D8] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="p-4 flex items-center gap-3.5">
                      {/* Radio Indicator */}
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        paymentMethod === 'rupay'
                          ? 'border-[#1A1A1A] bg-[#1A1A1A]'
                          : 'border-[#CCCCCC] bg-white'
                      }`}>
                        {paymentMethod === 'rupay' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E1D8] flex items-center justify-center shrink-0 text-[#1A1A1A]">
                        <CreditCard className="w-5 h-5 text-[#8C7E6A]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                            RuPay
                          </p>
                          <span className="text-[10px] font-semibold text-[#2E6830] bg-[#E2EBE0] px-1.5 py-0.5 rounded border border-[#C5DAC0]">
                            Domestic Card
                          </span>
                        </div>
                        <p className="text-[11px] text-[#666666] mt-0.5">
                          Indian RuPay Debit & Credit Cards from all partner banks
                        </p>
                      </div>
                    </div>

                    {/* Expanded RuPay Details Demo */}
                    {paymentMethod === 'rupay' && (
                      <div className="px-4 pb-4 pt-1 border-t border-[#E0D9CB]/80 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">
                            RuPay Card Number
                          </label>
                          <input
                            type="text"
                            maxLength={19}
                            placeholder="6071 8888 9999 1234"
                            className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">
                              Valid Thru
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="12/27"
                              className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7E6A] mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              maxLength={3}
                              placeholder="456"
                              className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 4: Cash on Delivery (COD) */}
                  <div
                    id="payment-method-cod"
                    onClick={() => setPaymentMethod('cod')}
                    className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                      paymentMethod === 'cod'
                        ? 'border-[#1A1A1A] bg-[#EFEBE1] shadow-xs ring-1 ring-[#1A1A1A]'
                        : 'border-[#E5E1D8] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="p-4 flex items-center gap-3.5">
                      {/* Radio Indicator */}
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        paymentMethod === 'cod'
                          ? 'border-[#1A1A1A] bg-[#1A1A1A]'
                          : 'border-[#CCCCCC] bg-white'
                      }`}>
                        {paymentMethod === 'cod' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E1D8] flex items-center justify-center shrink-0 text-[#1A1A1A]">
                        <Truck className="w-5 h-5 text-[#8C7E6A]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                          Cash on Delivery (COD)
                        </p>
                        <p className="text-[11px] text-[#666666] mt-0.5">
                          Pay cash or via delivery agent UPI QR upon doorstep arrival
                        </p>
                      </div>
                    </div>

                    {paymentMethod === 'cod' && (
                      <div className="px-4 pb-4 pt-1 border-t border-[#E0D9CB]/80">
                        <p className="text-xs text-[#555555] bg-white p-3 rounded-xl border border-[#E5E1D8] leading-relaxed">
                          Please keep exact change or have your UPI app ready during courier delivery for a swift, contactless verification.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Delivery destination summary */}
              <div className="p-4 rounded-2xl bg-[#EFEBE1] border border-[#E5E1D8] text-xs text-[#555555] space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#1A1A1A]">Delivering to:</p>
                  <button 
                    type="button" 
                    onClick={() => setStep('shipping')}
                    className="text-[11px] font-bold text-[#8C7E6A] underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="font-medium text-[#1A1A1A]">{fullName} &bull; {phone}</p>
                <p>{address}, {city}, {state} - {pincode}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="px-5 py-3.5 rounded-xl border border-[#E5E1D8] text-xs font-semibold text-[#1A1A1A] hover:bg-[#EFEBE1] bg-white uppercase tracking-wider transition-colors order-2 sm:order-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="confirm-place-order-btn"
                  disabled={isPlacingOrder}
                  onClick={handlePlaceOrder}
                  className="flex-1 py-3.5 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 order-1 sm:order-2 disabled:opacity-60"
                >
                  {isPlacingOrder ? (
                    <span>Placing Order in Live DB...</span>
                  ) : (
                    <>
                      <span>
                        {paymentMethod === 'upi' 
                          ? `Pay ${formatPrice(grandTotal)} with UPI` 
                          : paymentMethod === 'card_visa_mc' 
                          ? `Pay ${formatPrice(grandTotal)} via Card` 
                          : paymentMethod === 'rupay' 
                          ? `Pay ${formatPrice(grandTotal)} with RuPay` 
                          : `Confirm COD (${formatPrice(grandTotal)})`}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-[#C5A880]" />
                    </>
                  )}
                </button>
              </div>

              {/* Trust assurances */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-[#777777] pt-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#8C7E6A]" /> 256-Bit SSL Encrypted
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8C7E6A]" /> Guaranteed Artisan Quality
                </span>
              </div>

            </div>
          )}

          {/* STEP 3: ORDER CONFIRMATION SCREEN */}
          {step === 'success' && createdOrder && (
            <div className="py-4 space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1 pt-1">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                    Order Confirmed ✓
                  </h3>
                  <p className="text-xs sm:text-sm text-[#666666]">
                    Thank you for shopping with CasaAura.
                  </p>
                </div>
              </div>

              {/* Order Key Information Grid */}
              <div className="p-5 rounded-3xl bg-[#EFEBE1] border border-[#E5E1D8] text-xs text-[#555555] max-w-lg mx-auto space-y-3 shadow-xs">
                
                {/* Order ID & Copy */}
                <div className="flex items-center justify-between border-b border-[#E0D9CB] pb-2.5">
                  <span className="font-semibold text-[#666666]">Order ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#1A1A1A]">{createdOrder.orderId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyOrderId(createdOrder.orderId)}
                      className="p-1 text-[#8C7E6A] hover:text-[#1A1A1A] rounded"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Order Date */}
                <div className="flex items-center justify-between border-b border-[#E0D9CB] pb-2.5">
                  <span className="font-semibold text-[#666666]">Order Date:</span>
                  <span className="font-medium text-[#1A1A1A]">{createdOrder.orderDate}</span>
                </div>

                {/* Number of items */}
                <div className="flex items-center justify-between border-b border-[#E0D9CB] pb-2.5">
                  <span className="font-semibold text-[#666666]">Number of Items:</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {createdOrder.items.reduce((acc, it) => acc + it.quantity, 0)} items ({createdOrder.items.length} unique)
                  </span>
                </div>

                {/* Payment Method */}
                <div className="flex items-center justify-between border-b border-[#E0D9CB] pb-2.5">
                  <span className="font-semibold text-[#666666]">Payment Method:</span>
                  <span className="font-semibold text-[#1A1A1A]">{createdOrder.paymentMethod}</span>
                </div>

                {/* Payment Status */}
                <div className="flex items-center justify-between border-b border-[#E0D9CB] pb-2.5">
                  <span className="font-semibold text-[#666666]">Payment Status:</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    createdOrder.paymentStatus === 'Paid' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'
                  }`}>
                    {createdOrder.paymentStatus}
                  </span>
                </div>

                {/* Estimated Delivery */}
                <div className="flex items-center justify-between border-b border-[#E0D9CB] pb-2.5">
                  <span className="font-semibold text-[#666666]">Estimated Delivery:</span>
                  <span className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8C7E6A]" />
                    {createdOrder.estimatedDelivery}
                  </span>
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between pt-1 font-bold text-sm text-[#1A1A1A]">
                  <span>Total Amount:</span>
                  <span className="font-serif text-base text-[#1A1A1A]">{formatPrice(createdOrder.total)}</span>
                </div>

              </div>

              {/* Action Buttons: Track Order, Continue Shopping, View My Orders */}
              <div className="max-w-lg mx-auto space-y-2.5 pt-2">
                <button
                  type="button"
                  id="order-confirmation-track-btn"
                  onClick={handleTrackCreatedOrder}
                  className="w-full py-3.5 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                >
                  <Truck className="w-4 h-4 text-[#C5A880]" />
                  <span>Track Order</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    id="order-confirmation-view-orders-btn"
                    onClick={handleGoToMyOrders}
                    className="py-3 px-4 bg-white hover:bg-[#EFEBE1] text-[#1A1A1A] border border-[#E5E1D8] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5 text-[#8C7E6A]" />
                    <span>View My Orders</span>
                  </button>

                  <button
                    type="button"
                    id="order-confirmation-continue-shopping-btn"
                    onClick={handleContinueShopping}
                    className="py-3 px-4 bg-white hover:bg-[#EFEBE1] text-[#1A1A1A] border border-[#E5E1D8] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#8C7E6A]" />
                    <span>Continue Shopping</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
