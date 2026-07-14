"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Building2, Search, RefreshCw, Download } from "lucide-react";
import { api } from "@/lib/api";
import type { ServiceEnquiry, PaginatedResponse } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  Pending: "badge-warning",
  Responded: "badge-success",
  Closed: "badge-gray",
};

export default function ServiceEnquiriesPage() {
  const [data, setData] = useState<PaginatedResponse<ServiceEnquiry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
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
      const result = await api.get<PaginatedResponse<ServiceEnquiry>>(
        `/api/service-enquiries/?${params}`
      );
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load service enquiries.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleMarkResponded = async (id: number) => {
    try {
      await api.patch(`/api/service-enquiries/${id}/`, { status: "Responded", replied: true });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to update.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Building2 size={22} className="text-cyan-500" />
            Service Enquiries
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.count ?? 0} enquiries total
          </p>
        </div>
        <button onClick={load} className="btn btn-outline gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="card card-body">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, service..."
            className="form-input pl-9"
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="p-6 text-red-600 text-sm">⚠ {error}</div>
        ) : !data?.results.length ? (
          <div className="p-12 text-center text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            No service enquiries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Contact</th>
                  <th>Service</th>
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
                    <td className="text-sm text-gray-700">{enq.service_title}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[enq.status]}`}>
                        {enq.status}
                      </span>
                    </td>
                    <td className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(enq.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/service-enquiries/${enq.id}`}
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
        )}
      </div>
    </div>
  );
}
