"use client";

import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import FadeIn from "@/components/ui/FadeIn";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

import { Property } from "@/types";
import { API_BASE_URL } from "@/config";
import SafeImage from "@/components/ui/SafeImage";
import PropertyLikeButton from "../properties/PropertyLikeButton";

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [visibleItems, setVisibleItems] = useState(3);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gap = 24; // gap-6 in pixels

  // Responsive items count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch ALL featured properties via pagination loop
  useEffect(() => {
    async function fetchAllFeatured() {
      const all: Property[] = [];
      let url: string | null = `${API_BASE_URL}/api/properties/?featured=true`;
      try {
        while (url) {
          const res: Response = await fetch(url);
          const data: { results?: Property[]; next?: string | null } | Property[] = await res.json();
          if (Array.isArray(data)) {
            all.push(...data);
            url = null;
          } else {
            all.push(...(data.results || []));
            url = data.next || null;
          }
        }
        setProperties(all);
      } catch (err) {
        console.error("Failed to fetch featured properties:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllFeatured();
  }, []);

  const handleNext = useCallback(() => {
    if (properties.length === 0) return;
    setCurrentIndex((prev) => {
      if (prev >= properties.length) return prev;
      return prev + 1;
    });
  }, [properties.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (properties.length > visibleItems) {
      timerRef.current = setInterval(handleNext, 5000);
    }
  }, [properties.length, visibleItems, handleNext]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    if (!isTransitioning) {
      const t = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isTransitioning]);

  const handlePrev = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(properties.length);
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentIndex(properties.length - 1);
      }, 50);
    } else {
      setCurrentIndex((prev) => prev - 1);
    }

    resetTimer();
  };

  const handleManualNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleNext();
    resetTimer();
  };

  if (loading) {
    return (
      <section id="properties" className="py-12 md:py-16 px-6 md:px-12 bg-white dark:bg-navy border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto w-full pt-2">
          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="h-3 w-32 bg-gray-200 dark:bg-white/10 rounded-full mb-3 animate-pulse" />
              <div className="h-8 w-64 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
          {/* Card skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="luxury-card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-2/3 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-5 w-full bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-6 w-1/2 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="flex gap-4 pt-2">
                    <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded" />
                    <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded" />
                  </div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-white/10 rounded-lg mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) return null;

  // Append first set of visible items to the end for a seamless infinite loop
  const extendedProperties = [...properties, ...properties.slice(0, visibleItems)];
  const hasMultiplePages = properties.length > visibleItems;

  return (
    <section id="properties" className="py-12 md:py-16 px-6 md:px-12 bg-white dark:bg-navy border-b border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto w-full pt-2">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <FadeIn>
            <p className="section-subheading">Featured Listings</p>
            <h2 className="section-heading">Exceptional Homes</h2>
          </FadeIn>

          {hasMultiplePages && (
            <FadeIn className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-full border border-navy/10 dark:border-white/10 hover:border-gold hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:border-gold transition-all duration-300 flex items-center justify-center text-navy dark:text-white shadow-sm active:scale-95 cursor-pointer"
                aria-label="Previous properties"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleManualNext}
                className="w-12 h-12 rounded-full border border-navy/10 dark:border-white/10 hover:border-gold hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:border-gold transition-all duration-300 flex items-center justify-center text-navy dark:text-white shadow-sm active:scale-95 cursor-pointer"
                aria-label="Next properties"
              >
                <ChevronRight size={20} />
              </button>
            </FadeIn>
          )}
        </div>

        {/* Sliding Viewport */}
        <div className="relative overflow-hidden w-full py-4">
          <motion.div
            className="flex gap-6"
            animate={{
              x: `calc(-${currentIndex * (100 / visibleItems)}% - ${currentIndex * (gap / visibleItems)}px)`,
            }}
            transition={
              isTransitioning
                ? { type: "spring", stiffness: 180, damping: 24 }
                : { duration: 0 }
            }
            onAnimationComplete={() => {
              if (currentIndex === properties.length) {
                setIsTransitioning(false);
                setCurrentIndex(0);
              }
            }}
          >
            {extendedProperties.map((property, idx) => (
              <div
                key={`${property.id}-${idx}`}
                style={{
                  minWidth:
                    visibleItems === 1
                      ? "100%"
                      : visibleItems === 2
                        ? `calc(50% - ${gap / 2}px)`
                        : `calc(33.333% - ${(gap * 2) / 3}px)`,
                }}
                className="flex flex-col luxury-card group hover:shadow-luxury-lg bg-white dark:bg-navy/40 h-full"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden shrink-0">
                  {property.primary_image || (property.images && property.images.length > 0) ? (
                    <SafeImage
                      src={property.primary_image || property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      propertySlug={property.slug}
                      imageId="primary_featured"
                      priority={idx < 3}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-navy/10 to-gold/10 flex items-center justify-center">
                      <span className="text-navy/30 text-sm">No image</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-gold text-white text-xs font-semibold rounded-full font-heading">
                      {property.status}
                    </span>
                    {property.luxury && (
                      <span className="px-3 py-1 bg-navy/80 text-white text-xs font-semibold rounded-full backdrop-blur-sm font-heading">
                        Luxury
                      </span>
                    )}
                  </div>
                  <PropertyLikeButton
                    property={property}
                    variant="image-badge"
                    iconSize={16}
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white dark:bg-navy/40">
                  <div>
                    <div className="flex items-center gap-1.5 text-navy/55 dark:text-white/55 text-xs mb-2 font-body">
                      <MapPin size={13} className="text-gold shrink-0" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                    <h3 className="font-heading text-base md:text-lg text-navy dark:text-white mb-2 leading-tight line-clamp-2">
                      {property.title}
                    </h3>
                    <p className="font-heading text-lg md:text-xl text-gold mb-4 font-semibold">
                      {formatPrice(property.price, property.max_price, property.currency)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 text-xs text-navy/60 dark:text-white/60 mb-5 pb-4 border-b border-gray-100 dark:border-white/5 font-body flex-wrap">
                      {property.bedrooms > 0 && (
                        <span className="flex items-center gap-1 shrink-0">
                          <Bed size={13} /> {property.bedrooms} Beds
                        </span>
                      )}
                      {property.bathrooms > 0 && (
                        <span className="flex items-center gap-1 shrink-0">
                          <Bath size={13} /> {property.bathrooms} Baths
                        </span>
                      )}
                      {property.sqft > 0 && (
                        <span className="flex items-center gap-1 shrink-0">
                          <Maximize size={13} /> {property.sqft.toLocaleString()} sqft
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/properties/${property.slug}`}
                      className="btn-outline-gold w-full text-center text-xs !py-3 block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
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
