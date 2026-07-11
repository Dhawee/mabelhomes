"use client";

import { useState } from "react";
import { Search, MapPin, Home, DollarSign, Bed, Filter } from "lucide-react";
import { PROPERTIES } from "@/data/site";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

// Location list containing city and specific neighborhoods
const LOCATIONS = ["Lagos", "Chevron", "Ikoyi", "Lekki Phase 1", "Victoria Island"];
const PROPERTY_TYPES = ["Mansion", "Apartment", "Duplex"];

export default function PropertySearch() {
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const filteredCount = PROPERTIES.filter((p) => {
    if (location) {
      if (location === "Lagos") {
        if (p.city !== "Lagos") return false;
      } else {
        if (!p.location.toLowerCase().includes(location.toLowerCase())) return false;
      }
    }
    if (type && p.type !== type) return false;
    if (status && p.status !== status) return false;
    return true;
  }).length;

  const getSearchUrl = () => {
    const params = new URLSearchParams();
    if (location) {
      if (location === "Lagos") {
        params.set("location", "Lagos");
      } else {
        params.set("search", location);
      }
    }
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    return `/properties?${params.toString()}`;
  };

  return (
    <section className="relative z-30 max-w-7xl mx-auto px-6 md:px-12 w-full -mt-14 sm:-mt-16 md:-mt-20 lg:-mt-24">
      <FadeIn delay={0.2}>
        <div className="bg-white dark:bg-navy rounded-2xl p-6 md:p-8 shadow-luxury-lg border border-gray-100 dark:border-white/10 text-navy dark:text-white">
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
                  <option value="" className="bg-white dark:bg-navy">Location</option>
                  {LOCATIONS.map((loc) => (
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
                  <option value="" className="bg-white dark:bg-navy">Property Type</option>
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
                <DollarSign size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 dark:text-white/40" />
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-navy">Price Range</option>
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
                  <option value="" className="bg-white dark:bg-navy">Bedrooms</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n} className="bg-white dark:bg-navy">{n}+ Beds</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="relative">
              <label className="text-[10px] font-bold text-navy/40 dark:text-white/40 uppercase tracking-wider pl-1 mb-1 block">
                Status
              </label>
              <div className="relative">
                <Filter size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 dark:text-white/40" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-navy">Status</option>
                  <option className="bg-white dark:bg-navy">For Sale</option>
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
              <span>Search Properties</span>
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
