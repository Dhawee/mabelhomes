"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Bed, Bath, Maximize, Check, Calendar, ExternalLink } from "lucide-react";
import { Property } from "@/types";
import { API_BASE_URL } from "@/config";
import { formatPrice } from "@/lib/utils";
import FadeIn from "@/components/ui/FadeIn";
import BackButton from "@/components/properties/BackButton";
import SafeImage from "@/components/ui/SafeImage";

function ShortletsContent() {
  const [shortlets, setShortlets] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/properties/?listing_type=shortlet&page_size=100`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setShortlets(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch shortlets:", err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shortlets.filter((p) => {
      if (q) {
        const title = (p.title || "").toLowerCase();
        const loc = (p.location || "").toLowerCase();
        const city = (p.city || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        if (!title.includes(q) && !loc.includes(q) && !city.includes(q) && !desc.includes(q)) {
          return false;
        }
      }
      if (location && p.city !== location) return false;
      return true;
    });
  }, [shortlets, search, location]);

  const [dbLocations, setDbLocations] = useState<string[]>([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/properties/locations/`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setDbLocations(data);
      })
      .catch(() => {});
  }, []);

  const cities = useMemo(() => {
    if (dbLocations.length > 0) return dbLocations;
    const set = new Set(shortlets.map((p) => (p.city || "").trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [shortlets, dbLocations]);

  if (loading) {
    return (
      <div className="text-center py-20 text-navy/60 dark:text-white/60">
        Loading Rosebowl shortlet accommodations...
      </div>
    );
  }

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="luxury-card p-6 mb-10 rounded-xl">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
            <input
              type="text"
              placeholder="Search by apartment name, location, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
          >
            <option value="">All Locations</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <p className="text-navy/60 dark:text-white/60 text-sm">
          Displaying {filtered.length} available shortlet apartment{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid of Shortlet Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((apartment) => (
          <div
            key={apartment.id}
            className="luxury-card rounded-xl overflow-hidden group hover:shadow-luxury-lg transition-all duration-500 bg-white dark:bg-navy/40 flex flex-col justify-between"
          >
            <div>
              {/* Featured Image */}
              <div className="relative aspect-[4/3] overflow-hidden shrink-0">
                {apartment.primary_image || (apartment.images && apartment.images.length > 0) ? (
                  <SafeImage
                    src={apartment.primary_image || apartment.images[0]}
                    alt={apartment.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    propertySlug={apartment.slug}
                    imageId="primary_shortlet"
                  />
                ) : (
                  <div className="w-full h-full bg-navy/10 flex items-center justify-center">
                    <span className="text-navy/40 text-sm">No Image Available</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-gold text-white text-xs font-semibold rounded-full font-heading">
                    Shortlet
                  </span>
                  <span className="px-3 py-1 bg-navy/80 text-white text-xs font-semibold rounded-full backdrop-blur-sm font-heading">
                    Serviced
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6">
                <div className="flex items-center gap-1.5 text-navy/60 dark:text-white/60 text-xs mb-2 font-body">
                  <MapPin size={14} className="text-gold shrink-0" />
                  <span className="line-clamp-1">{apartment.location}</span>
                </div>

                <h3 className="font-heading text-lg text-navy dark:text-white mb-2 leading-snug line-clamp-2">
                  {apartment.title}
                </h3>

                <p className="font-heading text-xl text-gold mb-3 font-semibold">
                  {formatPrice(apartment.price, apartment.max_price, apartment.currency)}
                  <span className="text-xs font-normal text-navy/60 dark:text-white/60 ml-1">
                    / night
                  </span>
                </p>

                <p className="text-navy/70 dark:text-white/70 text-xs line-clamp-2 mb-4 leading-relaxed font-body">
                  {apartment.description}
                </p>

                {/* Amenities pills */}
                {apartment.amenities && apartment.amenities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] uppercase tracking-wider text-gold font-semibold mb-2 font-heading">
                      Amenities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {apartment.amenities.slice(0, 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-soft dark:bg-white/5 text-[11px] text-navy/80 dark:text-white/80 rounded-md"
                        >
                          <Check size={11} className="text-gold" />
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 pt-0 grid grid-cols-2 gap-3">
              <Link
                href={`/properties/${apartment.slug}`}
                className="btn-outline-gold text-center text-xs !py-3 rounded-xl block"
              >
                View Details
              </Link>
              <a
                href={`https://wa.me/2347063711532?text=Hello%20Mabel%20Homes,%20I%20would%20like%20to%20book%20the%20shortlet:%20${encodeURIComponent(
                  apartment.title
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-center text-xs !py-3 rounded-xl inline-flex items-center justify-center gap-1.5"
              >
                <Calendar size={14} />
                Book Now
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 luxury-card rounded-xl">
          <p className="text-navy/60 dark:text-white/60 text-base mb-4">
            No shortlet accommodations match your query.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setLocation("");
            }}
            className="btn-gold text-xs !px-6 !py-2.5"
          >
            Clear Filters
          </button>
        </div>
      )}
    </>
  );
}

export default function ShortletsPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-6">
          <BackButton />
        </div>

        <FadeIn className="text-center mb-12">
          <p className="section-subheading">Rosebowl Accommodations</p>
          <h1 className="section-heading">Shortlet Apartments</h1>
          <p className="max-w-2xl mx-auto text-navy/70 dark:text-white/70 text-sm mt-3 leading-relaxed font-body">
            Experience hotel-grade luxury combined with the comfort and privacy of home. Fully serviced, 24/7 power, high-speed Wi-Fi, and prime Lagos locations.
          </p>
        </FadeIn>

        <Suspense fallback={<div className="text-center py-20">Loading shortlets...</div>}>
          <ShortletsContent />
        </Suspense>
      </div>
    </div>
  );
}
