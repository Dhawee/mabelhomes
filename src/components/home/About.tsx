import Image from "next/image";
import { VALUES } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";

export default function About() {
  return (
    <section id="about" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="left">
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-luxury-lg">
                <Image
                  src="/images/olajumoke-2.jpg"
                  alt="About Aluko Olajumoke"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl overflow-hidden shadow-luxury-lg hidden md:block">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80"
                  alt="Luxury property"
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.2}>
            <p className="section-subheading">About Me</p>
            <h2 className="section-heading mb-6">
              Meet Aluko Olajumoke O.
            </h2>
            <p className="text-navy/70 dark:text-white/70 leading-relaxed mb-6">
              Real Estate Broker and Consultant dedicated to helping individuals,
              families, and investors make confident real estate decisions.
            </p>
            <p className="text-navy/70 dark:text-white/70 leading-relaxed mb-10">
              Whether you&apos;re purchasing your first home, acquiring investment
              properties, or selling premium real estate, every transaction is
              handled with integrity, professionalism, and exceptional market knowledge.
            </p>

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
