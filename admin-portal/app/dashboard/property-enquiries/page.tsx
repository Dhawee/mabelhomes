"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MessageSquare, Search, Filter, Download, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { PropertyEnquiry, PaginatedResponse } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  Pending: "badge-warning",
  Responded: "badge-success",
  Closed: "badge-gray",
};

export default function PropertyEnquiriesPage() {
  const [data, setData] = useState<PaginatedResponse<PropertyEnquiry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "20",
        ordering: "-created_at",
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const result = await api.get<PaginatedResponse<PropertyEnquiry>>(
        `/api/property-enquiries/?${params}`
      );
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleMarkResponded = async (id: number) => {
    try {
      await api.patch(`/api/property-enquiries/${id}/`, { status: "Responded", replied: true });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleExportCsv = async () => {
    const params = new URLSearchParams({ ordering: "-created_at" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/property-enquiries/export-csv/?${params}`, "_blank");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <MessageSquare size={22} className="text-blue-500" />
            Property Enquiries
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.count ?? 0} enquiry{data?.count !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCsv} className="btn btn-outline gap-2">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={load} className="btn btn-outline gap-2">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-body">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, property..."
              className="form-input pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-input w-auto"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Responded">Responded</option>
            <option value="Closed">Closed</option>
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
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            No enquiries found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Contact</th>
                    <th>Property</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((enq) => (
                    <tr key={enq.id}>
                      <td className="text-gray-400 text-xs">#{enq.id}</td>
                      <td>
                        <div className="font-medium text-gray-900">{enq.name}</div>
                        <div className="text-xs text-blue-600">{enq.email}</div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-700 max-w-[200px] truncate">
                          {enq.property_title}
                        </div>
                      </td>
                      <td className="text-sm text-gray-600">{enq.phone}</td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[enq.status]}`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(enq.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/property-enquiries/${enq.id}`}
                            className="btn btn-outline py-1 px-3 text-xs"
                          >
                            View
                          </Link>
                          {enq.status === "Pending" && (
                            <button
                              onClick={() => handleMarkResponded(enq.id)}
                              className="btn btn-primary py-1 px-3 text-xs"
                            >
                              Mark Responded
                            </button>
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
