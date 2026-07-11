import {
  Compass,
  Key,
  LineChart,
  Shield,
  Handshake,
  HeartHandshake,
} from "lucide-react";
import { WHY_CHOOSE, STATS } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";
import Counter from "@/components/ui/Counter";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Compass,
  Key,
  LineChart,
  Shield,
  Handshake,
  HeartHandshake,
};

export default function WhyChoose() {
  return (
    <section className="section-padding bg-soft border-b border-gray-100 dark:bg-navy/20 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">Why Choose Us</p>
          <h2 className="section-heading">Excellence in Every Transaction</h2>
        </FadeIn>

        {/* Why Choose Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE.map((item, i) => {
            const Icon = iconMap[item.icon] || Compass;
            return (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="luxury-card p-8 group hover:shadow-luxury-lg hover:-translate-y-2 transition-all duration-500 bg-white dark:bg-navy/40">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                    <Icon size={24} className="text-gold" />
                  </div>
                  <h3 className="font-heading text-xl text-navy dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-navy/60 dark:text-white/60 leading-relaxed font-body">
                    {item.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Integrated Stats Row */}
        <div className="mt-16 pt-16 border-t border-gray-200 dark:border-white/5">
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
                  <p className="text-xs text-navy/60 dark:text-white/60 uppercase tracking-wider font-heading">
                    {stat.label}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
