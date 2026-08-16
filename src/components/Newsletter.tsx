import React, { useState } from 'react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { Mail, Check, Sparkles, ArrowRight } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const { addToast } = useCartWishlist();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubscribed(true);
    addToast('success', 'Subscribed to Newsletter', 'Welcome to CasaAura! Enjoy 10% off with code CASA10.');
  };

  return (
    <section id="newsletter-section" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EFEBE1] rounded-3xl border border-[#E5E1D8] p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto shadow-xs relative overflow-hidden">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#1A1A1A] text-[11px] font-bold uppercase tracking-widest border border-[#E5E1D8]">
              <Sparkles className="w-3.5 h-3.5 text-[#8C7E6A]" />
              <span>Join The CasaAura Society</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1A1A1A] tracking-tight">
              Bring Inspiration Home
            </h2>

            <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
              Get interior styling guides, seasonal lookbooks, early access to new artisan arrivals, and an exclusive 10% off your first order.
            </p>

            {isSubscribed ? (
              <div className="p-6 bg-white rounded-2xl border border-[#8C7E6A] space-y-2 mt-6 animate-fade-in text-center shadow-xs">
                <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-5 h-5" />
                </div>
                <p className="font-serif text-lg font-semibold text-[#1A1A1A]">Thank you for joining us!</p>
                <p className="text-xs text-[#555555]">
                  Your welcome discount code is <strong className="font-bold text-[#1A1A1A] bg-[#EFEBE1] px-2 py-0.5 rounded border border-[#E5E1D8]">CASA10</strong>. Enter it during checkout for 10% off.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pt-4 max-w-md mx-auto space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="newsletter-email-input"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter your email address..."
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#8C7E6A] focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    id="newsletter-submit-btn"
                    className="px-6 py-3 bg-[#1A1A1A] hover:bg-black text-[#F9F7F2] rounded-xl text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-red-600 text-left pl-1">{error}</p>
                )}

                <p className="text-[11px] text-[#888888] text-center">
                  We respect your privacy. No spam, only mindful home inspirations. Unsubscribe anytime.
                </p>
              </form>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};
