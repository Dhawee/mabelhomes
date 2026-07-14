import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Home,
  TrendingUp,
  BarChart3,
  Megaphone,
  FileText,
  Search,
  Building2,
  Check,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { SITE } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";
import type { Metadata } from "next";
import { API_BASE_URL } from "@/config";
import { Service } from "@/types";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home,
  TrendingUp,
  BarChart3,
  Megaphone,
  FileText,
  Search,
  Building2,
};

interface Props {
  params: Promise<{ slug: string }>;
}

async function getService(slug: string): Promise<Service | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/services/${slug}/`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch service detail:", err);
    return null;
  }
}

async function getOtherServices(slug: string): Promise<Service[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/services/`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const list = await res.json();
    return list.filter((s: Service) => s.slug !== slug);
  } catch (err) {
    console.error("Failed to fetch other services:", err);
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/services/`);
    if (!res.ok) return [];
    const list = await res.json();
    return list.map((s: any) => ({ slug: s.slug }));
  } catch (err) {
    console.error("Failed to generate services static params:", err);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service Not Found" };
  return { title: service.title, description: service.description };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const Icon = iconMap[service.icon] || Home;
  const otherServices = await getOtherServices(slug);

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-navy text-navy dark:text-white">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Back Button */}
        <FadeIn className="mb-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-navy/60 dark:text-white/60 hover:text-gold transition-colors"
          >
            <ArrowLeft size={16} /> Back to Services
          </Link>
        </FadeIn>

        {/* Hero Details */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-white/5">
            <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center shrink-0">
              <Icon size={40} className="text-gold" />
            </div>
            <div>
              <p className="section-subheading !mb-1">Our Expertise</p>
              <h1 className="font-heading text-4xl md:text-5xl font-light text-navy dark:text-white">{service.title}</h1>
            </div>
          </div>
        </FadeIn>

        {/* Detailed Description */}
        <FadeIn delay={0.1}>
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg md:text-xl text-navy/70 dark:text-white/70 leading-relaxed font-light">
              {service.longDescription || service.description}
            </p>
          </div>
        </FadeIn>

        {/* Key Benefits */}
        {service.benefits && service.benefits.length > 0 && (
          <FadeIn delay={0.2} className="mb-12">
            <h2 className="font-heading text-2xl text-navy dark:text-white mb-6 font-normal">
              Key Value & Deliverables
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {service.benefits.map((benefit, i) => (
                <div key={i} className="luxury-card p-5 hover:shadow-luxury transition-all flex items-start gap-4 bg-soft/40 dark:bg-navy/20 border border-gray-100/50 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={16} className="text-gold" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy dark:text-white text-sm md:text-base">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* What's Included list (original feature checklist) */}
        <FadeIn delay={0.25} className="mb-12">
          <div className="luxury-card p-8 bg-soft/20 dark:bg-navy/30 border border-gray-100 dark:border-white/5">
            <h3 className="font-heading text-xl text-navy dark:text-white mb-6">
              Included Deliverables
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {service.features.map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-navy/70 dark:text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Delivery Process Timeline */}
        {service.process && service.process.length > 0 && (
          <FadeIn delay={0.3} className="mb-16">
            <h2 className="font-heading text-2xl text-navy dark:text-white mb-8 font-normal">
              Our Process Lifecycle
            </h2>
            <div className="relative pl-6 border-l border-gold/30 space-y-8 ml-3">
              {service.process.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline point */}
                  <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-white dark:bg-navy border-2 border-gold flex items-center justify-center text-[10px] font-bold text-gold group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-navy dark:text-white font-medium mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-navy/60 dark:text-white/60 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Call to Action */}
        <FadeIn delay={0.35} className="text-center mb-20">
          <div className="luxury-card p-8 md:p-12 bg-soft/30 dark:bg-navy/40 border border-gray-100 dark:border-white/5">
            <h3 className="font-heading text-2xl md:text-3xl text-navy dark:text-white mb-4 font-light">
              Ready to Discuss Your Objectives?
            </h3>
            <p className="text-sm md:text-base text-navy/60 dark:text-white/60 mb-8 max-w-lg mx-auto">
              Schedule a private consultation with Aluko Olajumoke .O to receive tailored guidance for your property endeavors.
            </p>
            <Link href="/contact" className="btn-gold">
              <Calendar size={18} /> Book a Consultation
            </Link>
          </div>
        </FadeIn>

        {/* Other Services */}
        <FadeIn delay={0.4} className="overflow-hidden">
          <h2 className="font-heading text-2xl text-navy dark:text-white mb-6 font-normal">
            Explore Other Services
          </h2>
          <div className="relative w-full overflow-hidden mask-fade py-2">
            <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max select-none">
              {[...otherServices, ...otherServices].map((s, idx) => {
                const SIcon = iconMap[s.icon] || Home;
                return (
                  <Link
                    key={`${s.id}-${idx}`}
                    href={`/services/${s.slug}`}
                    className="luxury-card p-6 hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-500 group bg-white dark:bg-navy/50 border border-gray-100 dark:border-white/5 w-[280px] shrink-0 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors shrink-0">
                        <SIcon size={20} className="text-gold" />
                      </div>
                      <h3 className="font-heading text-base md:text-lg text-navy dark:text-white group-hover:text-gold transition-colors font-medium mb-2 whitespace-normal line-clamp-1">
                        {s.title}
                      </h3>
                      <p className="text-xs text-navy/55 dark:text-white/55 leading-relaxed line-clamp-3 whitespace-normal">
                        {s.description}
                      </p>
                    </div>
                    <div className="mt-4 text-gold text-xs font-semibold uppercase tracking-wider font-heading">
                      Learn More &rarr;
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
