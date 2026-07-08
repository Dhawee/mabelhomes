import {
  Home,
  TrendingUp,
  BarChart3,
  Megaphone,
  FileText,
  Search,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { SERVICES } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home,
  TrendingUp,
  BarChart3,
  Megaphone,
  FileText,
  Search,
  Building2,
};

export default function Services() {
  return (
    <section id="services" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">Our Services</p>
          <h2 className="section-heading">Comprehensive Real Estate Solutions</h2>
        </FadeIn>

        <div className="space-y-6">
          {SERVICES.map((service, i) => {
            const Icon = iconMap[service.icon] || Home;
            const isEven = i % 2 === 0;

            return (
              <FadeIn key={service.id} delay={i * 0.1}>
                <div
                  className={`luxury-card flex flex-col ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  } items-center gap-8 p-8 md:p-10 hover:shadow-luxury-lg transition-all duration-500`}
                >
                  <div className="w-24 h-24 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0">
                    <Icon size={36} className="text-gold" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-heading text-2xl text-navy dark:text-white mb-3">
                      {service.title}
                    </h3>
                    <p className="text-navy/60 dark:text-white/60 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-gold font-semibold text-sm hover:text-gold-light transition-colors"
                    >
                      Learn More →
                    </Link>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
