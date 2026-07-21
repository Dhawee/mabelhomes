"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Phone, Search, RefreshCw } from "lucide-react";
import { api } from "@/lib/admin/api";
import type { ContactMessage, PaginatedResponse } from "@/types/admin";

const STATUS_COLORS: Record<string, string> = {
  Pending: "badge-warning",
  Responded: "badge-success",
  Closed: "badge-gray",
};

export default function ContactMessagesPage() {
  const [data, setData] = useState<PaginatedResponse<ContactMessage> | null>(null);
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
      const result = await api.get<PaginatedResponse<ContactMessage>>(
        `/api/contact-messages/?${params}`
      );
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load contact messages.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Phone size={20} className="text-violet-500" />
            Contact Messages
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.count ?? 0} messages total
          </p>
        </div>
        <div className="page-header-actions">
          <button onClick={load} className="btn btn-outline gap-2">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="card card-body">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, subject..."
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
            <Phone size={40} className="mx-auto mb-3 opacity-30" />
            No contact messages found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((msg) => (
                  <tr key={msg.id}>
                    <td className="text-gray-400 text-xs">#{msg.id}</td>
                    <td>
                      <div className="font-medium text-gray-900">{msg.name}</div>
                      <div className="text-xs text-blue-600">{msg.email}</div>
                      {msg.phone && (
                        <div className="text-xs text-gray-400">{msg.phone}</div>
                      )}
                    </td>
                    <td className="text-sm text-gray-700 cell-truncate">
                      {msg.subject}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[msg.status]}`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <Link
                        href={`/admin/dashboard/contact-messages/${msg.id}`}
                        className="btn btn-outline py-1 px-3 text-xs"
                      >
                        View
                      </Link>
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
