import React, { useState, useEffect, useCallback } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { adminApi } from '../services/api';
import { ORDER_STAGES, STAGE_LABELS, normalizeOrder } from '../services/orderService';
import { Order, OrderStatus } from '../types';
import { 
  X, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Filter, 
  CheckCircle, 
  Clock, 
  Package, 
  Truck, 
  Home, 
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminOrdersModal: React.FC = () => {
  const { 
    isAdminModalOpen, 
    setIsAdminModalOpen, 
    formatPrice, 
    addToast,
    refreshOrders,
    navigateToTrackOrder
  } = useCartWishlist();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAdminOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      if (res.success && Array.isArray(res.data?.orders)) {
        setOrders(res.data.orders.map(normalizeOrder));
      }
    } catch (e) {
      console.warn('[Admin] Failed to load admin orders:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    if (isAdminModalOpen) {
      loadAdminOrders();
    }
  }, [isAdminModalOpen, loadAdminOrders]);

  if (!isAdminModalOpen) return null;

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await adminApi.updateOrderStatus(orderId, { status: newStatus });
      if (res.success && res.data?.order) {
        addToast('success', 'Status Updated', `Order ${orderId} is now ${STAGE_LABELS[newStatus]}`);
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? normalizeOrder(res.data.order) : o))
        );
        refreshOrders();
      } else {
        addToast('warning', 'Update Failed', res.error || 'Could not update status.');
      }
    } catch (err: any) {
      addToast('warning', 'Error', err.message || 'Status update failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'packed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div id="admin-orders-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsAdminModalOpen(false)}
        className="fixed inset-0 bg-[#1E1C1A]/70 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-[#F9F7F2] rounded-3xl shadow-2xl border border-[#E5E1D8] flex flex-col overflow-hidden z-10"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5E1D8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Admin Order Management</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#1A1A1A] text-white rounded">
                  Live DB
                </span>
              </div>
              <p className="text-xs text-[#666666]">
                Manage real MongoDB orders, advance stages & inspect customer shipments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAdminOrders}
              disabled={loading}
              className="p-2 rounded-xl border border-[#E5E1D8] hover:bg-[#EFEBE1] text-[#555555] transition-colors"
              title="Refresh database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(false)}
              className="p-2 rounded-xl text-[#555555] hover:bg-[#EFEBE1] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:px-6 bg-[#FAF8F5] border-b border-[#E5E1D8] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#8C7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, name, email or phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E1D8] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['all', ...ORDER_STAGES].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-white text-[#666666] hover:bg-[#EFEBE1] border border-[#E5E1D8]'
                }`}
              >
                {st === 'all' ? 'All Orders' : STAGE_LABELS[st as OrderStatus] || st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#8C7E6A] mx-auto" />
              <p className="text-xs text-[#666666]">Querying MongoDB database...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-white rounded-2xl border border-[#E5E1D8] p-8">
              <Package className="w-8 h-8 text-[#8C7E6A] mx-auto" />
              <p className="font-serif text-base text-[#1A1A1A] font-semibold">No Orders Found</p>
              <p className="text-xs text-[#666666]">No orders match your active filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-2xl border border-[#E5E1D8] p-4 sm:p-5 shadow-2xs hover:border-[#8C7E6A]/50 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EBE1]">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                        {order.orderId}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {STAGE_LABELS[order.orderStatus] || order.orderStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#666666]">
                      <span>{order.orderDate}</span>
                      <span className="font-bold text-[#1A1A1A]">{formatPrice(order.total)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdminModalOpen(false);
                          navigateToTrackOrder(order.orderId);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C7E6A] hover:text-[#1A1A1A] underline underline-offset-2"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Order Details & Customer */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#555555]">
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">Customer:</p>
                      <p>{order.shippingAddress.fullName || order.customer.fullName}</p>
                      <p className="text-[#888888]">{order.shippingAddress.phone || order.customer.phone}</p>
                      <p className="text-[#888888]">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-[#1A1A1A]">Items ({order.items.length}):</p>
                      <ul className="space-y-0.5 text-[#666666] truncate">
                        {order.items.map((it, idx) => (
                          <li key={idx} className="truncate">
                            {it.quantity} × {it.product?.name || 'Product'} ({it.selectedColor})
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-[#1A1A1A]">Tracking & Payment:</p>
                      <p className="font-mono text-[#8C7E6A]">{order.trackingNumber}</p>
                      <p>{order.paymentMethod} &bull; <strong className="text-emerald-700">{order.paymentStatus}</strong></p>
                    </div>
                  </div>

                  {/* Stage Advancement Action Bar */}
                  <div className="pt-2 border-t border-[#F0EBE1] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#8C7E6A] uppercase tracking-wider">
                      Update Stage:
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {ORDER_STAGES.map((st) => (
                        <button
                          key={st}
                          type="button"
                          disabled={updatingId === order.orderId || order.orderStatus === st}
                          onClick={() => handleUpdateStatus(order.orderId, st)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            order.orderStatus === st
                              ? 'bg-[#1A1A1A] text-white cursor-default'
                              : 'bg-[#EFEBE1] text-[#555555] hover:bg-[#E5E0D5] hover:text-[#1A1A1A]'
                          } disabled:opacity-50`}
                        >
                          {STAGE_LABELS[st]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
