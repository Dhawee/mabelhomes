import Image from "next/image";
import { VALUES } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";

export default function About() {
  return (
    <section id="about" className="section-padding bg-white dark:bg-navy">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Visual Collage representing Properties and Shortlets */}
          <FadeIn direction="left">
            <div className="relative">
              <div className="relative w-full aspect-[4/3] sm:aspect-[4/5] rounded-2xl overflow-hidden shadow-luxury-lg border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-navy-dark">
                <Image
                  src="/images/home/About Our Firm_Big.jpg"
                  alt="Mabel Homes About Our Firm"
                  fill
                  className="object-contain sm:object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl overflow-hidden shadow-luxury-lg hidden md:block border-2 border-white dark:border-navy bg-gray-50 dark:bg-navy-dark">
                <Image
                  src="/images/home/About Our Firm_Small.jpg"
                  alt="Mabel Homes Premium Accommodation"
                  fill
                  className="object-contain sm:object-cover"
                  sizes="192px"
                />
              </div>
            </div>
          </FadeIn>

          {/* Company Text Content */}
          <FadeIn direction="right" delay={0.2}>
            <p className="section-subheading">About Our Firm</p>
            <h2 className="section-heading mb-6">
              Mabel Homes and Investment Limited
            </h2>
            <p className="text-navy/70 dark:text-white/70 leading-relaxed mb-6">
              Mabel Homes and Investment Limited is a premier property brokerage and real estate investment advisory firm. We specialize in luxury residential and commercial property listings, portfolio management, and premium short-let accommodations managed through our specialized subsidiary, <strong>Rosebowl Apartments</strong>.
            </p>
            <p className="text-navy/70 dark:text-white/70 leading-relaxed mb-10">
              Our firm is dedicated to providing legal safety, complete title verification, and building approvals for all acquisitions. We take pride in delivering maximum transparency, professional guidance, and strategic yields in Nigeria&apos;s growing property markets.
            </p>

            {/* Core Values */}
            <div className="grid grid-cols-2 gap-4">
              {VALUES.map((value, i) => (
                <FadeIn key={value.title} delay={0.3 + i * 0.1}>
                  <div className="luxury-card p-6 transition-all duration-500 hover:shadow-luxury-lg hover:-translate-y-1.5 border border-gray-100 dark:border-white/5 hover:border-gold/50 hover:bg-soft/40 dark:hover:bg-white/5 group">
                    <h3 className="font-heading text-lg text-navy dark:text-white mb-2 group-hover:text-gold transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-sm text-navy/60 dark:text-white/60 group-hover:text-navy/85 dark:group-hover:text-white/85 transition-colors duration-300">
                      {value.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
          
        </div>
      </div>
    </section>
  );
}
