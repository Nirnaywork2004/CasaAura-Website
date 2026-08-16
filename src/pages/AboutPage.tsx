import React from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { Sparkles, Leaf, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { setCurrentPage, setSelectedCategoryFilter } = useCartWishlist();

  return (
    <div id="about-page-container" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEBE1] border border-[#E5E1D8] text-[#8C7E6A] text-[11px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#8C7E6A]" />
            <span>Our Philosophy & Heritage</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1A1A] tracking-tight leading-[1.2]">
            Curating Soulful Sanctuaries with Mindful Craft
          </h1>

          <p className="text-base sm:text-lg text-[#555555] leading-relaxed">
            CasaAura was born from a simple belief: that a home should not just be decorated, but curated with quiet elegance, tactile warmth, and timeless artisan stories.
          </p>
        </div>

        {/* Large Story Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 relative aspect-4/3 rounded-3xl overflow-hidden bg-[#EFEBE1] border border-[#E5E1D8] shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
              alt="Artisan ceramic studio workshop"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">
              Honoring Heritage Hands & Natural Materials
            </h2>
            <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
              We collaborate with master generational artisans across Indian pottery enclaves, Rajasthani brass casting hubs, and Bhadohi carpet looms. By combining timeless ancestral techniques with minimalist contemporary aesthetics, we build objects that hold character and stand the test of time.
            </p>
            <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
              Every curve of our sandstone ceramics is hand-thrown; every linen cushion is loomed from pure flax and garment-washed for lived-in softness.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4 border-t border-[#E5E1D8]">
              <div>
                <p className="font-serif text-2xl font-bold text-[#1A1A1A]">100%</p>
                <p className="text-xs text-[#777777]">Eco-friendly, plastic-free protective packaging</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#1A1A1A]">500+</p>
                <p className="text-xs text-[#777777]">Artisan families supported sustainably</p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">
              The CasaAura Principles
            </h2>
            <p className="text-xs sm:text-sm text-[#555555]">
              Every piece in our catalog satisfies four non-negotiable criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#EFEBE1] text-[#1A1A1A] flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#1A1A1A]">Sustainable Sourcing</h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                Raw clay, unbleached wool, pure flax linen, and FSC-certified ash wood free from synthetic chemicals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#EFEBE1] text-[#1A1A1A] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#1A1A1A]">Fair Artisan Trade</h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                Direct partnerships ensuring equitable compensation, safe ateliers, and healthcare funds for crafts families.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#EFEBE1] text-[#1A1A1A] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#1A1A1A]">Quiet Permanence</h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                Rejecting fast-furniture trends in favor of durable joinery, high-fired stoneware, and timeless proportions.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#EFEBE1] border border-[#E5E1D8] text-center max-w-3xl mx-auto space-y-4">
          <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
            Ready to Transform Your Home?
          </h3>
          <p className="text-xs sm:text-sm text-[#555555] max-w-md mx-auto">
            Explore our curated catalog and bring home pieces that inspire peace, comfort, and conversation.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryFilter('all');
              setCurrentPage('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all shadow-md"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4 text-[#C5A880]" />
          </button>
        </div>

      </div>
    </div>
  );
};
