import React from 'react';
import { testimonials } from '../data/testimonials';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials-section" className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-14">
          <p className="text-[11px] font-bold tracking-widest text-[#8C7E6A] uppercase">
            What Our Customers Say
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1A1A1A] font-semibold tracking-tight">
            Made for Homes People Love
          </h2>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            Real stories and reflections from homeowners, architects, and design enthusiasts across the country.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              id={`testimonial-${item.id}`}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-[#E5E1D8] shadow-xs hover:border-[#1A1A1A] transition-all duration-300 space-y-4"
            >
              <div className="space-y-3">
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#8C7E6A] text-[#8C7E6A]" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-[#E5E1D8]" />
                </div>

                <h4 className="font-serif text-base font-semibold text-[#1A1A1A]">
                  "{item.title}"
                </h4>

                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                  "{item.comment}"
                </p>
              </div>

              {/* Author and Verified Product Info */}
              <div className="pt-4 border-t border-[#E5E1D8] flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E5E1D8]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-[#1A1A1A] truncate">{item.name}</p>
                    <CheckCircle2 className="w-3 h-3 text-[#8C7E6A] shrink-0" title="Verified Customer" />
                  </div>
                  <p className="text-[11px] text-[#888888] truncate">{item.location} &bull; <span className="text-[#8C7E6A]">{item.productName}</span></p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
