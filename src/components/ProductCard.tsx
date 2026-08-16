import React, { useState } from 'react';
import { Product } from '../types';
import { useCartWishlist } from '../context/CartWishlistContext';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setActiveModalProduct, 
    formatPrice 
  } = useCartWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const isSaved = isInWishlist(product.id);
  const secondaryImage = product.images && product.images[1] ? product.images[1] : product.image;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col rounded-2xl bg-white border border-[#E5E1D8] hover:border-[#1A1A1A] transition-all duration-300 overflow-hidden hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#EFEBE1] cursor-pointer">
        
        {/* Main & Secondary Image Transition */}
        <img
          src={isHovered ? secondaryImage : product.image}
          alt={product.name}
          onClick={() => setActiveModalProduct(product)}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.bestseller && (
            <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 bg-[#1A1A1A] text-white rounded-md shadow-xs">
              Bestseller
            </span>
          )}
          {product.newArrival && !product.bestseller && (
            <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 bg-[#8C7E6A] text-white rounded-md shadow-xs">
              New Arrival
            </span>
          )}
          {product.discountPercent && (
            <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#EFEBE1] text-[#1A1A1A] rounded-md border border-[#E5E1D8]">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#1A1A1A] flex items-center justify-center backdrop-blur-xs shadow-xs hover:scale-110 active:scale-95 transition-all border border-[#E5E1D8]"
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isSaved ? 'fill-[#8C7E6A] text-[#8C7E6A]' : 'text-[#555555] hover:text-[#1A1A1A]'
            }`}
          />
        </button>

        {/* Quick View Hover Action Bar */}
        <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveModalProduct(product);
            }}
            className="flex-1 py-2 px-3 bg-white/95 hover:bg-white text-[#1A1A1A] text-[11px] uppercase tracking-widest font-semibold rounded-xl backdrop-blur-md shadow-md flex items-center justify-center gap-1.5 border border-[#E5E1D8] transition-all hover:scale-101"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>

      </div>

      {/* Product Details Info */}
      <div className="p-4 sm:p-4.5 flex flex-col flex-1 justify-between gap-3">
        
        <div className="space-y-1">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#888888]">
            <span className="uppercase tracking-widest text-[10px] font-semibold text-[#8C7E6A]">
              {product.category.replace('-', ' ')}
            </span>
            <div className="flex items-center gap-1 text-[#1A1A1A] font-semibold">
              <Star className="w-3 h-3 fill-[#8C7E6A] text-[#8C7E6A]" />
              <span className="text-[11px]">{product.rating}</span>
              <span className="text-[#888888] text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => setActiveModalProduct(product)}
            className="font-serif text-sm sm:text-base font-semibold text-[#1A1A1A] line-clamp-1 group-hover:text-[#8C7E6A] transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#666666] line-clamp-1">
            {product.tagline}
          </p>
        </div>

        {/* Price and Add-To-Cart Action */}
        <div className="pt-2 border-t border-[#E5E1D8] flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-[#1A1A1A]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#888888] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Quick Add To Cart Button */}
          <button
            type="button"
            id={`add-to-cart-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1, undefined, true);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1A1A1A] hover:bg-black active:scale-95 text-[#F9F7F2] flex items-center justify-center transition-all duration-200 shadow-xs hover:shadow"
            title="Add to Shopping Bag"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
