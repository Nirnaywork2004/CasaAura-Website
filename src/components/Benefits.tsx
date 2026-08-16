import React from 'react';
import { Award, Feather, RefreshCw, ShieldCheck } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      id: 'benefit-quality',
      icon: Award,
      title: 'Premium Quality',
      description: 'Carefully selected natural materials and hand-finished craftsmanship.',
    },
    {
      id: 'benefit-design',
      icon: Feather,
      title: 'Thoughtful Design',
      description: 'Clean organic silhouettes designed for peaceful, modern Indian homes.',
    },
    {
      id: 'benefit-returns',
      icon: RefreshCw,
      title: 'Easy Returns',
      description: 'Hassle-free 7-day doorstep pickup and instant refund guarantee.',
    },
    {
      id: 'benefit-secure',
      icon: ShieldCheck,
      title: 'Secure Payments',
      description: '100% encrypted checkout with UPI, Credit/Debit cards & NetBanking.',
    },
  ];

  return (
    <section id="benefits-section" className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-[#EFEBE1] p-6 sm:p-8 rounded-2xl border border-[#E5E1D8] shadow-xs">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                id={item.id}
                className="flex items-start gap-4 group"
              >
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#1A1A1A] border border-[#E5E1D8] shrink-0 group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors duration-300 shadow-2xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-[#1A1A1A] tracking-widest uppercase font-sans">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
