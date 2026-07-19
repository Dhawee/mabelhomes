import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, Calendar, Phone, Mail, ArrowLeft } from "lucide-react";
import { SITE } from "@/data/site";
import { formatPrice, formatPriceFull } from "@/lib/utils";
import PropertyGallery from "@/components/properties/PropertyGallery";
import PropertyEnquiry from "@/components/properties/PropertyEnquiry";
import FadeIn from "@/components/ui/FadeIn";
import type { Metadata } from "next";
import { API_BASE_URL } from "@/config";
import { Property } from "@/types";
import BackButton from "@/components/properties/BackButton";
import SafeImage from "@/components/ui/SafeImage";
import { fetchHttp1 } from "@/lib/fetch";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width="16"
    height="16"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProperty(slug: string): Promise<Property | null> {
  try {
    return await fetchHttp1<Property>(`${API_BASE_URL}/api/properties/${slug}/`);
  } catch (err) {
    console.error("Failed to fetch property:", err);
    return null;
  }
}

async function getSimilarProperties(slug: string): Promise<Property[]> {
  try {
    return await fetchHttp1<Property[]>(`${API_BASE_URL}/api/properties/${slug}/similar/`);
  } catch (err) {
    console.error("Failed to fetch similar properties:", err);
    return [];
  }
}

