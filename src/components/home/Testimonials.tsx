"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonial = TESTIMONIALS[current];

  return (
    <section id="testimonials" className="section-padding bg-navy-light text-white">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-gold uppercase tracking-[0.2em] text-sm font-semibold mb-4">
            Testimonials
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-white font-light">
            What Our Clients Say
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="relative max-w-3xl mx-auto">
            <Quote size={48} className="text-gold/20 absolute -top-4 -left-4" />

            <div className="bg-white/5 rounded-2xl p-8 md:p-12 border border-white/10 shadow-luxury">
              <div className="flex items-center gap-1 mb-6 justify-center">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-gold text-gold" />
                ))}
              </div>

              <p className="text-white/95 text-lg md:text-xl leading-relaxed text-center mb-8 font-light italic">
                &ldquo;{testimonial.review}&rdquo;
              </p>

              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
                  <span className="text-gold font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-white/50 text-sm">{testimonial.location}</p>
                  <p className="text-gold text-xs mt-0.5">{testimonial.service}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() =>
                  setCurrent(
                    (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
                  )
                }
                className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-gold hover:border-gold hover:text-white transition-all flex items-center justify-center"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === current ? "bg-gold w-6" : "bg-white/20"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrent((prev) => (prev + 1) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-gold hover:border-gold hover:text-white transition-all flex items-center justify-center"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
