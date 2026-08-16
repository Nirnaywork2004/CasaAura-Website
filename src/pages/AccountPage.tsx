import React, { useState, useEffect } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { ProtectedView } from '../components/ProtectedView';
import { usersApi, AddressPayload } from '../services/api';
import { STAGE_LABELS } from '../services/orderService';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  LogOut, 
  Edit3, 
  Plus, 
  Trash2, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  ShoppingBag,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const AccountPage: React.FC = () => {
  const { 
    user, 
    logout, 
    orders, 
    formatPrice, 
    setCurrentPage, 
    setSelectedTrackingOrderId, 
    setActiveOrderDetails,
    addToCart,
    wishlist,
    removeFromWishlist,
    productsList,
    addToast
  } = useCartWishlist();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>('profile');

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState<any[]>(user?.addresses || []);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // New/Edit Address Form
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Karnataka');
  const [addrPostalCode, setAddrPostalCode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Sync user values
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      if (user.addresses) {
        setAddresses(user.addresses);
      }
    }
  }, [user]);

  // Load addresses from API
  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const res = await usersApi.getAddresses();
      if (res.success && Array.isArray(res.data)) {
        setAddresses(res.data);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'addresses') {
      loadAddresses();
    }
  }, [activeTab]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      addToast('warning', 'Validation Error', 'Name cannot be blank.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await usersApi.updateProfile({
        name: profileName.trim(),
        phone: profilePhone.trim(),
      });
      if (res.success) {
        addToast('success', 'Profile Updated', 'Your profile details have been updated in MongoDB.');
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      } else {
        addToast('warning', 'Update Failed', res.error || 'Could not update profile.');
      }
    } catch (err: any) {
      addToast('warning', 'Update Failed', err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Address Save
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim() || !addrCity.trim() || !addrPostalCode.trim()) {
      addToast('warning', 'Missing Fields', 'Please complete Street, City, and Postal Code.');
      return;
    }

    setIsSavingAddress(true);
    const payload: AddressPayload = {
      label: addrLabel.trim(),
      street: addrStreet.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      postalCode: addrPostalCode.trim(),
      country: 'India',
      isDefault: addrIsDefault,
    };

    try {
      if (editingAddressId) {
        const res = await usersApi.updateAddress(editingAddressId, payload);
        if (res.success) {
          addToast('success', 'Address Updated', 'Your address has been saved.');
          await loadAddresses();
          resetAddressForm();
        }
      } else {
        const res = await usersApi.addAddress(payload);
        if (res.success) {
          addToast('success', 'Address Added', 'New delivery address stored in MongoDB.');
          await loadAddresses();
          resetAddressForm();
        }
      }
    } catch (err: any) {
      addToast('warning', 'Address Error', err.message);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    try {
      const res = await usersApi.deleteAddress(addrId);
      if (res.success) {
        setAddresses((prev) => prev.filter((a) => (a._id || a.id) !== addrId));
        addToast('info', 'Address Removed', 'The address was deleted.');
      }
    } catch (err: any) {
      addToast('warning', 'Error', err.message);
    }
  };

  const handleEditAddressClick = (addr: any) => {
    setEditingAddressId(addr._id || addr.id);
    setAddrLabel(addr.label || 'Home');
    setAddrStreet(addr.street || addr.addressLine1 || '');
    setAddrCity(addr.city || '');
    setAddrState(addr.state || 'Karnataka');
    setAddrPostalCode(addr.postalCode || addr.pincode || '');
    setAddrIsDefault(Boolean(addr.isDefault));
    setShowAddAddressModal(true);
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddrLabel('Home');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('Karnataka');
    setAddrPostalCode('');
    setAddrIsDefault(false);
    setShowAddAddressModal(false);
  };

  // Wishlist products
  const wishlistProducts = productsList.filter((p) => wishlist.includes(p.id));

  return (
    <ProtectedView title="Please log in to continue" subtitle="Sign in to your CasaAura account to manage your profile, saved addresses, and track personal orders.">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E5E1D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-serif font-bold text-2xl shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A] tracking-tight">
                  My Account
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#EFEBE1] text-[#8C7E6A] border border-[#E5E1D8]">
                  {user?.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
                Hello, <strong className="text-[#1A1A1A] font-semibold">{user?.name || 'Valued Patron'}</strong> ({user?.email})
              </p>
            </div>
          </div>

          <button
            type="button"
            id="account-logout-btn"
            onClick={() => {
              logout();
              setCurrentPage('home');
            }}
            className="self-start sm:self-center py-2 px-4 rounded-xl bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-[#E5E1D8] hover:border-red-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-2xs"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="space-y-1 bg-white p-3 rounded-2xl border border-[#E5E1D8] shadow-2xs self-start">
            <button
              type="button"
              id="tab-btn-profile"
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#555555] hover:bg-[#F9F7F2]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </div>
              <span className="text-[10px] opacity-70">&bull;</span>
            </button>

            <button
              type="button"
              id="tab-btn-orders"
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#555555] hover:bg-[#F9F7F2]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </div>
              <span className="text-[10px] bg-[#EFEBE1] text-[#1A1A1A] px-2 py-0.5 rounded-full font-mono">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              id="tab-btn-wishlist"
              onClick={() => setActiveTab('wishlist')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all ${
                activeTab === 'wishlist'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#555555] hover:bg-[#F9F7F2]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
              </div>
              <span className="text-[10px] bg-[#EFEBE1] text-[#1A1A1A] px-2 py-0.5 rounded-full font-mono">
                {wishlist.length}
              </span>
            </button>

            <button
              type="button"
              id="tab-btn-addresses"
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all ${
                activeTab === 'addresses'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#555555] hover:bg-[#F9F7F2]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </div>
              <span className="text-[10px] bg-[#EFEBE1] text-[#1A1A1A] px-2 py-0.5 rounded-full font-mono">
                {addresses.length}
              </span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="lg:col-span-3">
            
            {/* ---------------- 1. PROFILE TAB ---------------- */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-[#E5E1D8] p-6 sm:p-8 shadow-xs space-y-6"
              >
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">Personal Profile</h3>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Update your account details. Email address and account role are secured.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                      Email Address (Permanent Identifier)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2.5 bg-[#EFEBE1]/50 border border-[#E5E1D8] rounded-xl text-sm text-[#777777] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                      Account Tier
                    </label>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5E1D8] text-xs font-semibold text-[#1A1A1A]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{user?.role === 'admin' ? 'Administrator' : 'Standard Patron'}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="py-2.5 px-5 rounded-xl bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingProfile ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-[#C5A880]" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>

                    {profileSaved && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved
                      </span>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

            {/* ---------------- 2. MY ORDERS TAB ---------------- */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">My Order History</h3>
                    <p className="text-xs text-[#666666]">
                      Securely queried from MongoDB for your authenticated account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('shop')}
                    className="text-xs font-bold text-[#8C7E6A] hover:text-[#1A1A1A] uppercase tracking-wider underline underline-offset-2"
                  >
                    Continue Shopping &rarr;
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#E5E1D8] p-8 text-center space-y-3">
                    <Package className="w-8 h-8 text-[#8C7E6A] mx-auto" />
                    <p className="font-serif text-base font-semibold text-[#1A1A1A]">No Orders Placed Yet</p>
                    <p className="text-xs text-[#666666]">Explore our handcrafted living room, lighting, and decor collections.</p>
                    <button
                      type="button"
                      onClick={() => setCurrentPage('shop')}
                      className="py-2.5 px-5 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs"
                    >
                      Shop Catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((ord) => (
                      <div
                        key={ord.orderId}
                        className="bg-white rounded-2xl border border-[#E5E1D8] p-5 shadow-2xs hover:border-[#8C7E6A]/50 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EBE1]">
                          <div>
                            <span className="font-mono font-bold text-sm text-[#1A1A1A]">{ord.orderId}</span>
                            <span className="text-xs text-[#888888] ml-3">{ord.orderDate}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E5E1D8] text-[#1A1A1A]">
                              {STAGE_LABELS[ord.orderStatus] || ord.orderStatus}
                            </span>
                            <span className="font-bold text-sm text-[#1A1A1A]">{formatPrice(ord.total)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#666666]">
                          <div>
                            <p className="font-semibold text-[#1A1A1A]">Items: {ord.items.length}</p>
                            <p className="truncate max-w-md">
                              {ord.items.map((i) => `${i.quantity}x ${i.product?.name || 'Decor'}`).join(', ')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTrackingOrderId(ord.orderId);
                                setCurrentPage('track-order');
                              }}
                              className="py-1.5 px-3 rounded-lg bg-[#FAF8F5] hover:bg-[#EFEBE1] text-[#1A1A1A] border border-[#E5E1D8] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                            >
                              <span>Track</span>
                              <ExternalLink className="w-3 h-3 text-[#8C7E6A]" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveOrderDetails(ord)}
                              className="py-1.5 px-3 rounded-lg bg-[#1A1A1A] text-white hover:bg-black text-[11px] font-bold uppercase tracking-wider"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---------------- 3. WISHLIST TAB ---------------- */}
            {activeTab === 'wishlist' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">Saved Wishlist</h3>
                  <p className="text-xs text-[#666666]">
                    Curated artisan items saved to your personal profile.
                  </p>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#E5E1D8] p-8 text-center space-y-3">
                    <Heart className="w-8 h-8 text-[#8C7E6A] mx-auto" />
                    <p className="font-serif text-base font-semibold text-[#1A1A1A]">Your Wishlist is Empty</p>
                    <p className="text-xs text-[#666666]">Heart items across the catalog to save them for later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white rounded-2xl border border-[#E5E1D8] p-4 flex gap-3.5 shadow-2xs hover:border-[#8C7E6A] transition-all"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-20 h-20 rounded-xl object-cover border border-[#E5E1D8] bg-[#FAF8F5]"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-serif text-sm font-semibold text-[#1A1A1A] line-clamp-1">{prod.name}</h4>
                            <p className="text-xs font-bold text-[#1A1A1A] mt-0.5">{formatPrice(prod.price)}</p>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                addToCart(prod, 1, prod.colors[0]?.name || 'Default');
                                addToast('success', 'Added to Cart', `${prod.name} added to your bag.`);
                              }}
                              className="py-1 px-3 rounded-lg bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Add to Bag</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromWishlist(prod.id)}
                              className="p-1 rounded-lg text-[#888888] hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---------------- 4. SAVED ADDRESSES TAB ---------------- */}
            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">Delivery Addresses</h3>
                    <p className="text-xs text-[#666666]">
                      Manage multiple shipping locations for seamless checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    id="add-new-address-btn"
                    onClick={() => {
                      resetAddressForm();
                      setShowAddAddressModal(true);
                    }}
                    className="py-2 px-3.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Address</span>
                  </button>
                </div>

                {isLoadingAddresses ? (
                  <div className="py-10 text-center text-xs text-[#666666]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#8C7E6A] mb-2" />
                    Loading saved addresses...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#E5E1D8] p-8 text-center space-y-3">
                    <MapPin className="w-8 h-8 text-[#8C7E6A] mx-auto" />
                    <p className="font-serif text-base font-semibold text-[#1A1A1A]">No Addresses Saved</p>
                    <p className="text-xs text-[#666666]">Add a delivery address to speed up your future orders.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const addrId = addr._id || addr.id;
                      return (
                        <div
                          key={addrId}
                          className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-3 relative ${
                            addr.isDefault ? 'border-[#1A1A1A] bg-[#FAF8F5]' : 'border-[#E5E1D8]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
                                {addr.label || 'Home'}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-[#1A1A1A] text-white rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditAddressClick(addr)}
                                className="p-1 text-[#666666] hover:text-[#1A1A1A] rounded"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addrId)}
                                className="p-1 text-[#888888] hover:text-red-600 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-[#555555] space-y-0.5">
                            <p className="font-semibold text-[#1A1A1A]">{addr.street || addr.addressLine1}</p>
                            <p>{addr.city}, {addr.state} - {addr.postalCode || addr.pincode}</p>
                            <p>{addr.country || 'India'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add/Edit Address Form Modal */}
                {showAddAddressModal && (
                  <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-[#1E1C1A]/70 backdrop-blur-xs">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E5E1D8] shadow-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
                        <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">
                          {editingAddressId ? 'Edit Address' : 'Add Delivery Address'}
                        </h4>
                        <button
                          type="button"
                          onClick={resetAddressForm}
                          className="text-[#666666] hover:text-[#1A1A1A] text-sm"
                        >
                          &times;
                        </button>
                      </div>

                      <form onSubmit={handleSaveAddress} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                            Address Label (e.g. Home, Studio, Office)
                          </label>
                          <input
                            type="text"
                            value={addrLabel}
                            onChange={(e) => setAddrLabel(e.target.value)}
                            className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            required
                            value={addrStreet}
                            onChange={(e) => setAddrStreet(e.target.value)}
                            placeholder="Flat / House No., Landmark, Street"
                            className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              required
                              value={addrCity}
                              onChange={(e) => setAddrCity(e.target.value)}
                              placeholder="Bengaluru"
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                              State *
                            </label>
                            <input
                              type="text"
                              required
                              value={addrState}
                              onChange={(e) => setAddrState(e.target.value)}
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                            Postal Code / Pincode *
                          </label>
                          <input
                            type="text"
                            required
                            value={addrPostalCode}
                            onChange={(e) => setAddrPostalCode(e.target.value)}
                            placeholder="560001"
                            className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A]"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="addr-default-chk"
                            checked={addrIsDefault}
                            onChange={(e) => setAddrIsDefault(e.target.checked)}
                            className="rounded text-[#1A1A1A] focus:ring-0"
                          />
                          <label htmlFor="addr-default-chk" className="text-xs text-[#555555] cursor-pointer">
                            Set as default delivery address
                          </label>
                        </div>

                        <div className="pt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={resetAddressForm}
                            className="flex-1 py-2.5 rounded-xl border border-[#E5E1D8] text-xs font-bold uppercase tracking-wider text-[#666666]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingAddress}
                            className="flex-1 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                          >
                            {isSavingAddress ? 'Saving...' : 'Save Address'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </ProtectedView>
  );
};
