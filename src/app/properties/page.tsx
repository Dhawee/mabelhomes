"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Grid3X3, List } from "lucide-react";
import { PROPERTIES } from "@/data/site";
import PropertyCard from "@/components/properties/PropertyCard";
import FadeIn from "@/components/ui/FadeIn";

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    return PROPERTIES.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
          !p.location.toLowerCase().includes(search.toLowerCase())) return false;
      if (location && p.city !== location) return false;
      if (type && p.type !== type) return false;
      if (status && p.status !== status) return false;
      return true;
    });
  }, [search, location, type, status]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const cities = [...new Set(PROPERTIES.map((p) => p.city))];
  const types = [...new Set(PROPERTIES.map((p) => p.type))];

  return (
    <>
      <div className="luxury-card p-6 mb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <select
            value={location}
            onChange={(e) => { setLocation(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
          >
            <option value="">All Locations</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
          >
            <option value="">All Types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
          >
            <option value="">All Status</option>
            <option>For Sale</option>
            <option>For Rent</option>
            <option>Sold</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <p className="text-navy/60 dark:text-white/60 text-sm">
          Showing {paginated.length} of {filtered.length} properties
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-lg ${view === "grid" ? "bg-gold text-white" : "text-navy/40"}`}
            aria-label="Grid view"
          >
            <Grid3X3 size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-lg ${view === "list" ? "bg-gold text-white" : "text-navy/40"}`}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className={view === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
        {paginated.map((property) => (
          <PropertyCard key={property.id} property={property} view={view} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-navy/40 dark:text-white/40 text-lg">No properties found matching your criteria.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                p === page ? "bg-gold text-white" : "border border-gray-200 dark:border-white/10 hover:border-gold"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function PropertiesPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <FadeIn className="text-center mb-12">
          <p className="section-subheading">Portfolio</p>
          <h1 className="section-heading">Our Properties</h1>
        </FadeIn>
        <Suspense fallback={<div className="text-center py-20">Loading properties...</div>}>
          <PropertiesContent />
        </Suspense>
      </div>
    </div>
  );
}
