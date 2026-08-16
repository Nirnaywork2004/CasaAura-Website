import React, { useState, useEffect, useRef } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { Search, X, Star, ShoppingBag, Tag } from 'lucide-react';
import { motion } from 'motion/react';

export const SearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    setActiveModalProduct, 
    formatPrice, 
    addToCart,
    productsList
  } = useCartWishlist();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const filteredProducts = query.trim()
    ? productsList.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.material.toLowerCase().includes(q) ||
          item.tagline.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      })
    : [];

  const suggestions = [
    'Sculptural Ceramic Vase',
    'Slub Linen Cushion',
    'Table Lamp',
    'Brass Mirror',
    'Areca Palm Plant',
    'Travertine Tray',
    'Wool Rug',
  ];

  if (!isSearchOpen) return null;

  return (
    <div id="search-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsSearchOpen(false)}
        className="fixed inset-0 bg-[#1E1C1A]/70 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        className="relative max-w-2xl mx-auto bg-[#F9F7F2] rounded-3xl shadow-2xl border border-[#E5E1D8] overflow-hidden z-10"
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E1D8] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8C7E6A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="search-main-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ceramics, lighting, cushions, rugs, mirrors..."
            className="flex-1 bg-transparent text-[#1A1A1A] placeholder-[#888888] text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[#666666] hover:text-[#1A1A1A] text-xs font-semibold"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-xl hover:bg-[#EFEBE1] text-[#555555]"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Content */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* If no query, show popular search suggestions */}
          {!query.trim() && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#8C7E6A]" />
                  Popular Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setQuery(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#EFEBE1] hover:bg-[#E5E1D8] text-[#1A1A1A] text-xs font-medium transition-colors border border-[#E5E1D8]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Items Showcase */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest mb-3">
                  Trending Now
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {productsList.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setActiveModalProduct(product);
                      }}
                      className="cursor-pointer group p-2.5 rounded-xl bg-white hover:bg-[#EFEBE1] transition-colors border border-[#E5E1D8]"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full aspect-square rounded-lg object-cover mb-2 bg-[#EFEBE1]"
                      />
                      <p className="text-xs font-semibold text-[#1A1A1A] truncate">{product.name}</p>
                      <p className="text-xs text-[#1A1A1A] font-bold">{formatPrice(product.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* If query has results */}
          {query.trim() && filteredProducts.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">
                Found {filteredProducts.length} matching {filteredProducts.length === 1 ? 'item' : 'items'}
              </p>

              <div className="divide-y divide-[#E5E1D8]">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="py-3 flex items-center justify-between gap-4 group cursor-pointer hover:bg-[#EFEBE1] px-3 rounded-xl transition-colors"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setActiveModalProduct(product);
                    }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover bg-[#EFEBE1] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-[#8C7E6A] tracking-wider">
                          {product.category.replace('-', ' ')}
                        </p>
                        <h4 className="text-sm font-semibold text-[#1A1A1A] truncate font-serif">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-[#1A1A1A]">
                            {formatPrice(product.price)}
                          </span>
                          <div className="flex items-center gap-0.5 text-[10px] text-[#C5A880]">
                            <Star className="w-3 h-3 fill-[#C5A880]" />
                            <span className="text-[#1A1A1A] font-semibold">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1, undefined, true);
                        setIsSearchOpen(false);
                      }}
                      className="p-2 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs shrink-0 transition-colors shadow-2xs"
                      title="Add to cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty search state */}
          {query.trim() && filteredProducts.length === 0 && (
            <div className="text-center py-10 space-y-3">
              <p className="font-serif text-lg text-[#1A1A1A]">No pieces found for "{query}"</p>
              <p className="text-xs text-[#666666] max-w-sm mx-auto">
                Try searching for ceramic vases, table lamps, slub cushions, or brass mirrors.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-5 py-2.5 bg-[#1A1A1A] text-[#F9F7F2] rounded-xl text-xs font-semibold hover:bg-black uppercase tracking-widest"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
