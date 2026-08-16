import React, { useState, useMemo } from 'react';
import { categories } from '../data/categories';
import { ProductCard } from '../components/ProductCard';
import { useCartWishlist } from '../context/CartWishlistContext';
import { 
  SlidersHorizontal, 
  X, 
  Check, 
  RotateCcw, 
  Search, 
  Star,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { 
    productsList,
    isLoadingProducts,
    productsError,
    fetchProducts,
    selectedCategoryFilter, 
    setSelectedCategoryFilter,
    formatPrice 
  } = useCartWishlist();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(4000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'newest'>('featured');

  const materials = [
    'all',
    'Ceramic',
    'Linen',
    'Brass',
    'Wood',
    'Wool',
    'Travertine',
  ];

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((p) => {
        // Category filter
        if (selectedCategoryFilter === 'bestseller' && !p.bestseller) return false;
        if (selectedCategoryFilter === 'new' && !p.newArrival) return false;
        if (selectedCategoryFilter !== 'all' && selectedCategoryFilter !== 'bestseller' && selectedCategoryFilter !== 'new' && p.category !== selectedCategoryFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = p.name.toLowerCase().includes(q) || 
                        p.tagline.toLowerCase().includes(q) ||
                        p.category.toLowerCase().includes(q) ||
                        p.material.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Price range
        if (p.price > maxPrice) return false;

        // Rating
        if (p.rating < minRating) return false;

        // In Stock
        if (inStockOnly && !p.inStock) return false;

        // Material
        if (selectedMaterial !== 'all') {
          if (!p.material.toLowerCase().includes(selectedMaterial.toLowerCase())) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating-desc') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
        return 0; // featured default
      });
  }, [productsList, selectedCategoryFilter, searchQuery, maxPrice, minRating, selectedMaterial, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategoryFilter('all');
    setSearchQuery('');
    setMaxPrice(4000);
    setMinRating(0);
    setSelectedMaterial('all');
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters = 
    selectedCategoryFilter !== 'all' || 
    searchQuery !== '' || 
    maxPrice < 4000 || 
    minRating > 0 || 
    selectedMaterial !== 'all' || 
    inStockOnly;

  return (
    <div id="shop-page-container" className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8 sm:mb-12">
          <p className="text-[11px] font-bold tracking-widest text-[#8C7E6A] uppercase">
            Curated Home Catalog
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-semibold tracking-tight">
            Shop All Collections
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            Everyday living elevated through slow design, authentic organic materials, and artisan craftsmanship.
          </p>
        </div>

        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#EFEBE1] border border-[#E5E1D8] mb-8">
          
          {/* Search bar inside shop */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="shop-search-filter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, ceramic, linen..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-[#1A1A1A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              id="shop-mobile-filter-btn"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs font-semibold text-[#1A1A1A]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#666666] hidden sm:inline">Sort by:</span>
              <select
                id="shop-sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#8C7E6A]"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="newest">New Arrivals First</option>
              </select>
            </div>
          </div>

        </div>

        {/* Active Filter Pills Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-[#EFEBE1] border border-[#E5E1D8]">
            <span className="text-xs font-medium text-[#555555]">Active filters:</span>

            {selectedCategoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E1D8] text-[#1A1A1A] text-xs font-semibold">
                <span>Category: {selectedCategoryFilter}</span>
                <button onClick={() => setSelectedCategoryFilter('all')}>
                  <X className="w-3 h-3 text-[#666666]" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E1D8] text-[#1A1A1A] text-xs font-semibold">
                <span>Query: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-3 h-3 text-[#666666]" />
                </button>
              </span>
            )}

            {maxPrice < 4000 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E1D8] text-[#1A1A1A] text-xs font-semibold">
                <span>Max {formatPrice(maxPrice)}</span>
                <button onClick={() => setMaxPrice(4000)}>
                  <X className="w-3 h-3 text-[#666666]" />
                </button>
              </span>
            )}

            {minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E1D8] text-[#1A1A1A] text-xs font-semibold">
                <span>{minRating}★ & Above</span>
                <button onClick={() => setMinRating(0)}>
                  <X className="w-3 h-3 text-[#666666]" />
                </button>
              </span>
            )}

            {selectedMaterial !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E1D8] text-[#1A1A1A] text-xs font-semibold">
                <span>Material: {selectedMaterial}</span>
                <button onClick={() => setSelectedMaterial('all')}>
                  <X className="w-3 h-3 text-[#666666]" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E1D8] text-[#1A1A1A] text-xs font-semibold">
                <span>In Stock Only</span>
                <button onClick={() => setInStockOnly(false)}>
                  <X className="w-3 h-3 text-[#666666]" />
                </button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-[#8C7E6A] hover:text-[#1A1A1A] hover:underline font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        )}

        {/* Main Shop Grid & Desktop Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-6 shadow-xs">
              
              <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
                <h3 className="font-serif text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#8C7E6A]" />
                  <span>Refine Collection</span>
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-[#8C7E6A] hover:text-[#1A1A1A] hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">
                  Category
                </p>
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      selectedCategoryFilter === 'all'
                        ? 'bg-[#EFEBE1] text-[#1A1A1A] font-bold'
                        : 'text-[#555555] hover:bg-[#F9F7F2]'
                    }`}
                  >
                    All Items ({productsList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('bestseller')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      selectedCategoryFilter === 'bestseller'
                        ? 'bg-[#EFEBE1] text-[#1A1A1A] font-bold'
                        : 'text-[#555555] hover:bg-[#F9F7F2]'
                    }`}
                  >
                    Best Sellers
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('new')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      selectedCategoryFilter === 'new'
                        ? 'bg-[#EFEBE1] text-[#1A1A1A] font-bold'
                        : 'text-[#555555] hover:bg-[#F9F7F2]'
                    }`}
                  >
                    New Arrivals
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                        selectedCategoryFilter === cat.slug
                          ? 'bg-[#EFEBE1] text-[#1A1A1A] font-bold'
                          : 'text-[#555555] hover:bg-[#F9F7F2]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-[#888888]">({productsList.filter(p => p.category === cat.slug).length})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2.5 pt-4 border-t border-[#E5E1D8]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">Price Range</span>
                  <span className="font-bold text-[#1A1A1A]">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="4000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#1A1A1A]"
                />
                <div className="flex justify-between text-[11px] text-[#888888]">
                  <span>₹400</span>
                  <span>₹4,000+</span>
                </div>
              </div>

              {/* Material Filter */}
              <div className="space-y-2.5 pt-4 border-t border-[#E5E1D8]">
                <p className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">
                  Material
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {materials.map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setSelectedMaterial(mat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedMaterial === mat
                          ? 'bg-[#1A1A1A] text-[#F9F7F2]'
                          : 'bg-[#EFEBE1] text-[#555555] hover:bg-[#E5E1D8]'
                      }`}
                    >
                      {mat === 'all' ? 'All' : mat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2.5 pt-4 border-t border-[#E5E1D8]">
                <p className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">
                  Customer Rating
                </p>
                <div className="space-y-1">
                  {[0, 4.7, 4.8, 4.9].map((ratingVal) => (
                    <button
                      key={ratingVal}
                      type="button"
                      onClick={() => setMinRating(ratingVal)}
                      className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-medium ${
                        minRating === ratingVal ? 'bg-[#EFEBE1] text-[#1A1A1A] font-bold' : 'text-[#555555] hover:bg-[#F9F7F2]'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {ratingVal === 0 ? (
                          <span>All Ratings</span>
                        ) : (
                          <>
                            <Star className="w-3 h-3 fill-[#C5A880] text-[#C5A880]" />
                            <span>{ratingVal} Stars & Above</span>
                          </>
                        )}
                      </div>
                      {minRating === ratingVal && <Check className="w-3.5 h-3.5 text-[#1A1A1A]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="pt-4 border-t border-[#E5E1D8]">
                <label className="flex items-center gap-2 text-xs font-medium text-[#1A1A1A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-[#1A1A1A] focus:ring-0 accent-[#1A1A1A]"
                  />
                  <span>Show only in-stock pieces</span>
                </label>
              </div>

            </div>
          </aside>

          {/* Product Grid Area (9 cols) */}
          <main className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between text-xs text-[#666666]">
              <span>
                {isLoadingProducts ? 'Loading collection...' : `Showing ${filteredProducts.length} curated ${filteredProducts.length === 1 ? 'item' : 'items'}`}
              </span>
              {isLoadingProducts && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8C7E6A]" />
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E1D8] space-y-4">
                <p className="font-serif text-xl text-[#1A1A1A]">No pieces found matching your criteria</p>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  Try adjusting or resetting your active price, category, or material filters to explore our full home catalog.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs font-semibold tracking-widest uppercase shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
            onClick={() => setMobileFilterOpen(false)} 
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#F9F7F2] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8]">
                <h3 className="font-serif text-lg font-semibold text-[#1A1A1A]">Filters</h3>
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#EFEBE1]"
                >
                  <X className="w-5 h-5 text-[#1A1A1A]" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">Category</p>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={`w-full text-left p-2 rounded-lg ${selectedCategoryFilter === 'all' ? 'bg-[#EFEBE1] text-[#1A1A1A] font-bold' : 'text-[#555555]'}`}
                  >
                    All Items
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategoryFilter(c.slug)}
                      className={`w-full text-left p-2 rounded-lg ${selectedCategoryFilter === c.slug ? 'bg-[#EFEBE1] text-[#1A1A1A] font-bold' : 'text-[#555555]'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">Max Price</span>
                  <span className="text-[#1A1A1A]">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="4000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#1A1A1A]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E1D8] flex gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 border border-[#E5E1D8] rounded-xl text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider flex-1 hover:bg-[#EFEBE1]"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs font-semibold uppercase tracking-wider flex-1"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
