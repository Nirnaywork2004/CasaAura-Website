import React from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { ProtectedView } from '../components/ProtectedView';
import { Order, OrderStatus } from '../types';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ExternalLink, 
  ShoppingBag, 
  Eye, 
  RotateCw,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { 
    orders, 
    formatPrice, 
    setCurrentPage, 
    navigateToTrackOrder, 
    setActiveOrderDetails,
    advanceOrderStatus 
  } = useCartWishlist();

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EFEBE1] text-[#1A1A1A] border border-[#D9D3C7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C7E6A]" />
            Order Confirmed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F5EFE6] text-[#8C7E6A] border border-[#E5DAC8]">
            <Clock className="w-3 h-3 text-[#8C7E6A]" />
            Processing
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EAE6DF] text-[#1A1A1A] border border-[#D5CFC5]">
            <Package className="w-3 h-3 text-[#1A1A1A]" />
            Packed
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#1A1A1A] text-[#F9F7F2]">
            <Truck className="w-3 h-3 text-[#C5A880] animate-bounce" />
            Shipped
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#8C7E6A] text-white">
            <Truck className="w-3 h-3 text-white" />
            Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#2D4A3E] text-[#E8F5E9] border border-[#1B352B]">
            <CheckCircle2 className="w-3 h-3 text-[#A5D6A7]" />
            Delivered
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedView
      title="Please log in to view your orders."
      subtitle="Sign in to view your active deliveries, real-time shipment updates, and download itemized receipts."
    >
      <div className="bg-[#FAF8F5] min-h-screen py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs & Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-[#777777] mb-2 uppercase tracking-widest font-medium">
            <button onClick={() => setCurrentPage('home')} className="hover:text-[#1A1A1A] transition-colors">Home</button>
            <ChevronRight className="w-3 h-3 text-[#8C7E6A]" />
            <span className="text-[#1A1A1A] font-semibold">My Orders</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E1D8] pb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C7E6A] block mb-1">
                Account & Purchases
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
                My Orders
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigateToTrackOrder()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E1D8] hover:border-[#1A1A1A] text-[#1A1A1A] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
              >
                <Truck className="w-4 h-4 text-[#8C7E6A]" />
                <span>Track By Order ID</span>
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-[#F9F7F2] border border-[#E5E1D8] rounded-3xl p-12 sm:p-16 text-center max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-[#EFEBE1] border border-[#E5E1D8] flex items-center justify-center mx-auto mb-5 text-[#8C7E6A]">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2">
              You haven't placed any orders yet.
            </h2>
            <p className="text-sm text-[#666666] max-w-md mx-auto mb-8 leading-relaxed">
              Explore our curated collections of artisanal home decor, ceramicware, organic textiles, and atmospheric lighting.
            </p>
            <button
              type="button"
              onClick={() => setCurrentPage('shop')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg"
            >
              <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
              <span>Start Shopping</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const totalItemsCount = order.items.reduce((acc, it) => acc + it.quantity, 0);

              return (
                <div 
                  key={order.orderId}
                  id={`order-card-${order.orderId}`}
                  className="bg-[#F9F7F2] border border-[#E5E1D8] rounded-3xl overflow-hidden shadow-xs hover:border-[#D5CFC5] transition-all"
                >
                  {/* Top Meta Bar */}
                  <div className="bg-[#EFEBE1]/80 px-6 py-4 border-b border-[#E5E1D8] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7E6A] block">
                          Order Placed
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-[#1A1A1A]">
                          {order.orderDate}
                        </span>
                      </div>

                      <div className="h-6 w-px bg-[#DCD6CA] hidden sm:block" />

                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7E6A] block">
                          Order Number
                        </span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-[#1A1A1A]">
                          {order.orderId}
                        </span>
                      </div>

                      <div className="h-6 w-px bg-[#DCD6CA] hidden sm:block" />

                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7E6A] block">
                          Payment Status
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          order.paymentStatus === 'Paid' 
                            ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]' 
                            : 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]'
                        }`}>
                          {order.paymentStatus} ({order.paymentMethod.split('/')[0].trim()})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </div>

                  {/* Order Details Body */}
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      
                      {/* Items Column */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div 
                              key={`${item.product.id}-${idx}`}
                              className="flex items-center gap-4 bg-white/70 p-3 rounded-2xl border border-[#EAE6DF]"
                            >
                              <img 
                                src={item.product.image} 
                                alt={item.product.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-[#E5E1D8] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif font-semibold text-sm sm:text-base text-[#1A1A1A] truncate">
                                  {item.product.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#666666]">
                                  {item.selectedColor && (
                                    <span className="bg-[#EFEBE1] px-2 py-0.5 rounded text-[11px] font-medium text-[#444444]">
                                      {item.selectedColor}
                                    </span>
                                  )}
                                  <span>Qty: <strong className="text-[#1A1A1A]">{item.quantity}</strong></span>
                                  <span>&bull;</span>
                                  <span className="font-semibold text-[#1A1A1A]">{formatPrice(item.price)} each</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery ETA info */}
                        <div className="flex items-center gap-2 text-xs text-[#555555] pt-1">
                          <Calendar className="w-4 h-4 text-[#8C7E6A] shrink-0" />
                          <span>
                            Estimated Delivery: <strong className="text-[#1A1A1A] font-semibold">{order.estimatedDelivery}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Summary & Actions Column */}
                      <div className="lg:col-span-5 lg:border-l lg:border-[#E5E1D8] lg:pl-6 space-y-4">
                        <div className="bg-white/80 rounded-2xl p-4 border border-[#EAE6DF] space-y-2 text-xs">
                          <div className="flex justify-between text-[#666666]">
                            <span>Items Total ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}):</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-[#8C7E6A] font-medium">
                              <span>Promotional Savings:</span>
                              <span>-{formatPrice(order.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-[#666666]">
                            <span>Express Shipping:</span>
                            <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
                          </div>
                          <div className="pt-2 border-t border-[#E5E1D8] flex justify-between font-bold text-sm text-[#1A1A1A]">
                            <span>Grand Total:</span>
                            <span className="font-serif text-base">{formatPrice(order.total)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
                          <button
                            type="button"
                            onClick={() => navigateToTrackOrder(order.orderId)}
                            className="w-full py-3 px-4 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xs transition-colors"
                          >
                            <Truck className="w-4 h-4 text-[#C5A880]" />
                            <span>Track Order</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveOrderDetails(order)}
                            className="w-full py-2.5 px-4 bg-white hover:bg-[#EFEBE1] text-[#1A1A1A] border border-[#E5E1D8] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#666666]" />
                            <span>View Details & Receipt</span>
                          </button>

                          {/* Quick simulation helper in demo mode */}
                          <button
                            type="button"
                            onClick={() => advanceOrderStatus(order.orderId)}
                            className="w-full py-1.5 px-3 bg-[#EFEBE1] hover:bg-[#E5E0D5] text-[#8C7E6A] rounded-lg text-[10px] font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5 border border-[#D5CFC5] transition-colors"
                            title="Simulate advancing to next stage for demonstration"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Simulate Next Stage ({order.orderStatus})</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
    </ProtectedView>
  );
};
