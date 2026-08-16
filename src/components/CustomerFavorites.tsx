import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { useCartWishlist } from '../context/CartWishlistContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CustomerFavorites: React.FC = () => {
  const { productsList, setCurrentPage, setSelectedCategoryFilter } = useCartWishlist();
  const [activeTab, setActiveTab] = useState<'all' | 'bestseller' | 'living-room' | 'lighting' | 'wall-decor'>('all');

  const filterProducts = () => {
    if (activeTab === 'all') {
      return productsList.slice(0, 8);
    }
    if (activeTab === 'bestseller') {
      return productsList.filter((p) => p.bestseller).slice(0, 8);
    }
    return productsList.filter((p) => p.category === activeTab).slice(0, 8);
  };

  const displayedProducts = filterProducts();

  const handleViewAll = () => {
    setSelectedCategoryFilter('all');
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="customer-favorites-section" className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#8C7E6A]" />
              <span>Most Loved Pieces</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1A1A1A] tracking-tight">
              Customer Favorites
            </h2>
            <p className="text-sm text-[#555555] max-w-lg">
              Our most cherished home accents, designed with organic textures and timeless proportions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-widest uppercase whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-xs'
                  : 'bg-[#EFEBE1] text-[#555555] hover:bg-[#E5E0D5] hover:text-[#1A1A1A]'
              }`}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bestseller')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-widest uppercase whitespace-nowrap transition-all ${
                activeTab === 'bestseller'
                  ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-xs'
                  : 'bg-[#EFEBE1] text-[#555555] hover:bg-[#E5E0D5] hover:text-[#1A1A1A]'
              }`}
            >
              Top Bestsellers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('living-room')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-widest uppercase whitespace-nowrap transition-all ${
                activeTab === 'living-room'
                  ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-xs'
                  : 'bg-[#EFEBE1] text-[#555555] hover:bg-[#E5E0D5] hover:text-[#1A1A1A]'
              }`}
            >
              Living Accents
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lighting')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-widest uppercase whitespace-nowrap transition-all ${
                activeTab === 'lighting'
                  ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-xs'
                  : 'bg-[#EFEBE1] text-[#555555] hover:bg-[#E5E0D5] hover:text-[#1A1A1A]'
              }`}
            >
              Lighting
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wall-decor')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-widest uppercase whitespace-nowrap transition-all ${
                activeTab === 'wall-decor'
                  ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-xs'
                  : 'bg-[#EFEBE1] text-[#555555] hover:bg-[#E5E0D5] hover:text-[#1A1A1A]'
              }`}
            >
              Wall Decor
            </button>
          </div>

        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-10 sm:mt-14 text-center">
          <button
            type="button"
            id="view-all-favorites-btn"
            onClick={handleViewAll}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-200 shadow-md group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
