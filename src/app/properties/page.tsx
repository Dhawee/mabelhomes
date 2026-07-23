"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Grid3X3, List } from "lucide-react";
import { Property } from "@/types";
import { API_BASE_URL } from "@/config";
import PropertyCard from "@/components/properties/PropertyCard";
import FadeIn from "@/components/ui/FadeIn";
import BackButton from "@/components/properties/BackButton";

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    // Fetch only properties available for sale
    fetch(`${API_BASE_URL}/api/properties/?listing_type=property&page_size=100`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setProperties(list.filter((p: Property) => p.listing_type !== "shortlet"));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch properties:", err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (p.listing_type === "shortlet") return false;
      if (q) {
        const title = (p.title || "").toLowerCase();
        const loc = (p.location || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        if (!title.includes(q) && !loc.includes(q) && !desc.includes(q)) return false;
      }
      if (location && p.city !== location) return false;
      if (type && p.type !== type) return false;
      if (status && p.status !== status) return false;
      return true;
    });
  }, [properties, search, location, type, status]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

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
    const set = new Set(properties.map((p) => (p.city || "").trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [properties, dbLocations]);

  const types = useMemo(() => [...new Set(properties.map((p) => p.type).filter(Boolean))], [properties]);

  if (loading) {
    return <div className="text-center py-20 text-navy/60 dark:text-white/60">Loading properties from Mabel Homes...</div>;
  }

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
        <div className="mb-6">
          <BackButton />
        </div>
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
