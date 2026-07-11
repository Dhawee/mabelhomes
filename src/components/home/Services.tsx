import {
  Home,
  TrendingUp,
  BarChart3,
  Megaphone,
  FileText,
  Search,
  Building2,
  Key
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
  Key
};

export default function Services() {
  return (
    <section id="services" className="section-padding bg-soft/30 dark:bg-navy/10 border-b border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">Our Services</p>
          <h2 className="section-heading">Comprehensive Real Estate Solutions</h2>
        </FadeIn>

        {/* Services Grid (Block Row Design) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => {
            const Icon = iconMap[service.icon] || Home;

            return (
              <FadeIn key={service.id} delay={i * 0.06} className="h-full">
                <div className="luxury-card p-6 h-full flex flex-col justify-between hover:shadow-luxury-lg hover:-translate-y-1.5 transition-all duration-500 bg-white dark:bg-navy/40 group border border-gray-100/50 dark:border-white/5 hover:border-gold/30">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                      <Icon size={22} className="text-gold" />
                    </div>
                    <h3 className="font-heading text-lg md:text-xl text-navy dark:text-white mb-3 group-hover:text-gold transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-xs md:text-sm text-navy/60 dark:text-white/60 leading-relaxed font-body mb-6">
                      {service.description}
                    </p>
                  </div>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-gold font-semibold text-xs tracking-wider uppercase hover:text-gold-light transition-colors inline-flex items-center gap-1.5 font-heading"
                  >
                    Learn More <span>→</span>
                  </Link>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
