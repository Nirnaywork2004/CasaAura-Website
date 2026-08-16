import React from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCartWishlist();

  return (
    <div 
      id="toast-container" 
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-start gap-3 p-4 bg-[#141414] text-[#F9F7F2] rounded-xl shadow-2xl border border-[#2E2E2E] backdrop-blur-md"
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-[#C5A880]" />
                ) : isWarning ? (
                  <AlertCircle className="w-5 h-5 text-[#8C7E6A]" />
                ) : (
                  <Info className="w-5 h-5 text-[#C5A880]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold tracking-wide text-[#F9F7F2]">{toast.title}</p>
                <p className="text-xs text-[#A0A0A0] mt-0.5 leading-relaxed">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-[#888888] hover:text-white transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
