import Image from "next/image";
import { SITE } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";

const galleryImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",
];

export default function Company() {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">Our Company</p>
          <h2 className="section-heading">{SITE.company}</h2>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "Mission",
              text: "To provide exceptional real estate services that empower clients to make confident property decisions and build lasting wealth through strategic investments.",
            },
            {
              title: "Vision",
              text: "To be Nigeria's most trusted and respected real estate brokerage, setting the standard for professionalism, integrity, and client satisfaction.",
            },
            {
              title: "Values",
              text: "Integrity, transparency, excellence, and client-centric service guide every interaction and transaction we undertake.",
            },
          ].map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.15}>
              <div className="luxury-card p-8 h-full hover:shadow-luxury-lg transition-all duration-500">
                <h3 className="font-heading text-2xl text-gold mb-4">{item.title}</h3>
                <p className="text-navy/60 dark:text-white/60 leading-relaxed">
                  {item.text}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((src, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="relative aspect-square rounded-xl overflow-hidden group">
                <Image
                  src={src}
                  alt={`${SITE.company} gallery ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
