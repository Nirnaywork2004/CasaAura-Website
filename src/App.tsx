import React from 'react';
import { CartWishlistProvider, useCartWishlist } from './context/CartWishlistContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { CategorySection } from './components/CategorySection';
import { FeaturedCollection } from './components/FeaturedCollection';
import { CustomerFavorites } from './components/CustomerFavorites';
import { ShopTheLook } from './components/ShopTheLook';
import { Testimonials } from './components/Testimonials';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CheckoutModal } from './components/CheckoutModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { ToastContainer } from './components/Toast';
import { ShopPage } from './pages/ShopPage';
import { WishlistPage } from './pages/WishlistPage';
import { AboutPage } from './pages/AboutPage';
import { OrdersPage } from './pages/OrdersPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AccountPage } from './pages/AccountPage';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { AuthModal } from './components/AuthModal';
import { AdminOrdersModal } from './components/AdminOrdersModal';

const MainContent: React.FC = () => {
  const { currentPage } = useCartWishlist();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1A1A1A]">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Global Header */}
      <Header />

      {/* Dynamic Main Body Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <>
            <Hero />
            <Benefits />
            <CategorySection />
            <FeaturedCollection />
            <CustomerFavorites />
            <ShopTheLook />
            <Testimonials />
            <Newsletter />
          </>
        )}

        {currentPage === 'shop' && <ShopPage />}
        {currentPage === 'wishlist' && <WishlistPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'orders' && <OrdersPage />}
        {currentPage === 'account' && <AccountPage />}
        {currentPage === 'track-order' && <TrackOrderPage />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <SearchModal />
      <ProductDetailsModal />
      <CheckoutModal />
      <TrackOrderModal />
      <OrderDetailsModal />
      <AuthModal />
      <AdminOrdersModal />
    </div>
  );
};

export default function App() {
  return (
    <CartWishlistProvider>
      <MainContent />
    </CartWishlistProvider>
  );
}
