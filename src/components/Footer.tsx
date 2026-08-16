import React, { useState } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  ShieldCheck, 
  Heart,
  X,
  CreditCard,
  Truck,
  HelpCircle
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentPage, setSelectedCategoryFilter, setIsTrackOrderOpen } = useCartWishlist();
  const [activeFaqModal, setActiveFaqModal] = useState(false);

  const navigateTo = (page: string, category: string = 'all') => {
    setCurrentPage(page);
    setSelectedCategoryFilter(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer id="main-footer" className="bg-[#141414] text-[#EDE7DD] pt-16 pb-12 border-t border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#262626]">
            
            {/* Brand Intro Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#141414] font-serif font-bold text-base shadow-sm">
                  C
                </div>
                <span className="font-brand font-bold text-2xl tracking-[0.2em] text-[#F9F7F2] uppercase">
                  CasaAura
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed max-w-sm">
                Curating quiet luxury and mindful decor for contemporary homes. From hand-thrown pottery to organic linen textiles, we bridge timeless heritage craftsmanship with modern living.
              </p>

              <div className="pt-2">
                <p className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest mb-2">Connect With Us</p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-[#222222] hover:bg-[#F9F7F2] hover:text-[#141414] text-[#A0A0A0] flex items-center justify-center transition-colors border border-[#333333]"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-[#222222] hover:bg-[#F9F7F2] hover:text-[#141414] text-[#A0A0A0] flex items-center justify-center transition-colors border border-[#333333]"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-[#222222] hover:bg-[#F9F7F2] hover:text-[#141414] text-[#A0A0A0] flex items-center justify-center transition-colors border border-[#333333]"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Shop Categories */}
            <div className="space-y-3">
              <p className="font-serif text-sm font-semibold text-[#F9F7F2] tracking-wide">
                Shop Collections
              </p>
              <ul className="space-y-2 text-xs text-[#A0A0A0]">
                <li>
                  <button onClick={() => navigateTo('shop', 'living-room')} className="hover:text-[#F9F7F2] transition-colors">
                    Living Room & Throws
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('shop', 'bedroom')} className="hover:text-[#F9F7F2] transition-colors">
                    Bedroom & Linens
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('shop', 'dining')} className="hover:text-[#F9F7F2] transition-colors">
                    Dining & Ceramicware
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('shop', 'lighting')} className="hover:text-[#F9F7F2] transition-colors">
                    Artisan Lighting
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('shop', 'wall-decor')} className="hover:text-[#F9F7F2] transition-colors">
                    Plaster Wall Art
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('shop', 'rugs')} className="hover:text-[#F9F7F2] transition-colors">
                    Wool & Jute Rugs
                  </button>
                </li>
              </ul>
            </div>

            {/* Customer Care & Help */}
            <div className="space-y-3">
              <p className="font-serif text-sm font-semibold text-[#F9F7F2] tracking-wide">
                Customer Care
              </p>
              <ul className="space-y-2 text-xs text-[#A0A0A0]">
                <li>
                  <button onClick={() => navigateTo('orders')} className="hover:text-[#F9F7F2] transition-colors flex items-center gap-1.5">
                    <span>My Orders</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('track-order')} className="hover:text-[#F9F7F2] transition-colors flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Track Your Order</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveFaqModal(true)} className="hover:text-[#F9F7F2] transition-colors">
                    Frequently Asked Questions
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveFaqModal(true)} className="hover:text-[#F9F7F2] transition-colors">
                    Shipping & Delivery Terms
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveFaqModal(true)} className="hover:text-[#F9F7F2] transition-colors">
                    7-Day Return Policy
                  </button>
                </li>
                <li>
                  <span className="text-[#666666] block pt-1">Care & Maintenance Guides</span>
                </li>
              </ul>
            </div>

            {/* Company & Philosophy */}
            <div className="space-y-3">
              <p className="font-serif text-sm font-semibold text-[#F9F7F2] tracking-wide">
                CasaAura Studio
              </p>
              <ul className="space-y-2 text-xs text-[#A0A0A0]">
                <li>
                  <button onClick={() => navigateTo('about')} className="hover:text-[#F9F7F2] transition-colors">
                    Our Story & Heritage
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('about')} className="hover:text-[#F9F7F2] transition-colors">
                    Artisan Collective
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('about')} className="hover:text-[#F9F7F2] transition-colors">
                    Sustainability Pledge
                  </button>
                </li>
                <li>
                  <span className="text-[#666666] block">Design Trade Program</span>
                </li>
                <li>
                  <span className="text-[#666666] block">Press & Editorial</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Payment Badges */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
            <p>
              &copy; {new Date().getFullYear()} CasaAura Lifestyle Private Limited. Handcrafted for modern living.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#222222] border border-[#333333] text-[10px] font-semibold text-[#CCCCCC]">
                UPI / GPay / PhonePe
              </span>
              <span className="px-2.5 py-1 rounded bg-[#222222] border border-[#333333] text-[10px] font-semibold text-[#CCCCCC]">
                Visa & Mastercard
              </span>
              <span className="px-2.5 py-1 rounded bg-[#222222] border border-[#333333] text-[10px] font-semibold text-[#CCCCCC]">
                RuPay
              </span>
              <span className="px-2.5 py-1 rounded bg-[#222222] border border-[#333333] text-[10px] font-semibold text-[#CCCCCC]">
                Cash on Delivery
              </span>
            </div>
          </div>

        </div>
      </footer>

      {/* FAQ Modal */}
      {activeFaqModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveFaqModal(false)}
        >
          <div 
            className="bg-[#F9F7F2] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto border border-[#E5E1D8] shadow-2xl text-[#1A1A1A]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#8C7E6A]" />
                <h3 className="font-serif text-xl font-semibold">Help & FAQ</h3>
              </div>
              <button 
                onClick={() => setActiveFaqModal(false)}
                className="p-1.5 rounded-lg hover:bg-[#EFEBE1] text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs sm:text-sm text-[#555555]">
              <div>
                <p className="font-semibold text-[#1A1A1A]">How long does delivery take?</p>
                <p className="text-xs text-[#666666] mt-0.5">Orders are packed within 24 hours. Transit takes 2–4 business days for metro cities (Bengaluru, Mumbai, Delhi, Hyderabad) and 4–6 business days for other regions across India.</p>
              </div>

              <div>
                <p className="font-semibold text-[#1A1A1A]">What is your return & exchange policy?</p>
                <p className="text-xs text-[#666666] mt-0.5">We offer a 7-day hassle-free doorstep return or exchange for all un-damaged items in their original packaging. Simply contact concierge@casaaura.in or use the Track Order tab.</p>
              </div>

              <div>
                <p className="font-semibold text-[#1A1A1A]">How are fragile ceramics packaged?</p>
                <p className="text-xs text-[#666666] mt-0.5">Every ceramic and glass object is wrapped in biodegradable honeycomb paper and molded protective recycled foam cells tested to withstand 1.5m drops.</p>
              </div>

              <div>
                <p className="font-semibold text-[#1A1A1A]">Are the wool and jute rugs child & pet-friendly?</p>
                <p className="text-xs text-[#666666] mt-0.5">Yes! Our rugs use un-dyed, chemical-free raw fibers that are naturally hypoallergenic and stain-resistant.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E1D8] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveFaqModal(false)}
                className="px-5 py-2 bg-[#1A1A1A] hover:bg-black text-white rounded-xl text-xs font-semibold tracking-widest uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
