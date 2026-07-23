"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Home, Bed, Filter } from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

import { API_BASE_URL } from "@/config";

const DEFAULT_LOCATIONS = ["Chevron", "Ikoyi", "Lagos", "Lekki Phase 1", "Victoria Island"];
const PROPERTY_TYPES = ["Mansion", "Apartment", "Duplex"];

export default function PropertySearch() {
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [locationsList, setLocationsList] = useState<string[]>(DEFAULT_LOCATIONS);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/properties/locations/`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = Array.from(new Set(data.map((c: string) => strVal(c))))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
          setLocationsList(sorted);
        }
      })
      .catch(() => {
        setLocationsList(DEFAULT_LOCATIONS);
      });
  }, []);

  function strVal(v: any): string {
    return typeof v === "string" ? v.trim() : "";
  }

  const getSearchUrl = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    if (bedrooms) params.set("bedrooms", bedrooms);

    if (priceRange) {
      if (priceRange.includes("Under ₦100M")) {
        params.set("price_max", "100000000");
      } else if (priceRange.includes("100M - 300M") || priceRange.includes("100M")) {
        params.set("price_min", "100000000");
        params.set("price_max", "300000000");
      } else if (priceRange.includes("300M - 600M") || priceRange.includes("300M")) {
        params.set("price_min", "300000000");
        params.set("price_max", "600000000");
      } else if (priceRange.includes("600M+")) {
        params.set("price_min", "600000000");
      }
    }
    return `/search?${params.toString()}`;
  };

  return (
    <section className="relative z-30 max-w-7xl mx-auto px-6 md:px-12 w-full -mt-14 sm:-mt-16 md:-mt-20 lg:-mt-24">
      <FadeIn delay={0.2}>
        <div className="bg-white dark:bg-navy rounded-xl p-6 md:p-8 shadow-luxury-lg border border-gray-100 dark:border-white/10 text-navy dark:text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            
            {/* Location */}
            <div className="relative">
              <label className="text-[10px] font-bold text-navy/40 dark:text-white/40 uppercase tracking-wider pl-1 mb-1 block">
                Location
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 dark:text-white/40" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-navy">All Locations</option>
                  {locationsList.map((loc) => (
                    <option key={loc} value={loc} className="bg-white dark:bg-navy">{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Property Type */}
            <div className="relative">
              <label className="text-[10px] font-bold text-navy/40 dark:text-white/40 uppercase tracking-wider pl-1 mb-1 block">
                Property Type
              </label>
              <div className="relative">
                <Home size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 dark:text-white/40" />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-navy">All Types</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-navy">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="relative">
              <label className="text-[10px] font-bold text-navy/40 dark:text-white/40 uppercase tracking-wider pl-1 mb-1 block">
                Price Range
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 dark:text-white/40 text-sm font-semibold">₦</span>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-navy">Any Price</option>
                  <option className="bg-white dark:bg-navy">Under ₦100M</option>
                  <option className="bg-white dark:bg-navy">₦100M - ₦300M</option>
                  <option className="bg-white dark:bg-navy">₦300M - ₦600M</option>
                  <option className="bg-white dark:bg-navy">₦600M+</option>
                </select>
              </div>
            </div>

            {/* Bedrooms */}
            <div className="relative">
              <label className="text-[10px] font-bold text-navy/40 dark:text-white/40 uppercase tracking-wider pl-1 mb-1 block">
                Bedrooms
              </label>
              <div className="relative">
                <Bed size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 dark:text-white/40" />
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-navy">Any Beds</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n} className="bg-white dark:bg-navy">{n}+ Beds</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="relative">
              <label className="text-[10px] font-bold text-navy/40 dark:text-white/40 uppercase tracking-wider pl-1 mb-1 block">
                Status / Mode
              </label>
              <div className="relative">
                <Filter size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 dark:text-white/40" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-navy">All Listings</option>
                  <option className="bg-white dark:bg-navy">For Sale</option>
                  <option className="bg-white dark:bg-navy">Shortlet</option>
                  <option className="bg-white dark:bg-navy">For Rent</option>
                  <option className="bg-white dark:bg-navy">Sold</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <Link
              href={getSearchUrl()}
              className="btn-gold text-center !py-3.5 flex items-center justify-center gap-2 hover:bg-gold-light transition-all shadow-md active:scale-[0.98] w-full"
            >
              <Search size={16} />
              <span>Search</span>
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
