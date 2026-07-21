"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, Search, Eye, EyeOff, Star, Heart, Plus, RefreshCw } from "lucide-react";
import { api } from "@/lib/admin/api";
import { formatAdminPrice } from "@/lib/admin/utils";
import type { Property, PaginatedResponse } from "@/types/admin";

export default function PropertiesPage() {
  const [data, setData] = useState<PaginatedResponse<Property> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all"); // 'all', 'visible', 'hidden', 'featured'
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "20",
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      if (visibilityFilter === "visible") {
        params.set("is_visible", "true");
      } else if (visibilityFilter === "hidden") {
        params.set("is_visible", "false");
      } else if (visibilityFilter === "featured") {
        params.set("featured", "true");
      } else if (visibilityFilter === "deleted") {
        params.set("show_deleted", "true");
      }

      const result = await api.get<PaginatedResponse<Property>>(
        `/api/properties/?${params}`
      );
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, visibilityFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleVisibility = async (prop: Property) => {
    try {
      await api.patch(`/api/properties/${prop.slug}/`, { is_visible: !prop.is_visible });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to update visibility.");
    }
  };

  const toggleFeatured = async (prop: Property) => {
    try {
      await api.patch(`/api/properties/${prop.slug}/`, { featured: !prop.featured });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to update featured status.");
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    "For Sale": "badge-success",
    "For Rent": "badge-info",
    Sold: "badge-error",
    "Under Offer": "badge-warning",
    Shortlet: "badge-gold",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Home size={20} className="text-navy" style={{ color: "var(--color-navy)" }} />
            Properties
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.count ?? 0} properties total
          </p>
        </div>
        <div className="page-header-actions">
          <button onClick={load} className="btn btn-outline gap-2 py-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link href="/admin/dashboard/properties/new" className="btn btn-primary gap-2 py-2 text-sm">
            <Plus size={14} /> Add Property
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-body space-y-4">
        <div className="flex gap-3 flex-wrap">
          {/* Search text */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by title, city, location..."
              className="form-input pl-9"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-input w-auto"
          >
            <option value="">All Statuses</option>
            <option value="For Sale">For Sale</option>
            <option value="For Rent">For Rent</option>
            <option value="Sold">Sold</option>
            <option value="Under Offer">Under Offer</option>
            <option value="Shortlet">Shortlet</option>
          </select>

          {/* Visibility filter */}
          <select
            value={visibilityFilter}
            onChange={(e) => { setVisibilityFilter(e.target.value); setPage(1); }}
            className="form-input w-auto"
          >
            <option value="all">All Visibility</option>
            <option value="visible">Visible Only</option>
            <option value="hidden">Hidden Only</option>
            <option value="featured">Featured Only</option>
            <option value="deleted">Deleted Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="p-6 text-red-600 text-sm">⚠ {error}</div>
        ) : !data?.results.length ? (
          <div className="p-12 text-center text-gray-400">
            <Home size={40} className="mx-auto mb-3 opacity-30" />
            No properties found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>City</th>
                    <th>Likes</th>
                    <th>Visible</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((prop) => (
                    <tr key={prop.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded-md overflow-hidden bg-gray-100 shrink-0 relative">
                            {prop.primary_image ? (
                              <img
                                src={prop.primary_image}
                                alt={prop.title}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                🏠
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 cell-truncate text-sm">
                              {prop.title}
                            </div>
                            <div className="text-xs text-gray-400 truncate">{prop.type}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[prop.status] || "badge-gray"}`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="text-sm font-semibold" style={{ color: "var(--color-gold)" }}>
                        {formatAdminPrice(prop.price, prop.max_price, prop.currency)}
                      </td>
                      <td className="text-sm text-gray-600">{prop.city}</td>
                      <td>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Heart size={13} className="text-red-400" />
                          {prop.likes_count ?? 0}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleVisibility(prop)}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${prop.is_visible
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          title={prop.is_visible ? "Click to hide" : "Click to show"}
                        >
                          {prop.is_visible ? (
                            <><Eye size={12} /> Visible</>
                          ) : (
                            <><EyeOff size={12} /> Hidden</>
                          )}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleFeatured(prop)}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${prop.featured
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                        >
                          <Star size={12} />
                          {prop.featured ? "Featured" : "Normal"}
                        </button>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/dashboard/properties/${prop.slug}`}
                            className="btn btn-outline py-1 px-3 text-xs"
                          >
                            View
                          </Link>
                          {prop.is_deleted ? (
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to restore "${prop.title}"?`)) {
                                  try {
                                    await api.post(`/api/properties/${prop.slug}/restore/`, {});
                                    alert("Property restored successfully!");
                                    load();
                                  } catch (err: any) {
                                    alert(err.message || "Failed to restore property.");
                                  }
                                }
                              }}
                              className="btn btn-gold py-1 px-3 text-xs"
                            >
                              Restore
                            </button>
                          ) : (
                            <Link
                              href={`/admin/dashboard/properties/${prop.slug}/edit`}
                              className="btn btn-primary py-1 px-3 text-xs"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(data.next || data.previous) && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {data.results.length} of {data.count}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!data.previous}
                    className="btn btn-outline py-1.5 px-4 text-xs disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="btn btn-outline py-1.5 px-4 text-xs cursor-default">
                    Page {page}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data.next}
                    className="btn btn-outline py-1.5 px-4 text-xs disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
