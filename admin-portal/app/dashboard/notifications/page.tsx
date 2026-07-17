"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bell, Check, CheckCheck, Trash2, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminNotification, PaginatedResponse } from "@/types";

const TYPE_ICONS: Record<string, string> = {
  property_enquiry: "🏠",
  service_enquiry: "⚙️",
  contact: "✉️",
  like: "❤️",
  system: "🔧",
};

const TYPE_LABELS: Record<string, string> = {
  property_enquiry: "Property Enquiry",
  service_enquiry: "Service Enquiry",
  contact: "Contact Message",
  like: "Property Like",
  system: "System Alert",
};

export default function NotificationsPage() {
  const [data, setData] = useState<PaginatedResponse<AdminNotification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUnread, setShowUnread] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "30",
        ordering: "-created_at",
      });
      if (showUnread) params.set("read", "false");

      const result = await api.get<PaginatedResponse<AdminNotification>>(
        `/api/notifications/?${params}`
      );
      setData(result);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [page, showUnread]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: number) => {
    try {
      await api.post(`/api/notifications/${id}/mark_read/`, {});
      load();
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/api/notifications/mark_all_read/", {});
      load();
    } catch (err: any) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await api.delete(`/api/notifications/${id}/`);
      load();
    } catch (err: any) {
      alert(err.message || "Failed to delete notification.");
    }
  };

  const handleViewDetails = async (notif: AdminNotification) => {
    setSelectedNotification(notif);
    if (!notif.read) {
      await markRead(notif.id);
    }
  };

  const unreadCount = data?.results.filter((n) => !n.read).length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy flex items-center gap-2" style={{ color: "var(--color-navy)" }}>
            <Bell size={22} className="text-navy" style={{ color: "var(--color-navy)" }} />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount} unread · {data?.count ?? 0} total
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn btn-primary gap-2 py-2 text-sm">
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          <button onClick={load} className="btn btn-outline gap-2 py-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => { setShowUnread(false); setPage(1); }}
          className={`btn text-xs py-1.5 ${!showUnread ? "btn-primary text-white" : "btn-outline"}`}
        >
          All
        </button>
        <button
          onClick={() => { setShowUnread(true); setPage(1); }}
          className={`btn text-xs py-1.5 ${showUnread ? "btn-primary text-white" : "btn-outline"}`}
        >
          Unread Only
        </button>
      </div>

      {/* List */}
      <div className="card divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="spinner" />
          </div>
        ) : !data?.results.length ? (
          <div className="p-12 text-center text-gray-400">
            <Bell size={40} className="mx-auto mb-3 opacity-30" />
            {showUnread ? "No unread notifications." : "No notifications yet."}
          </div>
        ) : (
          data.results.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer ${
                !notif.read ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-gray-50"
              }`}
              onClick={() => handleViewDetails(notif)}
            >
              <div className="text-2xl shrink-0 mt-0.5">
                {TYPE_ICONS[notif.notification_type] || "🔔"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                  <span className={`badge text-[10px] ${!notif.read ? "badge-info" : "badge-gray"}`}>
                    {!notif.read ? "Unread" : "Read"}
                  </span>
                  <span className="badge badge-gray text-[10px]">
                    {TYPE_LABELS[notif.notification_type] || notif.notification_type}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {!notif.read && (
                  <button
                    onClick={() => markRead(notif.id)}
                    className="btn btn-outline py-1 px-3 text-xs shrink-0 gap-1"
                  >
                    <Check size={12} /> Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="btn btn-danger p-1.5 text-xs shrink-0"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && (data.next || data.previous) && (
        <div className="flex justify-center gap-2">
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
      )}

      {/* Notification Details Modal (Mounted in Portal to bypass container transformations) */}
      {mounted && selectedNotification && createPortal(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNotification(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{TYPE_ICONS[selectedNotification.notification_type] || "🔔"}</span>
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">{selectedNotification.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 text-lg border-none bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              <span className="badge badge-gray text-xs">
                {TYPE_LABELS[selectedNotification.notification_type] || selectedNotification.notification_type}
              </span>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedNotification.message}</p>
            </div>
            
            <div className="text-xs text-gray-400 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span>Timestamp: {new Date(selectedNotification.created_at).toLocaleString()}</span>
              <button
                onClick={() => setSelectedNotification(null)}
                className="btn btn-primary py-1.5 px-4 text-xs text-white border-none cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
