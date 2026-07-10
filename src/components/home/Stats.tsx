import { STATS } from "@/data/site";
import Counter from "@/components/ui/Counter";
import FadeIn from "@/components/ui/FadeIn";

export default function Stats() {
  return (
    <section className="bg-soft border-b border-gray-100 dark:bg-navy/30 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="font-heading text-4xl md:text-5xl text-navy dark:text-white font-light mb-2">
                  <Counter
                    end={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                </p>
                <p className="text-sm text-navy/60 dark:text-white/60 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
