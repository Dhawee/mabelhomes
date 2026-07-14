"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Search, RefreshCw, Download } from "lucide-react";
import { api, getAccessToken } from "@/lib/api";
import type { AuditLog, PaginatedResponse } from "@/types";

const ACTION_COLORS: Record<string, string> = {
  login: "bg-green-100 text-green-700",
  logout: "bg-red-100 text-red-700",
  create: "bg-blue-100 text-blue-700",
  update: "bg-amber-100 text-amber-700",
  delete: "bg-rose-100 text-rose-700",
  reply: "bg-purple-100 text-purple-700",
  upload: "bg-teal-100 text-teal-700",
  settings: "bg-slate-100 text-slate-700",
};

export default function AuditLogPage() {
  const [data, setData] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "25",
      });
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);

      const result = await api.get<PaginatedResponse<AuditLog>>(`/api/audit-log/?${params}`);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExportCSV = async () => {
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/audit-log/export_csv/?${params}`, {
        headers,
      });
      
      if (!res.ok) throw new Error("Failed to export CSV.");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to export CSV.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy flex items-center gap-2" style={{ color: "var(--color-navy)" }}>
            <FileText size={22} className="text-navy" style={{ color: "var(--color-navy)" }} />
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            System activity history and administrative change tracking logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn btn-outline gap-2 py-2 text-sm">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={load} className="btn btn-outline gap-2 py-2 text-sm">
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
              placeholder="Search by username, description, model..."
              className="form-input pl-9"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="form-input w-auto"
          >
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="reply">Reply</option>
            <option value="upload">Upload</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="p-6 text-red-600 text-sm">⚠ {error}</div>
        ) : !data?.results.length ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-100">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            No audit logs found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table text-sm">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Affected Model</th>
                    <th>Description</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((log) => (
                    <tr key={log.id}>
                      <td className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="font-semibold text-gray-900">{log.username}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500 font-mono">{log.model_name || "N/A"}</td>
                      <td className="max-w-xs truncate text-gray-600" title={log.description}>{log.description}</td>
                      <td className="text-xs text-gray-400 font-mono">{log.ip_address || "System"}</td>
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
