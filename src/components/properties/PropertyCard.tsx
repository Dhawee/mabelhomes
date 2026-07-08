"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, Heart, Share2, GitCompare } from "lucide-react";
import { Property } from "@/types";
import { formatPrice } from "@/lib/utils";
import FadeIn from "@/components/ui/FadeIn";

interface PropertyCardProps {
  property: Property;
  view?: "grid" | "list";
}

export default function PropertyCard({ property, view = "grid" }: PropertyCardProps) {
  const [favorite, setFavorite] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: property.title,
        url: `${window.location.origin}/properties/${property.slug}`,
      });
    }
  };

  if (view === "list") {
    return (
      <FadeIn>
        <div className="luxury-card flex flex-col md:flex-row group hover:shadow-luxury-lg">
          <div className="relative md:w-80 aspect-[4/3] md:aspect-auto shrink-0 overflow-hidden">
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="320px"
            />
            {property.luxury && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-navy/80 text-white text-xs font-semibold rounded-full">
                Luxury
              </span>
            )}
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1 text-navy/50 dark:text-white/50 text-sm mb-2">
              <MapPin size={14} /> {property.location}
            </div>
            <h3 className="font-heading text-xl text-navy dark:text-white mb-2">
              {property.title}
            </h3>
            <p className="font-heading text-2xl text-gold mb-4">{formatPrice(property.price)}</p>
            <div className="flex items-center gap-4 text-sm text-navy/60 dark:text-white/60 mb-4">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bed size={14} /> {property.bedrooms}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Bath size={14} /> {property.bathrooms}
              </span>
              <span className="flex items-center gap-1">
                <Maximize size={14} /> {property.sqft.toLocaleString()} sqft
              </span>
            </div>
            <Link href={`/properties/${property.slug}`} className="btn-outline-gold w-fit text-sm !py-2">
              View Details
            </Link>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
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
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setFavorite(!favorite)}
              className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Save to favorites"
            >
              <Heart size={16} className={favorite ? "fill-gold text-gold" : "text-navy/60"} />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Share property"
            >
              <Share2 size={16} className="text-navy/60" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-1 text-navy/50 dark:text-white/50 text-sm mb-2">
            <MapPin size={14} /> {property.location}
          </div>
          <h3 className="font-heading text-xl text-navy dark:text-white mb-3">
            {property.title}
          </h3>
          <p className="font-heading text-2xl text-gold mb-4">{formatPrice(property.price)}</p>
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
          <div className="flex gap-2">
            <Link href={`/properties/${property.slug}`} className="btn-outline-gold flex-1 text-center text-sm !py-2.5">
              View Details
            </Link>
            <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-colors" aria-label="Compare">
              <GitCompare size={14} />
            </button>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
