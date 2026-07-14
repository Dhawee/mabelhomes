"use client";

import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import FadeIn from "@/components/ui/FadeIn";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { Property } from "@/types";
import { API_BASE_URL } from "@/config";

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<(string | number)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/properties/?featured=true&page_size=100`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results || []);
        // Filter out shortlet apartments and regular apartments, showing Sale/Rent houses
        const filtered = list.filter(
          (p: Property) => p.status !== "Shortlet" && p.type !== "Apartment"
        );
        setProperties(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch featured properties:", err);
        setLoading(false);
      });
  }, []);

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

  const toggleFavorite = (id: string | number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const maxIndex = Math.max(0, properties.length - visibleItems);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Gap between items is 24px (gap-6)
  const gap = 24;

  if (loading) {
    return (
      <section className="py-20 text-center text-navy/60 dark:text-white/60">
        Loading featured properties...
      </section>
    );
  }

  return (
    <section id="properties" className="py-12 md:py-16 px-6 md:px-12 bg-white dark:bg-navy border-b border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto w-full pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <FadeIn>
            <p className="section-subheading">Featured Listings</p>
            <h2 className="section-heading">Exceptional Homes</h2>
          </FadeIn>

          {/* Carousel Controls */}
          {properties.length > visibleItems && (
            <FadeIn className="flex gap-3">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-full border border-navy/10 dark:border-white/10 hover:border-gold hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:border-gold transition-all duration-300 flex items-center justify-center text-navy dark:text-white shadow-sm active:scale-95 cursor-pointer"
                aria-label="Previous properties"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full border border-navy/10 dark:border-white/10 hover:border-gold hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:border-gold transition-all duration-300 flex items-center justify-center text-navy dark:text-white shadow-sm active:scale-95 cursor-pointer"
                aria-label="Next properties"
              >
                <ChevronRight size={20} />
              </button>
            </FadeIn>
          )}
        </div>

        {/* Carousel Viewport Container */}
        <div className="relative overflow-hidden w-full py-4">
          <motion.div
            className="flex gap-6"
            animate={{
              x: `calc(-${currentIndex * (100 / visibleItems)}% - ${
                currentIndex * (gap / visibleItems)
              }px)`,
            }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
          >
            {properties.map((property) => (
              <div
                key={property.id}
                style={{
                  minWidth:
                    visibleItems === 1
                      ? "100%"
                      : visibleItems === 2
                      ? `calc(50% - ${gap / 2}px)`
                      : `calc(33.333% - ${(gap * 2) / 3}px)`,
                }}
                className="shrink-0"
              >
                <div className="luxury-card group hover:shadow-luxury-lg h-full flex flex-col justify-between bg-white dark:bg-navy/40">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
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
                    <button
                      onClick={() => toggleFavorite(property.id)}
                      className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
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

                  <div className="p-6 flex-1 flex flex-col justify-between bg-white dark:bg-navy/40">
                    <div>
                      <div className="flex items-center gap-1.5 text-navy/55 dark:text-white/55 text-xs mb-2 font-body">
                        <MapPin size={13} className="text-gold shrink-0" />
                        <span>{property.location}</span>
                      </div>
                      <h3 className="font-heading text-lg md:text-xl text-navy dark:text-white mb-2 leading-tight">
                        {property.title}
                      </h3>
                      <p className="font-heading text-xl md:text-2xl text-gold mb-4 font-semibold">
                        {formatPrice(property.price)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-4 text-xs text-navy/60 dark:text-white/60 mb-6 pb-5 border-b border-gray-100 dark:border-white/5 font-body">
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
