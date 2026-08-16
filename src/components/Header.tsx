import React, { useState, useEffect, useRef } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X, 
  Compass, 
  Sparkles, 
  Package,
  ChevronRight,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    cartCount, 
    wishlistCount, 
    setIsCartOpen, 
    setIsSearchOpen, 
    setIsTrackOrderOpen,
    currentPage, 
    setCurrentPage, 
    setSelectedCategoryFilter,
    user,
    isAuthenticated,
    isAdmin,
    setIsAuthModalOpen,
    setAuthModalMode,
    setIsAdminModalOpen,
    logout
  } = useCartWishlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateTo = (page: string, category = 'all') => {
    setCurrentPage(page);
    setSelectedCategoryFilter(category);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Announcement Bar */}
      <div 
        id="announcement-bar" 
        className="bg-[#1A1A1A] text-[#EDE5DC] text-[11px] font-medium py-2 px-4 text-center tracking-widest uppercase border-b border-[#2A2A2A] relative z-40"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880] animate-pulse" />
          <span>Complimentary Pan-India Delivery on Orders Above ₹999 &bull; Code <strong className="text-white font-bold underline decoration-[#C5A880] underline-offset-4">CASA10</strong> for 10% Off</span>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        id="main-header"
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#F9F7F2]/95 backdrop-blur-md shadow-xs border-b border-[#E5E1D8] py-3.5' 
            : 'bg-[#F9F7F2] border-b border-[#E5E1D8] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-[#1A1A1A] hover:text-black focus:outline-none rounded-lg"
                aria-label="Open mobile navigation"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <button
                type="button"
                id="mobile-search-btn"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#1A1A1A] hover:text-black focus:outline-none rounded-lg"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center">
              <button
                type="button"
                id="brand-logo-btn"
                onClick={() => navigateTo('home')}
                className="group text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#F9F7F2] font-serif font-bold text-sm tracking-wider shadow-xs group-hover:bg-[#333333] transition-colors">
                    C
                  </div>
                  <div>
                    <span className="font-brand font-bold text-xl sm:text-2xl tracking-[0.2em] text-[#1A1A1A] uppercase">
                      CasaAura
                    </span>
                    <span className="hidden sm:block text-[9px] uppercase tracking-[0.3em] text-[#8C7E6A] -mt-1 font-semibold">
                      Curated Living
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Desktop Center Navigation Links */}
            <nav id="desktop-nav" className="hidden lg:flex items-center gap-7">
              <button
                type="button"
                id="nav-home"
                onClick={() => navigateTo('home')}
                className={`text-[12px] uppercase tracking-widest font-semibold transition-colors py-1 relative ${
                  currentPage === 'home' 
                    ? 'text-[#1A1A1A]' 
                    : 'text-[#666666] hover:text-[#1A1A1A]'
                }`}
              >
                Home
                {currentPage === 'home' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]" />
                )}
              </button>

              <button
                type="button"
                id="nav-shop"
                onClick={() => navigateTo('shop', 'all')}
                className={`text-[12px] uppercase tracking-widest font-semibold transition-colors py-1 relative ${
                  currentPage === 'shop' 
                    ? 'text-[#1A1A1A]' 
                    : 'text-[#666666] hover:text-[#1A1A1A]'
                }`}
              >
                Shop All
                {currentPage === 'shop' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]" />
                )}
              </button>

              <button
                type="button"
                id="nav-bestsellers"
                onClick={() => navigateTo('shop', 'bestseller')}
                className="text-[12px] uppercase tracking-widest font-semibold text-[#666666] hover:text-[#1A1A1A] transition-colors py-1"
              >
                Best Sellers
              </button>

              <button
                type="button"
                id="nav-categories"
                onClick={() => {
                  if (currentPage !== 'home') {
                    navigateTo('home');
                    setTimeout(() => {
                      document.getElementById('category-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('category-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-[12px] uppercase tracking-widest font-semibold text-[#666666] hover:text-[#1A1A1A] transition-colors py-1"
              >
                Categories
              </button>

              <button
                type="button"
                id="nav-my-orders"
                onClick={() => navigateTo('orders')}
                className={`text-[12px] uppercase tracking-widest font-semibold transition-colors py-1 relative ${
                  currentPage === 'orders' 
                    ? 'text-[#1A1A1A]' 
                    : 'text-[#666666] hover:text-[#1A1A1A]'
                }`}
              >
                My Orders
                {currentPage === 'orders' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]" />
                )}
              </button>

              <button
                type="button"
                id="nav-track"
                onClick={() => navigateTo('track-order')}
                className={`text-[12px] uppercase tracking-widest font-semibold transition-colors py-1 relative ${
                  currentPage === 'track-order' 
                    ? 'text-[#1A1A1A]' 
                    : 'text-[#666666] hover:text-[#1A1A1A]'
                }`}
              >
                Track
                {currentPage === 'track-order' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]" />
                )}
              </button>

              <button
                type="button"
                id="nav-about"
                onClick={() => navigateTo('about')}
                className={`text-[12px] uppercase tracking-widest font-semibold transition-colors py-1 relative ${
                  currentPage === 'about' 
                    ? 'text-[#1A1A1A]' 
                    : 'text-[#666666] hover:text-[#1A1A1A]'
                }`}
              >
                Our Story
                {currentPage === 'about' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]" />
                )}
              </button>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <button
                type="button"
                id="header-search-btn"
                onClick={() => setIsSearchOpen(true)}
                className="hidden xl:flex items-center gap-2 py-1.5 px-3 rounded-full bg-[#EFEBE1] hover:bg-[#E5E0D5] text-[#444444] hover:text-[#1A1A1A] transition-colors text-xs font-medium border border-[#E5E1D8]"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5 text-[#8C7E6A]" />
                <span className="text-[#666666]">Search decor...</span>
                <kbd className="text-[10px] text-[#888888] bg-[#F9F7F2] px-1.5 py-0.5 rounded font-mono border border-[#E0DCD3]">⌘K</kbd>
              </button>

              {/* User Account / Sign In Dropdown */}
              <div className="relative" ref={dropdownRef}>
                {isAuthenticated && user ? (
                  <button
                    type="button"
                    id="header-user-menu-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#EFEBE1] hover:bg-[#E5E0D5] text-[#1A1A1A] text-xs font-semibold border border-[#E5E1D8] transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[9px] font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[80px] truncate hidden sm:inline">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-[#8C7E6A]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    id="header-login-btn"
                    onClick={() => {
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-[#EFEBE1] text-[#444444] hover:text-[#1A1A1A] text-xs font-semibold border border-transparent hover:border-[#E5E1D8] transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-[#8C7E6A]" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}

                {/* User Dropdown Menu */}
                {userDropdownOpen && isAuthenticated && user && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E5E1D8] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-[#F0EBE1]">
                      <p className="text-xs font-bold text-[#1A1A1A] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#777777] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFEBE1] text-[#8C7E6A]">
                        {user.role}
                      </span>
                    </div>

                    <button
                      type="button"
                      id="dropdown-my-account"
                      onClick={() => navigateTo('account')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-[#444444] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-[#8C7E6A]" />
                      <span>My Account & Addresses</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('orders')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-[#444444] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] flex items-center gap-2"
                    >
                      <Package className="w-4 h-4 text-[#8C7E6A]" />
                      <span>My Orders</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('wishlist')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-[#444444] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-[#8C7E6A]" />
                      <span>Wishlist</span>
                    </button>

                    {/* Admin Portal Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsAdminModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-[#444444] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] flex items-center gap-2 border-t border-[#F0EBE1]"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                      <span>Admin Orders Console</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-[#F0EBE1]"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Orders Direct Icon */}
              <button
                type="button"
                id="header-orders-btn"
                onClick={() => navigateTo('orders')}
                className={`hidden sm:flex items-center justify-center p-2 rounded-full transition-colors ${
                  currentPage === 'orders' ? 'bg-[#EFEBE1] text-[#1A1A1A]' : 'text-[#444444] hover:text-[#1A1A1A] hover:bg-[#EFEBE1]'
                }`}
                title="My Orders"
                aria-label="My Orders"
              >
                <Package className="w-5 h-5" />
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                id="header-wishlist-btn"
                onClick={() => navigateTo('wishlist')}
                className="relative p-2 text-[#444444] hover:text-[#1A1A1A] hover:bg-[#EFEBE1] rounded-full transition-colors"
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-[#8C7E6A] text-[#8C7E6A]' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8C7E6A] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                type="button"
                id="header-cart-btn"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-[#1A1A1A] hover:bg-[#333333] text-[#F9F7F2] rounded-full transition-all duration-200 flex items-center gap-1.5 px-3 sm:px-3.5 shadow-xs"
                aria-label={`Shopping bag with ${cartCount} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-bold">{cartCount}</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-nav-backdrop"
          className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            id="mobile-nav-drawer"
            className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#F9F7F2] shadow-2xl flex flex-col justify-between p-6 z-50 border-r border-[#E5E1D8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E5E1D8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#F9F7F2] font-serif font-bold text-sm">
                    C
                  </div>
                  <span className="font-brand font-bold text-lg tracking-[0.2em] text-[#1A1A1A] uppercase">
                    CasaAura
                  </span>
                </div>
                <button
                  type="button"
                  id="mobile-nav-close"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#555555] hover:text-[#1A1A1A] rounded-lg"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Auth Bar */}
              <div className="py-4 border-b border-[#E5E1D8]">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#1A1A1A]">{user.name}</p>
                      <p className="text-[10px] text-[#777777]">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-[11px] font-bold text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs"
                  >
                    <UserIcon className="w-4 h-4 text-[#C5A880]" />
                    <span>Sign In / Register</span>
                  </button>
                )}
              </div>

              <div className="py-4 space-y-1">
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-between ${
                    currentPage === 'home' ? 'bg-[#EFEBE1] text-[#1A1A1A]' : 'text-[#555555] hover:bg-[#F2EDE6]'
                  }`}
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-[#8C7E6A]" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('shop', 'all')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-between ${
                    currentPage === 'shop' ? 'bg-[#EFEBE1] text-[#1A1A1A]' : 'text-[#555555] hover:bg-[#F2EDE6]'
                  }`}
                >
                  <span>Shop Catalog</span>
                  <ChevronRight className="w-4 h-4 text-[#8C7E6A]" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('shop', 'bestseller')}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold text-[#555555] hover:bg-[#F2EDE6] flex items-center justify-between"
                >
                  <span>Best Sellers</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#1A1A1A] text-white rounded">Hot</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('shop', 'new')}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold text-[#555555] hover:bg-[#F2EDE6] flex items-center justify-between"
                >
                  <span>New Arrivals</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#8C7E6A] text-white rounded">New</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('wishlist')}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold text-[#555555] hover:bg-[#F2EDE6] flex items-center justify-between"
                >
                  <span>My Wishlist ({wishlistCount})</span>
                  <Heart className="w-4 h-4 text-[#8C7E6A]" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('account')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-between ${
                    currentPage === 'account' ? 'bg-[#EFEBE1] text-[#1A1A1A]' : 'text-[#555555] hover:bg-[#F2EDE6]'
                  }`}
                >
                  <span>My Account</span>
                  <UserIcon className="w-4 h-4 text-[#8C7E6A]" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('orders')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-between ${
                    currentPage === 'orders' ? 'bg-[#EFEBE1] text-[#1A1A1A]' : 'text-[#555555] hover:bg-[#F2EDE6]'
                  }`}
                >
                  <span>My Orders</span>
                  <Package className="w-4 h-4 text-[#8C7E6A]" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('track-order')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-between ${
                    currentPage === 'track-order' ? 'bg-[#EFEBE1] text-[#1A1A1A]' : 'text-[#555555] hover:bg-[#F2EDE6]'
                  }`}
                >
                  <span>Track Order</span>
                  <Package className="w-4 h-4 text-[#8C7E6A]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAdminModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold text-[#8C7E6A] hover:bg-[#F2EDE6] flex items-center justify-between"
                >
                  <span>Admin Order Console</span>
                  <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('about')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-between ${
                    currentPage === 'about' ? 'bg-[#EFEBE1] text-[#1A1A1A]' : 'text-[#555555] hover:bg-[#F2EDE6]'
                  }`}
                >
                  <span>Our Story & Philosophy</span>
                  <Compass className="w-4 h-4 text-[#8C7E6A]" />
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E1D8] text-xs text-[#777777] space-y-2">
              <p className="font-medium text-[#1A1A1A]">Currency: Indian Rupee (INR ₹)</p>
              <p>Need styling assistance? concierge@casaaura.in</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
