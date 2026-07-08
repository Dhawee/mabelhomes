"use client";

import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, Heart } from "lucide-react";
import { PROPERTIES } from "@/data/site";
import { formatPrice } from "@/lib/utils";
import FadeIn from "@/components/ui/FadeIn";
import { useState } from "react";

export default function FeaturedProperties() {
  const featured = PROPERTIES.filter((p) => p.featured).slice(0, 3);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <section id="properties" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">Featured Properties</p>
          <h2 className="section-heading">Exceptional Homes</h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((property, i) => (
            <FadeIn key={property.id} delay={i * 0.15}>
              <div className="luxury-card group hover:shadow-luxury-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-gold text-white text-xs font-semibold rounded-full">
                      {property.status}
                    </span>
                    {property.luxury && (
                      <span className="px-3 py-1 bg-navy/80 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                        Luxury
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFavorite(property.id)}
                    className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Save to favorites"
                  >
                    <Heart
                      size={16}
                      className={
                        favorites.includes(property.id)
                          ? "fill-gold text-gold"
                          : "text-navy/60"
                      }
                    />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-1 text-navy/50 dark:text-white/50 text-sm mb-2">
                    <MapPin size={14} />
                    {property.location}
                  </div>
                  <h3 className="font-heading text-xl text-navy dark:text-white mb-3">
                    {property.title}
                  </h3>
                  <p className="font-heading text-2xl text-gold mb-4">
                    {formatPrice(property.price)}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-navy/60 dark:text-white/60 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
                    {property.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed size={14} /> {property.bedrooms} Beds
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Bath size={14} /> {property.bathrooms} Baths
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize size={14} /> {property.sqft.toLocaleString()} sqft
                    </span>
                  </div>

                  <Link
                    href={`/properties/${property.slug}`}
                    className="btn-outline-gold w-full text-center text-sm !py-2.5"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="text-center mt-12">
          <Link href="/properties" className="btn-gold">
            View All Properties
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
