import React from 'react';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { useCartWishlist } from '../context/CartWishlistContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { 
    wishlist, 
    addToCart, 
    setCurrentPage, 
    setSelectedCategoryFilter,
    addToast 
  } = useCartWishlist();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveAllToCart = () => {
    savedProducts.forEach((p) => {
      addToCart(p, 1, undefined, false);
    });
    addToast('success', 'Moved to Bag', `${savedProducts.length} saved pieces added to your shopping bag!`);
  };

  return (
    <div id="wishlist-page-container" className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-[#E5E1D8] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">
              <Heart className="w-3.5 h-3.5 fill-[#8C7E6A] text-[#8C7E6A]" />
              <span>Saved Favorites</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A] tracking-tight">
              My Wishlist ({savedProducts.length})
            </h1>
            <p className="text-xs sm:text-sm text-[#555555]">
              Pieces you have earmarked for your home aesthetic.
            </p>
          </div>

          {savedProducts.length > 0 && (
            <button
              type="button"
              id="wishlist-move-all-btn"
              onClick={handleMoveAllToCart}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Move All to Bag</span>
            </button>
          )}
        </div>

        {/* Wishlist Items Grid or Empty State */}
        {savedProducts.length === 0 ? (
          <div className="p-12 sm:p-16 text-center bg-[#EFEBE1] rounded-3xl border border-[#E5E1D8] max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#8C7E6A] mx-auto border border-[#E5E1D8]">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                Your wishlist is empty
              </h3>
              <p className="text-xs text-[#666666] max-w-xs mx-auto">
                Explore our handcrafted ceramics, lighting, and textiles, and tap the heart icon on any piece to save it here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryFilter('all');
                setCurrentPage('shop');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs font-semibold uppercase tracking-widest shadow-xs"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
