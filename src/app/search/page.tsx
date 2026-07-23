"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Building2, Calendar, Check, ArrowRight } from "lucide-react";
import { Property } from "@/types";
import { API_BASE_URL } from "@/config";
import { formatPrice } from "@/lib/utils";
import PropertyCard from "@/components/properties/PropertyCard";
import FadeIn from "@/components/ui/FadeIn";
import BackButton from "@/components/properties/BackButton";
import SafeImage from "@/components/ui/SafeImage";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "";
  const initialType = searchParams.get("type") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialBedrooms = searchParams.get("bedrooms") || "";

  const [allListings, setAllListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [type, setType] = useState(initialType);
  const [status, setStatus] = useState(initialStatus);
  const [bedrooms, setBedrooms] = useState(initialBedrooms);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      listing_type: "all",
      page_size: "100",
    });

    if (searchParams.get("search")) params.set("search", searchParams.get("search")!);
    if (searchParams.get("location")) params.set("location", searchParams.get("location")!);
    if (searchParams.get("type")) params.set("type", searchParams.get("type")!);
    if (searchParams.get("status")) params.set("status", searchParams.get("status")!);
    if (searchParams.get("bedrooms")) params.set("bedrooms", searchParams.get("bedrooms")!);
    if (searchParams.get("price_min")) params.set("price_min", searchParams.get("price_min")!);
    if (searchParams.get("price_max")) params.set("price_max", searchParams.get("price_max")!);

    fetch(`${API_BASE_URL}/api/properties/?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setAllListings(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch search results:", err);
        setLoading(false);
      });
  }, [searchParams]);

  // Client-side filtering with safe null handling
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allListings.filter((p) => {
      if (q) {
        const title = (p.title || "").toLowerCase();
        const loc = (p.location || "").toLowerCase();
        const city = (p.city || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        if (!title.includes(q) && !loc.includes(q) && !city.includes(q) && !desc.includes(q)) {
          return false;
        }
      }
      if (location && p.city !== location && !((p.location || "").toLowerCase().includes(location.toLowerCase()))) {
        return false;
      }
      if (type && p.type !== type && p.type_slug !== type) return false;
      if (status && p.status !== status) return false;
      if (bedrooms && (p.bedrooms || 0) < Number(bedrooms)) return false;
      return true;
    });
  }, [allListings, search, location, type, status, bedrooms]);

  // Split results into Properties for Sale vs Shortlets
  const propertiesForSale = useMemo(() => {
    return filtered.filter((p) => (p.listing_type || "").toLowerCase() !== "shortlet" && p.status !== "Shortlet");
  }, [filtered]);

  const shortletApartments = useMemo(() => {
    return filtered.filter((p) => (p.listing_type || "").toLowerCase() === "shortlet" || p.status === "Shortlet");
  }, [filtered]);

  const handleApplyFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    if (bedrooms) params.set("bedrooms", bedrooms);
    router.push(`/search?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearch("");
    setLocation("");
    setType("");
    setStatus("");
    setBedrooms("");
    router.push("/search");
  };

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
    const set = new Set(allListings.map((p) => (p.city || "").trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allListings, dbLocations]);

  const types = useMemo(() => [...new Set(allListings.map((p) => p.type).filter(Boolean))], [allListings]);

  if (loading) {
    return (
      <div className="text-center py-20 text-navy/60 dark:text-white/60">
        Searching Mabel Homes portfolio across properties & shortlets...
      </div>
    );
  }

  return (
    <>
      {/* Filter Control Bar */}
      <div className="luxury-card p-6 mb-10 rounded-xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
            <input
              type="text"
              placeholder="Search keyword, title, neighborhood..."
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
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
          >
            <option value="">All Modes</option>
            <option>For Sale</option>
            <option>Shortlet</option>
            <option>For Rent</option>
            <option>Sold</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleResetFilters}
            className="btn-outline text-xs !px-5 !py-2.5 rounded-xl"
          >
            Reset Filters
          </button>
          <button
            onClick={handleApplyFilter}
            className="btn-gold text-xs !px-6 !py-2.5 rounded-xl"
          >
            Filter Results
          </button>
        </div>
      </div>

      {/* Overview Count Badge */}
      <div className="mb-10 text-center">
        <p className="text-navy/60 dark:text-white/60 text-sm">
          Found <strong className="text-navy dark:text-white">{filtered.length}</strong> matching item{filtered.length !== 1 ? "s" : ""} ({propertiesForSale.length} Properties, {shortletApartments.length} Shortlets)
        </p>
      </div>

      {/* Section 1: Properties for Sale */}
      {propertiesForSale.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200 dark:border-white/10">
            <Building2 className="text-gold" size={24} />
            <h2 className="font-heading text-2xl text-navy dark:text-white font-bold">
              Properties for Sale ({propertiesForSale.length})
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propertiesForSale.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Shortlet Apartments */}
      {shortletApartments.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200 dark:border-white/10">
            <Calendar className="text-gold" size={24} />
            <h2 className="font-heading text-2xl text-navy dark:text-white font-bold">
              Rosebowl Shortlet Apartments ({shortletApartments.length})
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shortletApartments.map((apartment) => (
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
                        sizes="(max-width: 768px) 100vw, 33vw"
                        propertySlug={apartment.slug}
                        imageId="primary_search_shortlet"
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

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-1.5 text-navy/60 dark:text-white/60 text-xs mb-2 font-body">
                      <MapPin size={14} className="text-gold shrink-0" />
                      <span className="line-clamp-1">{apartment.location || apartment.city}</span>
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

                    {apartment.amenities && apartment.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {apartment.amenities.slice(0, 3).map((amenity, idx) => (
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

                {/* Actions */}
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
                    className="btn-gold text-center text-xs !py-3 rounded-xl inline-flex items-center justify-center gap-1"
                  >
                    <Calendar size={14} />
                    Book Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-20 luxury-card rounded-xl">
          <p className="text-navy/60 dark:text-white/60 text-base mb-4 font-body">
            No properties or shortlet accommodations match your criteria.
          </p>
          <button
            onClick={handleResetFilters}
            className="btn-gold text-xs !px-6 !py-2.5"
          >
            Clear All Search Filters
          </button>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-6">
          <BackButton />
        </div>

        <FadeIn className="text-center mb-12">
          <p className="section-subheading">Portfolio Search</p>
          <h1 className="section-heading">Search Results</h1>
        </FadeIn>

        <Suspense fallback={<div className="text-center py-20">Loading search results...</div>}>
          <SearchResultsContent />
        </Suspense>
      </div>
    </div>
  );
}
