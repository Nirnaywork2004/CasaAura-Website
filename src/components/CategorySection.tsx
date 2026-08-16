import React from 'react';
import { categories } from '../data/categories';
import { useCartWishlist } from '../context/CartWishlistContext';
import { ArrowUpRight } from 'lucide-react';

export const CategorySection: React.FC = () => {
  const { setCurrentPage, setSelectedCategoryFilter } = useCartWishlist();

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategoryFilter(categorySlug);
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      id="category-section" 
      className="py-12 sm:py-16 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-14">
          <p className="text-[11px] font-bold tracking-widest text-[#8C7E6A] uppercase">
            Shop by Style & Room
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1A1A1A] font-semibold tracking-tight">
            Find Your Style
          </h2>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            Explore collections designed to bring personality, tranquility, and natural warmth to every room in your sanctuary.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              id={`category-card-${category.slug}`}
              onClick={() => handleCategoryClick(category.slug)}
              className="group cursor-pointer flex flex-col rounded-2xl bg-white overflow-hidden border border-[#E5E1D8] hover:border-[#1A1A1A] transition-all duration-300 hover:shadow-md"
            >
              {/* Category Image with Zoom on Hover */}
              <div className="relative aspect-4/3 sm:aspect-square overflow-hidden bg-[#EFEBE1]">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider bg-white/95 backdrop-blur-xs text-[#1A1A1A] px-2.5 py-1 rounded-full border border-[#E5E1D8] shadow-2xs">
                  {category.itemCount} items
                </span>
              </div>

              {/* Category Info */}
              <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-2">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1A1A1A] group-hover:text-[#8C7E6A] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-[#555555] line-clamp-2 mt-1 leading-relaxed hidden sm:block">
                    {category.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold tracking-widest uppercase text-[#1A1A1A] group-hover:text-[#8C7E6A] transition-colors">
                  <span>Explore</span>
                  <div className="w-6 h-6 rounded-full bg-[#EFEBE1] group-hover:bg-[#1A1A1A] group-hover:text-white flex items-center justify-center transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
