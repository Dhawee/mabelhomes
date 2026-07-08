import Image from "next/image";
import { WHY_INVEST } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";

export default function WhyInvest() {
  return (
    <section className="section-padding bg-white border-b border-gray-100 dark:bg-navy/20 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="left">
            <p className="section-subheading">Why Invest</p>
            <h2 className="section-heading mb-8">
              Build Wealth Through Real Estate
            </h2>
            <div className="space-y-6">
              {WHY_INVEST.map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.1}>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-gold mt-2.5 shrink-0" />
                    <div>
                      <h3 className="font-heading text-lg text-navy dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-navy/60 dark:text-white/60 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.2}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-luxury-lg">
              <Image
                src="https://images.unsplash.com/photo-1560520033-831a174cb1fa?w=800&q=80"
                alt="Real estate investment"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
