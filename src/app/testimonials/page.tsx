import Image from "next/image";
import { Star } from "lucide-react";
import { TESTIMONIALS, SITE } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials",
  description: `Client reviews and testimonials for ${SITE.name}.`,
};

export default function TestimonialsPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">Reviews</p>
          <h1 className="section-heading">Client Testimonials</h1>
          <p className="text-navy/60 dark:text-white/60 mt-4 max-w-2xl mx-auto">
            Hear from clients who have trusted us with their real estate journey.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.id} delay={i * 0.1}>
              <div className="luxury-card p-8 h-full hover:shadow-luxury-lg transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={16} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-navy/70 dark:text-white/70 leading-relaxed italic mb-6">
                  &ldquo;{t.review}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image src={t.image} alt={t.name} width={48} height={48} className="object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy dark:text-white">{t.name}</p>
                    <p className="text-sm text-navy/50 dark:text-white/50">{t.location}</p>
                    <p className="text-xs text-gold mt-0.5">{t.service}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
