import Link from "next/link";
import {
  Home,
  TrendingUp,
  BarChart3,
  Megaphone,
  FileText,
  Search,
  Building2,
} from "lucide-react";
import { SERVICES, SITE } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: `Comprehensive real estate services by ${SITE.name} at ${SITE.company}.`,
};

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home,
  TrendingUp,
  BarChart3,
  Megaphone,
  FileText,
  Search,
  Building2,
};

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">What We Offer</p>
          <h1 className="section-heading">Our Services</h1>
          <p className="text-navy/60 dark:text-white/60 mt-4 max-w-2xl mx-auto">
            Comprehensive real estate solutions tailored to your unique needs.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, i) => {
            const Icon = iconMap[service.icon] || Home;
            return (
              <FadeIn key={service.id} delay={i * 0.1}>
                <Link
                  href={`/services/${service.slug}`}
                  className="luxury-card p-8 block group hover:shadow-luxury-lg hover:-translate-y-2 transition-all duration-500 h-full"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                    <Icon size={24} className="text-gold" />
                  </div>
                  <h2 className="font-heading text-xl text-navy dark:text-white mb-3 group-hover:text-gold transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-sm text-navy/60 dark:text-white/60 leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-navy/50 dark:text-white/50">
                        <div className="w-1 h-1 rounded-full bg-gold" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
