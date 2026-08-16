import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { products } from '../data/products';
import { useCartWishlist } from '../context/CartWishlistContext';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  RefreshCw, 
  ShieldCheck, 
  Minus, 
  Plus, 
  Check, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductDetailsModal: React.FC = () => {
  const { 
    activeModalProduct, 
    setActiveModalProduct, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    formatPrice,
    setIsCheckoutOpen 
  } = useCartWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'care' | 'reviews'>('specs');

  useEffect(() => {
    if (activeModalProduct) {
      setSelectedImageIndex(0);
      setSelectedColor(activeModalProduct.colors[0]?.name || 'Natural');
      setQuantity(1);
      setActiveTab('specs');
    }
  }, [activeModalProduct]);

  if (!activeModalProduct) return null;

  const isSaved = isInWishlist(activeModalProduct.id);
  const galleryImages = activeModalProduct.images?.length > 0 
    ? activeModalProduct.images 
    : [activeModalProduct.image];

  // Related products
  const relatedProducts = products
    .filter((p) => p.category === activeModalProduct.category && p.id !== activeModalProduct.id)
    .slice(0, 3);

  const handleBuyNow = () => {
    addToCart(activeModalProduct, quantity, selectedColor, false);
    setActiveModalProduct(null);
    setIsCheckoutOpen(true);
  };

  return (
    <div id="product-details-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-10 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setActiveModalProduct(null)}
        className="fixed inset-0 bg-[#1E1C1A]/70 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative max-w-4xl w-full bg-[#F9F7F2] rounded-3xl shadow-2xl border border-[#E5E1D8] overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          type="button"
          id="product-modal-close-btn"
          onClick={() => setActiveModalProduct(null)}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] transition-colors shadow-md border border-[#E5E1D8]"
          aria-label="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Gallery Column (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Active Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#EFEBE1] border border-[#E5E1D8]">
                <img
                  src={galleryImages[selectedImageIndex] || activeModalProduct.image}
                  alt={activeModalProduct.name}
                  className="w-full h-full object-cover object-center"
                />

                {activeModalProduct.discountPercent && (
                  <span className="absolute top-4 left-4 text-xs uppercase font-bold tracking-widest px-3 py-1 bg-[#1A1A1A] text-white rounded-md shadow-xs">
                    {activeModalProduct.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails row */}
              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-[#1A1A1A] shadow-xs'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Purchase Column (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-[#8C7E6A]">
                    {activeModalProduct.category.replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#1A1A1A] font-semibold bg-[#EFEBE1] px-2.5 py-1 rounded-full border border-[#E5E1D8]">
                    <Star className="w-3.5 h-3.5 fill-[#C5A880] text-[#C5A880]" />
                    <span>{activeModalProduct.rating}</span>
                    <span className="text-[#666666]">({activeModalProduct.reviewsCount} reviews)</span>
                  </div>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A] tracking-tight">
                  {activeModalProduct.name}
                </h2>

                <p className="text-xs sm:text-sm text-[#555555]">
                  {activeModalProduct.tagline}
                </p>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 p-3.5 rounded-xl bg-[#EFEBE1] border border-[#E5E1D8]">
                <span className="text-2xl font-bold text-[#1A1A1A]">
                  {formatPrice(activeModalProduct.price)}
                </span>
                {activeModalProduct.originalPrice && (
                  <span className="text-sm text-[#888888] line-through">
                    {formatPrice(activeModalProduct.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-[#8C7E6A] font-semibold ml-auto">
                  Inclusive of taxes &bull; In Stock
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                {activeModalProduct.description}
              </p>

              {/* Color Variants */}
              {activeModalProduct.colors && activeModalProduct.colors.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">
                    Finish / Color: <span className="font-normal text-[#1A1A1A]">{selectedColor}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    {activeModalProduct.colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          selectedColor === color.name
                            ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-xs'
                            : 'border-[#E5E1D8] bg-white text-[#555555] hover:bg-[#EFEBE1]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-[#E5E1D8] bg-[#EFEBE1] rounded-xl px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 text-[#555555] hover:text-[#1A1A1A]"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs sm:text-sm font-semibold text-[#1A1A1A]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 text-[#555555] hover:text-[#1A1A1A]"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    type="button"
                    id="modal-add-to-cart-btn"
                    onClick={() => {
                      addToCart(activeModalProduct, quantity, selectedColor, true);
                      setActiveModalProduct(null);
                    }}
                    className="flex-1 py-3 px-4 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  {/* Wishlist button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(activeModalProduct)}
                    className="p-3 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#EFEBE1] text-[#1A1A1A] transition-colors"
                    aria-label="Save to Wishlist"
                  >
                    <Heart
                      className={`w-5 h-5 ${isSaved ? 'fill-[#8C7E6A] text-[#8C7E6A]' : 'text-[#555555]'}`}
                    />
                  </button>
                </div>

                {/* Instant Buy Now Button */}
                <button
                  type="button"
                  id="modal-buy-now-btn"
                  onClick={handleBuyNow}
                  className="w-full py-3 px-4 bg-[#2A2A2A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-xs border border-[#3A3A3A]"
                >
                  <span>Instant Buy Now</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </button>
              </div>

              {/* Delivery & Trust Highlights */}
              <div className="p-4 rounded-2xl bg-[#EFEBE1] border border-[#E5E1D8] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#555555]">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#8C7E6A] shrink-0" />
                  <span>Free Delivery on orders &gt; ₹999</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-[#8C7E6A] shrink-0" />
                  <span>Doorstep 7-Day Easy Returns</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#8C7E6A] shrink-0" />
                  <span>Artisan Certified & Secured</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#8C7E6A] shrink-0" />
                  <span>Eco-friendly Fragile Packaging</span>
                </div>
              </div>

            </div>

          </div>

          {/* Tabbed Info Section (Specifications, Care, Reviews) */}
          <div className="pt-6 border-t border-[#E5E1D8]">
            <div className="flex items-center gap-4 border-b border-[#E5E1D8] pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`text-xs sm:text-sm font-semibold pb-1 transition-colors relative ${
                  activeTab === 'specs' ? 'text-[#1A1A1A]' : 'text-[#666666] hover:text-[#1A1A1A]'
                }`}
              >
                Specifications & Dimensions
                {activeTab === 'specs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('care')}
                className={`text-xs sm:text-sm font-semibold pb-1 transition-colors relative ${
                  activeTab === 'care' ? 'text-[#1A1A1A]' : 'text-[#666666] hover:text-[#1A1A1A]'
                }`}
              >
                Care & Material Guide
                {activeTab === 'care' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`text-xs sm:text-sm font-semibold pb-1 transition-colors relative ${
                  activeTab === 'reviews' ? 'text-[#1A1A1A]' : 'text-[#666666] hover:text-[#1A1A1A]'
                }`}
              >
                Customer Reviews ({activeModalProduct.reviews.length})
                {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />}
              </button>
            </div>

            <div className="py-4">
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#555555]">
                  <div className="p-3 bg-white border border-[#E5E1D8] rounded-xl">
                    <p className="font-semibold text-[#1A1A1A]">Primary Material</p>
                    <p className="text-[#666666] mt-0.5">{activeModalProduct.material}</p>
                  </div>
                  <div className="p-3 bg-white border border-[#E5E1D8] rounded-xl">
                    <p className="font-semibold text-[#1A1A1A]">Dimensions</p>
                    <p className="text-[#666666] mt-0.5">{activeModalProduct.dimensions}</p>
                  </div>
                  {activeModalProduct.weight && (
                    <div className="p-3 bg-white border border-[#E5E1D8] rounded-xl">
                      <p className="font-semibold text-[#1A1A1A]">Weight</p>
                      <p className="text-[#666666] mt-0.5">{activeModalProduct.weight}</p>
                    </div>
                  )}
                  <div className="p-3 bg-white border border-[#E5E1D8] rounded-xl">
                    <p className="font-semibold text-[#1A1A1A]">Country of Origin</p>
                    <p className="text-[#666666] mt-0.5">India (Handcrafted)</p>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="space-y-2 text-xs text-[#555555]">
                  {activeModalProduct.careInstructions.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#1A1A1A] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  {activeModalProduct.reviews.map((r) => (
                    <div key={r.id} className="p-3.5 bg-white border border-[#E5E1D8] rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
                          <span>{r.author}</span>
                          {r.verified && (
                            <span className="text-[10px] bg-[#EFEBE1] text-[#1A1A1A] px-1.5 py-0.5 rounded font-normal border border-[#E5E1D8]">Verified Buyer</span>
                          )}
                        </div>
                        <div className="flex text-[#C5A880]">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-[#C5A880]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#555555]">{r.comment}</p>
                      <p className="text-[10px] text-[#888888]">{r.date} &bull; {r.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Products Recommendations */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-[#E5E1D8] space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#1A1A1A]">
                You May Also Like
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setActiveModalProduct(p)}
                    className="cursor-pointer group flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E5E1D8] hover:border-[#8C7E6A] transition-colors"
                  >
                    <img src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-[#EFEBE1]" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1A1A1A] truncate group-hover:text-[#8C7E6A]">
                        {p.name}
                      </p>
                      <p className="text-xs font-bold text-[#1A1A1A] mt-0.5">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
