import React from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { Lock, UserPlus, LogIn, Sparkles, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface ProtectedViewProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ProtectedView: React.FC<ProtectedViewProps> = ({
  title = 'Please log in to continue.',
  subtitle = 'Sign in to access your personal CasaAura dashboard, manage delivery addresses, and track real-time orders.',
  children,
}) => {
  const { isAuthenticated, setIsAuthModalOpen, setAuthModalMode } = useCartWishlist();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#F9F7F2] rounded-3xl border border-[#E5E1D8] p-8 sm:p-10 text-center shadow-lg space-y-6"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center shadow-md">
          <Lock className="w-6 h-6 text-[#C5A880]" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
          >
            <LogIn className="w-4 h-4 text-[#C5A880]" />
            <span>Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthModalMode('register');
              setIsAuthModalOpen(true);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-[#EFEBE1] text-[#1A1A1A] border border-[#E5E1D8] text-xs font-bold uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
          >
            <UserPlus className="w-4 h-4 text-[#8C7E6A]" />
            <span>Create Account</span>
          </button>
        </div>

        <div className="pt-4 border-t border-[#E5E1D8] flex items-center justify-center gap-2 text-[11px] text-[#8C7E6A]">
          <Shield className="w-3.5 h-3.5" />
          <span>Encrypted with bcrypt & JWT secure tokens</span>
        </div>
      </motion.div>
    </div>
  );
};
