"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, Heart, Share2 } from "lucide-react";
import { Property } from "@/types";
import { formatPrice } from "@/lib/utils";
import FadeIn from "@/components/ui/FadeIn";
import SafeImage from "@/components/ui/SafeImage";
import PropertyLikeButton from "./PropertyLikeButton";

interface PropertyCardProps {
  property: Property;
  view?: "grid" | "list";
}

export default function PropertyCard({ property, view = "grid" }: PropertyCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(property.likes_count ?? 0);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: property.title,
        url: `${window.location.origin}/properties/${property.slug}`,
      });
    }
  };

  const primaryImage =
    property.primary_image ||
    (property.images && property.images.length > 0 ? property.images[0] : null);

  if (view === "list") {
    return (
      <FadeIn>
        <div className="luxury-card flex flex-col md:flex-row group hover:shadow-luxury-lg">
          <div className="relative md:w-80 aspect-[4/3] md:aspect-auto shrink-0 overflow-hidden">
            {primaryImage ? (
              <SafeImage
                src={primaryImage}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="320px"
                propertySlug={property.slug}
                imageId="primary_list"
              />
            ) : (
              <div className="w-full h-full bg-navy/10 flex items-center justify-center">
                <span className="text-navy/30 text-4xl">🏠</span>
              </div>
            )}
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
            <p className="font-heading text-2xl text-gold mb-4">{formatPrice(property.price, property.max_price, property.currency)}</p>
            <div className="flex items-center gap-4 text-sm text-navy/60 dark:text-white/60 mb-4">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bed size={14} /> {property.bedrooms}
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bath size={14} /> {property.bathrooms}
                </span>
              )}
              {property.sqft > 0 && (
                <span className="flex items-center gap-1">
                  <Maximize size={14} /> {property.sqft.toLocaleString()} sqft
                </span>
              )}
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
          {primaryImage ? (
            <SafeImage
              src={primaryImage}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 33vw"
              propertySlug={property.slug}
              imageId="primary_grid"
            />
          ) : (
            <div className="w-full h-full bg-navy/10 flex items-center justify-center">
              <span className="text-navy/30 text-6xl">🏠</span>
            </div>
          )}

          {/* Status badges */}
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

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <PropertyLikeButton
              property={property}
              variant="image-badge"
              className="relative top-0 right-0 shadow-sm"
              onLikeToggle={(l, c) => {
                setLiked(l);
                setLikesCount(c);
              }}
            />
            <button
              onClick={handleShare}
              className="w-9 h-9 bg-white/90 dark:bg-navy/80 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-navy transition-colors shadow-sm cursor-pointer border-none"
              aria-label="Share property"
              type="button"
            >
              <Share2 size={16} className="text-navy/60 dark:text-white/60" />
            </button>
          </div>

          {/* Likes count overlay */}
          {likesCount > 0 && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              <Heart size={11} className={liked ? "fill-gold text-gold" : "fill-white text-white"} />
              {likesCount}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-1 text-navy/50 dark:text-white/50 text-sm mb-2">
            <MapPin size={14} /> {property.location}
          </div>
          <h3 className="font-heading text-xl text-navy dark:text-white mb-3">
            {property.title}
          </h3>
          <p className="font-heading text-2xl text-gold mb-4">{formatPrice(property.price, property.max_price, property.currency)}</p>
          <div className="flex items-center gap-4 text-sm text-navy/60 dark:text-white/60 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed size={14} /> {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath size={14} /> {property.bathrooms} Baths
              </span>
            )}
            {property.sqft > 0 && (
              <span className="flex items-center gap-1">
                <Maximize size={14} /> {property.sqft.toLocaleString()} sqft
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/properties/${property.slug}`}
              className="btn-outline-gold flex-1 text-center text-sm !py-2.5"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
