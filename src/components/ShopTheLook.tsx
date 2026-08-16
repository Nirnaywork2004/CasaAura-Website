import React, { useState } from 'react';
import { products } from '../data/products';
import { useCartWishlist } from '../context/CartWishlistContext';
import { Plus, ShoppingBag, Eye, Sparkles } from 'lucide-react';

export const ShopTheLook: React.FC = () => {
  const { addToCart, setActiveModalProduct, formatPrice } = useCartWishlist();
  const [activePin, setActivePin] = useState<string | null>('casa-01');

  // Hotspot items
  const hotspots = [
    {
      id: 'pin-vase',
      productId: 'casa-01',
      x: '38%',
      y: '58%',
      label: 'Sculptural Sandstone Vase',
    },
    {
      id: 'pin-cushion',
      productId: 'casa-02',
      x: '68%',
      y: '52%',
      label: 'Textured Slub Linen Cushion',
    },
    {
      id: 'pin-lamp',
      productId: 'casa-03',
      x: '20%',
      y: '35%',
      label: 'Fluted Ceramic Lamp',
    },
    {
      id: 'pin-rug',
      productId: 'casa-07',
      x: '52%',
      y: '80%',
      label: 'Hand-Tufted Wool & Jute Rug',
    },
  ];

  return (
    <section id="shop-the-look-section" className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8C7E6A] uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#8C7E6A]" />
            <span>Interactive Room Styling</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1A1A1A] tracking-tight">
            Shop The Living Room Look
          </h2>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            Click on any highlighted marker to discover how each curated piece works harmoniously together in real homes.
          </p>
        </div>

        {/* Interactive Hotspot Room Container */}
        <div className="relative rounded-3xl overflow-hidden bg-[#EFEBE1] border border-[#E5E1D8] shadow-sm">
          
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85"
            alt="Warm modern styled living room lookbook"
            className="w-full h-[450px] sm:h-[550px] lg:h-[620px] object-cover object-center"
          />

          {/* Darker subtle gradient for marker legibility */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />

          {/* Interactive Hotspot Pins */}
          {hotspots.map((pin) => {
            const product = products.find((p) => p.id === pin.productId);
            if (!product) return null;
            const isSelected = activePin === pin.productId;

            return (
              <div
                key={pin.id}
                style={{ left: pin.x, top: pin.y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              >
                {/* Pulsing Pin Marker */}
                <button
                  type="button"
                  id={`hotspot-${pin.id}`}
                  onClick={() => setActivePin(isSelected ? null : pin.productId)}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white scale-110'
                      : 'bg-white/95 hover:bg-white text-[#1A1A1A] backdrop-blur-md'
                  }`}
                  aria-label={`View ${pin.label}`}
                >
                  <Plus className={`w-4 h-4 transition-transform duration-300 ${isSelected ? 'rotate-45' : ''}`} />
                  <span className="absolute inset-0 rounded-full bg-white/40 animate-ping pointer-events-none -z-10" />
                </button>

                {/* Popover Card */}
                {isSelected && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-white/98 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#E5E1D8] z-30 animate-fade-in text-left">
                    <div className="flex gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E5E1D8]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-[#8C7E6A]">
                          {product.category.replace('-', ' ')}
                        </p>
                        <h4 className="text-xs font-semibold text-[#1A1A1A] line-clamp-1 font-serif">
                          {product.name}
                        </h4>
                        <p className="text-xs font-bold text-[#1A1A1A] mt-1">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#E5E1D8]">
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1, undefined, true)}
                        className="flex-1 py-1.5 px-2 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] text-[11px] font-semibold tracking-wider uppercase rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModalProduct(product)}
                        className="p-1.5 bg-[#EFEBE1] hover:bg-[#E5E0D5] text-[#1A1A1A] rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};
