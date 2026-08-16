import React from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const FeaturedCollection: React.FC = () => {
  const { setCurrentPage, setSelectedCategoryFilter } = useCartWishlist();

  const handleExplore = () => {
    setSelectedCategoryFilter('living-room');
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="featured-collection-section" className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#E5E1D8] overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left Content Side */}
            <div className="p-8 sm:p-12 lg:p-16 lg:col-span-6 space-y-6 sm:space-y-8">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEBE1] text-[#1A1A1A] text-[11px] font-bold uppercase tracking-widest border border-[#E5E1D8]">
                <Sparkles className="w-3.5 h-3.5 text-[#8C7E6A]" />
                <span>Curator's Spotlight</span>
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] text-[#1A1A1A] font-semibold leading-[1.2] tracking-tight">
                  Bring Natural Warmth Home
                </h2>
                <p className="text-base sm:text-lg text-[#555555] leading-relaxed font-normal">
                  Discover carefully selected pieces inspired by natural raw materials, soft woven textures, and timeless organic forms that age gracefully with your home.
                </p>
              </div>

              {/* Feature Highlights Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-sm text-[#333333]">
                  <CheckCircle2 className="w-5 h-5 text-[#8C7E6A] shrink-0 mt-0.5" />
                  <span><strong className="text-[#1A1A1A]">Hand-Thrown Ceramics:</strong> Kiln-fired stoneware with matte chalk & terracotta finishes.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#333333]">
                  <CheckCircle2 className="w-5 h-5 text-[#8C7E6A] shrink-0 mt-0.5" />
                  <span><strong className="text-[#1A1A1A]">Belgian Washed Linens:</strong> Breathable, gentle organic flax for relaxed styling.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#333333]">
                  <CheckCircle2 className="w-5 h-5 text-[#8C7E6A] shrink-0 mt-0.5" />
                  <span><strong className="text-[#1A1A1A]">Solid Sustainable Hardwoods:</strong> Sourced from responsibly managed community forests.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id="featured-collection-cta"
                  onClick={handleExplore}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-200 shadow-md group"
                >
                  <span>Explore The Earth & Loom Edit</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* Right Large Lifestyle Image */}
            <div className="lg:col-span-6 h-80 sm:h-[480px] lg:h-[580px] relative overflow-hidden bg-[#EFEBE1]">
              <img
                src="https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1400&q=85"
                alt="Natural warm home interior showcase"
                className="w-full h-full object-cover object-center transform hover:scale-103 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/30 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-xl border border-[#E5E1D8] text-xs text-[#1A1A1A] shadow-lg">
                <p className="font-serif font-bold text-sm text-[#1A1A1A]">Earth & Loom Collection</p>
                <p className="text-[#666666] mt-0.5">Featuring Scalloped Travertine & Organic Ceramics</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
