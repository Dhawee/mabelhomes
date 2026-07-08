"use client";

import { useState } from "react";
import { Search, MapPin, Home, DollarSign, Bed, Bath, Filter } from "lucide-react";
import { PROPERTIES } from "@/data/site";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

export default function PropertySearch() {
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const cities = [...new Set(PROPERTIES.map((p) => p.city))];
  const types = [...new Set(PROPERTIES.map((p) => p.type))];

  const filteredCount = PROPERTIES.filter((p) => {
    if (location && p.city !== location) return false;
    if (type && p.type !== type) return false;
    if (status && p.status !== status) return false;
    return true;
  }).length;

  return (
    <section className="section-padding bg-white border-b border-gray-100 dark:bg-navy dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="text-gold uppercase tracking-[0.2em] text-sm font-semibold mb-4">
            Find Your Dream Home
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-navy dark:text-white font-light">
            Property Search
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="bg-soft dark:bg-navy/30 rounded-2xl p-6 md:p-8 shadow-luxury-lg border border-gray-100/50 dark:border-white/5">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none"
                >
                  <option value="">Location</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Home size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none"
                >
                  <option value="">Property Type</option>
                  {types.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <select className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none">
                  <option value="">Price Range</option>
                  <option>Under ₦50M</option>
                  <option>₦50M - ₦100M</option>
                  <option>₦100M - ₦300M</option>
                  <option>₦300M+</option>
                </select>
              </div>

              <div className="relative">
                <Bed size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <select className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none">
                  <option value="">Bedrooms</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n}+ Beds</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none"
                >
                  <option value="">Status</option>
                  <option>For Sale</option>
                  <option>For Rent</option>
                  <option>Sold</option>
                </select>
              </div>

              <Link
                href={`/properties?location=${location}&type=${type}&status=${status}`}
                className="btn-gold text-center !py-3.5"
              >
                <Search size={16} />
                Search ({filteredCount})
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
