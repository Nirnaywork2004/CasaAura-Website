import React from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { ArrowRight, Sparkles, ShieldCheck, Leaf } from 'lucide-react';

export const Hero: React.FC = () => {
  const { setCurrentPage, setSelectedCategoryFilter } = useCartWishlist();

  const handleExplore = () => {
    setSelectedCategoryFilter('all');
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBestsellers = () => {
    setSelectedCategoryFilter('bestseller');
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      id="hero-section"
      className="relative overflow-hidden pt-4 pb-12 sm:pb-16 lg:pb-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#EFEBE1] border border-[#E5E1D8] shadow-sm">
          
          {/* Background Decorative Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F9F7F2]/95 via-[#F9F7F2]/75 to-transparent z-10 pointer-events-none lg:w-3/5" />
          
          {/* Main Hero Grid */}
          <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 min-h-[540px] sm:min-h-[600px] lg:min-h-[640px] items-center">
            
            {/* Left Content Column */}
            <div className="p-6 sm:p-10 lg:p-14 lg:col-span-7 xl:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-8">
              
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E5E0D5] text-[#1A1A1A] text-[11px] font-semibold tracking-widest uppercase w-fit border border-[#D8D2C6]">
                <Sparkles className="w-3.5 h-3.5 text-[#8C7E6A]" />
                <span>Curated For Your Home</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-3">
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-[#1A1A1A] leading-[1.15] font-semibold tracking-tight">
                  Make Your Space Feel Like Home
                </h1>
                <p className="text-base sm:text-lg text-[#555555] leading-relaxed max-w-xl font-normal">
                  Thoughtfully crafted artisan ceramics, organic linen textiles, warm ambient lighting, and timeless accents designed to bring soulful elegance to everyday living.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  type="button"
                  id="hero-explore-btn"
                  onClick={handleExplore}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-200 shadow-md hover:shadow-lg group"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  id="hero-bestsellers-btn"
                  onClick={handleBestsellers}
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F0EDE6] text-[#1A1A1A] text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-200 border border-[#1A1A1A] shadow-xs"
                >
                  Shop Best Sellers
                </button>
              </div>

              {/* Subtle Trust Highlights */}
              <div className="pt-4 border-t border-[#E5E1D8] grid grid-cols-2 gap-4 max-w-md">
                <div className="flex items-center gap-2 text-xs text-[#555555]">
                  <Leaf className="w-4 h-4 text-[#8C7E6A] shrink-0" />
                  <span className="tracking-wide">Sustainably Sourced</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#555555]">
                  <ShieldCheck className="w-4 h-4 text-[#8C7E6A] shrink-0" />
                  <span className="tracking-wide">100% Artisan Handcrafted</span>
                </div>
              </div>

            </div>

            {/* Right Image Column */}
            <div className="lg:col-span-5 xl:col-span-6 h-72 sm:h-96 lg:h-full relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85"
                alt="Curated minimalist warm interior with sofa, coffee table and artisanal ceramics"
                className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700 ease-out"
                loading="eager"
              />

              {/* Floating Product Highlight Card */}
              <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-3.5 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-lg border border-[#E5E1D8] max-w-xs animate-fade-in">
                <img
                  src="https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=150&q=80"
                  alt="Sculptural Ceramic Vase"
                  className="w-12 h-12 rounded-lg object-cover border border-[#E5E1D8]"
                />
                <div className="text-left">
                  <p className="text-[10px] font-bold text-[#8C7E6A] uppercase tracking-widest">Featured Accent</p>
                  <p className="text-xs font-semibold text-[#1A1A1A]">Sculptural Sandstone Vase</p>
                  <p className="text-xs font-bold text-[#1A1A1A]">₹899 <span className="line-through text-[#888888] text-[10px] font-normal">₹1,199</span></p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