const hasValue = (val: any) => {
  if (val === null || val === undefined || val === "") return false;
  if (val === 0 || val === "0" || val === 0.0) return false;
  if (typeof val === "string" && (val.toLowerCase() === "none" || val.toLowerCase() === "null")) return false;
  return true;
};


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: "Property Not Found" };
  return {
    title: property.title,
    description: property.description,
    openGraph: { images: property.images && property.images.length > 0 ? [property.images[0]] : [] },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  const related = await getSimilarProperties(slug);

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-6">
          <BackButton />
        </div>
        <FadeIn>
          <PropertyGallery
            images={property.images}
            imagesDetails={property.images_details}
            videos={property.videos ?? []}
            title={property.title}
            propertySlug={property.slug}
          />
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-10 mt-10">
          <div className="lg:col-span-2 space-y-10">
            <FadeIn>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gold text-white text-xs font-semibold rounded-full">
                    {property.status}
                  </span>
                  {property.luxury && (
                    <span className="px-3 py-1 bg-navy text-white text-xs font-semibold rounded-full">
                      Luxury
                    </span>
                  )}
                  <span className="text-navy/50 dark:text-white/50 text-sm">{property.type}</span>
                </div>
                <h1 className="font-heading text-4xl md:text-5xl text-navy dark:text-white mb-3">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-navy/60 dark:text-white/60 mb-4">
                  <MapPin size={16} className="text-gold" />
                  {property.location}
                </div>
                <p className="font-heading text-3xl text-gold">{formatPriceFull(property.price, property.max_price, property.currency)}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="flex flex-wrap gap-6 p-6 luxury-card">
                {hasValue(property.bedrooms) && (
                  <div className="flex items-center gap-2">
                    <Bed size={20} className="text-gold" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                )}
                {hasValue(property.bathrooms) && (
                  <div className="flex items-center gap-2">
                    <Bath size={20} className="text-gold" />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                )}
                {hasValue(property.sqft) && (
                  <div className="flex items-center gap-2">
                    <Maximize size={20} className="text-gold" />
                    <span>{property.sqft.toLocaleString()} sqft</span>
                  </div>
                )}
                {hasValue(property.year_built) && (
                  <div className="text-navy/60 dark:text-white/60 flex items-center gap-2">
                    <Calendar size={20} className="text-gold" />
                    <span>Built {property.year_built}</span>
                  </div>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <h2 className="font-heading text-2xl text-navy dark:text-white mb-4">Overview</h2>
                <p className="text-navy/70 dark:text-white/70 leading-relaxed">{property.description}</p>
              </div>
            </FadeIn>

            {(hasValue(property.building_approval) || hasValue(property.survey) || hasValue(property.document_title)) && (
              <FadeIn delay={0.25}>
                <div className="p-6 rounded-2xl bg-gold/5 border border-gold/20">
                  <h3 className="font-heading text-lg text-navy dark:text-white mb-4 font-normal">Legal & Documentation Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {hasValue(property.building_approval) && (
                      <div>
                        <p className="text-xs text-navy/50 dark:text-white/50 uppercase tracking-wider mb-1">Building Approval</p>
                        <p className="text-sm font-semibold text-navy dark:text-white">{property.building_approval}</p>
                      </div>
                    )}
                    {hasValue(property.survey) && (
                      <div>
                        <p className="text-xs text-navy/50 dark:text-white/50 uppercase tracking-wider mb-1">Survey</p>
                        <p className="text-sm font-semibold text-navy dark:text-white">{property.survey}</p>
                      </div>
                    )}
                    {hasValue(property.document_title) && (
                      <div>
                        <p className="text-xs text-navy/50 dark:text-white/50 uppercase tracking-wider mb-1">Title / Document</p>
                        <p className="text-sm font-semibold text-navy dark:text-white">{property.document_title}</p>
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            )}

            {property.features && property.features.length > 0 && (
              <FadeIn delay={0.3}>
                <div>
                  <h2 className="font-heading text-2xl text-navy dark:text-white mb-4">Features</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {property.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-navy/70 dark:text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <FadeIn delay={0.4}>
                <div>
                  <h2 className="font-heading text-2xl text-navy dark:text-white mb-4">Amenities</h2>
                  <div className="grid md:grid-cols-3 gap-3">
                    {property.amenities.map((a) => (
                      <div key={a} className="luxury-card p-4 text-sm text-center text-navy/70 dark:text-white/70">
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {property.coordinates?.lat && property.coordinates?.lng && (
              <FadeIn delay={0.5}>
                <div>
                  <h2 className="font-heading text-2xl text-navy dark:text-white mb-4">Location</h2>
                  <div className="rounded-2xl overflow-hidden h-80">
                    <iframe
                      title="Property Location"
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10000!2d${property.coordinates.lng}!3d${property.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </FadeIn>
            )}

          </div>

          <div className="space-y-6">
            <FadeIn delay={0.2}>
              <div className="luxury-card p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative">
                    <Image
                      src="/images/olajumoke-1.jpg"
                      alt={SITE.name}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <p className="font-heading text-lg text-navy dark:text-white">{SITE.name}</p>
                    <p className="text-gold text-sm">{SITE.title}</p>
                    <p className="text-xs text-navy/50 dark:text-white/50">{SITE.company}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {SITE.phone.map((phone) => {
                    const isWhatsApp = phone.includes("706");
                    return (
                      <a
                        key={phone}
                        href={isWhatsApp ? `https://wa.me/${phone.replace(/[\s+]/g, "")}?text=Hi, I'm interested in ${property.title}` : `tel:${phone.replace(/[\s+]/g, "")}`}
                        target={isWhatsApp ? "_blank" : undefined}
                        rel={isWhatsApp ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-3 text-sm text-navy/70 dark:text-white/70 hover:text-gold transition-colors"
                      >
                        {isWhatsApp ? (
                          <WhatsAppIcon className="text-gold shrink-0" />
                        ) : (
                          <Phone size={16} className="text-gold shrink-0" />
                        )}
                        <span>{phone}</span>
                      </a>
                    );
                  })}
                  <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 text-sm text-navy/70 dark:text-white/70 hover:text-gold transition-colors">
                    <Mail size={16} className="text-gold" /> {SITE.email}
                  </a>
                  <Link href="/contact" className="btn-outline w-full text-center text-sm !py-2.5">
                    <Calendar size={16} /> Schedule Inspection
                  </Link>
                </div>
              </div>
            </FadeIn>



            <FadeIn delay={0.4}>
              <PropertyEnquiry propertyTitle={property.title} propertyId={property.id} />
            </FadeIn>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <FadeIn>
              <h2 className="font-heading text-3xl text-navy dark:text-white mb-8">Similar Properties</h2>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link key={p.id} href={`/properties/${p.slug}`} className="luxury-card group overflow-hidden hover:shadow-luxury-lg">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {p.primary_image || (p.images && p.images.length > 0) ? (
                      <SafeImage
                        src={p.primary_image || p.images[0]}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="33vw"
                        propertySlug={p.slug}
                        imageId="primary_similar"
                      />
                    ) : (
                      <div className="w-full h-full bg-navy/10 flex items-center justify-center">
                        <span className="text-navy/30 text-4xl">🏠</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-lg text-navy dark:text-white mb-1">{p.title}</h3>
                    <p className="text-gold font-heading">{formatPrice(p.price, p.max_price, p.currency)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
