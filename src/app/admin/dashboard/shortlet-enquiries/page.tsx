"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Calendar, Search, RefreshCw, Printer, Send, Eye, CheckCircle, X, Mail, Trash2 } from "lucide-react";
import { api } from "@/lib/admin/api";
import type { PropertyEnquiry, PaginatedResponse } from "@/types/admin";

export default function ShortletEnquiriesPage() {
  const [data, setData] = useState<PaginatedResponse<PropertyEnquiry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);

  // Detail Modal & Reply states
  const [selectedEnquiry, setSelectedEnquiry] = useState<PropertyEnquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "20",
        listing_type: "shortlet",
        ordering: ordering,
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const result = await api.get<PaginatedResponse<PropertyEnquiry>>(
        `/api/property-enquiries/?${params}`
      );
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load shortlet enquiries.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, ordering]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (enquiryId: number, newStatus: string) => {
    try {
      await api.patch(`/api/property-enquiries/${enquiryId}/`, { status: newStatus });
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus as any });
      }
      load();
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleSendReply = async () => {
    if (!selectedEnquiry || !replyMessage.trim()) return;
    setSendingReply(true);
    setReplyError(null);
    setReplySuccess(null);

    try {
      await api.post(`/api/property-enquiries/${selectedEnquiry.id}/reply/`, {
        subject: replySubject || `Re: Your Shortlet Enquiry for ${selectedEnquiry.property_title}`,
        message: replyMessage,
      });

      setReplySuccess("Reply email dispatched successfully via Resend!");
      setReplyMessage("");
      setSelectedEnquiry({ ...selectedEnquiry, replied: true, status: "Responded" });
      load();
    } catch (err: any) {
      setReplyError(err.message || "Failed to send reply email.");
    } finally {
      setSendingReply(false);
    }
  };

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteEnquiry = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete shortlet enquiry #${id}? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/api/property-enquiries/${id}/`);
      alert(`Shortlet enquiry #${id} deleted successfully.`);
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null);
      }
      load();
    } catch (err: any) {
      alert(err.message || "Failed to delete shortlet enquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  const printSingleEnquiry = (enquiry: PropertyEnquiry) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shortlet Booking Enquiry #${enquiry.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
          .header { border-bottom: 2px solid #c9a84c; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { color: #0f2044; margin: 0 0 5px 0; font-size: 22px; }
          .header p { color: #666; margin: 0; font-size: 13px; }
          .field-group { display: grid; grid-template-columns: 140px 1fr; margin-bottom: 12px; }
          .label { font-weight: bold; color: #0f2044; font-size: 13px; }
          .value { font-size: 14px; }
          .box { background: #f9f9f9; border-left: 4px solid #c9a84c; padding: 15px; margin-top: 20px; font-size: 14px; }
          .footer { margin-top: 40px; border-top: 1px solid #eee; pt-10; text-align: center; color: #888; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Mabel Homes — Shortlet Booking Enquiry #${enquiry.id}</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="field-group"><div class="label">Apartment:</div><div class="value"><strong>${enquiry.property_title}</strong></div></div>
        <div class="field-group"><div class="label">Customer Name:</div><div class="value">${enquiry.name}</div></div>
        <div class="field-group"><div class="label">Email Address:</div><div class="value">${enquiry.email}</div></div>
        <div class="field-group"><div class="label">Phone Number:</div><div class="value">${enquiry.phone}</div></div>
        <div class="field-group"><div class="label">Check-In Date:</div><div class="value">${enquiry.check_in_date || "N/A"}</div></div>
        <div class="field-group"><div class="label">Check-Out Date:</div><div class="value">${enquiry.check_out_date || "N/A"}</div></div>
        <div class="field-group"><div class="label">Number of Guests:</div><div class="value">${enquiry.guests || "N/A"}</div></div>
        <div class="field-group"><div class="label">Current Status:</div><div class="value">${enquiry.status}</div></div>
        <div class="field-group"><div class="label">Date Received:</div><div class="value">${new Date(enquiry.created_at).toLocaleString()}</div></div>

        <div class="box">
          <strong>Customer Message:</strong><br/>
          ${enquiry.message}
        </div>

        <div class="footer">
          Mabel Homes & Investment Limited · Rosebowl Apartments · www.mabelhomes.org
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printBulkReport = () => {
    if (!data?.results.length) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rows = data.results
      .map(
        (item) => `
      <tr>
        <td>#${item.id}</td>
        <td><strong>${item.property_title}</strong></td>
        <td>${item.name}</td>
        <td>${item.phone}<br/><small>${item.email}</small></td>
        <td>In: ${item.check_in_date || "N/A"}<br/>Out: ${item.check_out_date || "N/A"}</td>
        <td>${item.guests || "N/A"}</td>
        <td>${item.status}</td>
        <td>${new Date(item.created_at).toLocaleDateString()}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mabel Homes — Shortlet Enquiries Summary Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #1a1a1a; }
          h1 { color: #0f2044; margin-bottom: 5px; font-size: 20px; }
          p { color: #666; font-size: 12px; margin-top: 0; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
          th { background: #0f2044; color: #fff; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Mabel Homes — Shortlet Booking Enquiries Report</h1>
        <p>Total Shortlet Enquiries: ${data.results.length} | Exported: ${new Date().toLocaleString()}</p>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Apartment</th>
              <th>Customer</th>
              <th>Contact Info</th>
              <th>Dates</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Date Received</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const STATUS_BADGES: Record<string, string> = {
    Pending: "badge-warning",
    Responded: "badge-success",
    Closed: "badge-gray",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-navy" style={{ color: "var(--color-navy)" }} />
            Shortlet Apartment Enquiries
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.count ?? 0} booking enquiries total
          </p>
        </div>
        <div className="page-header-actions">
          <button onClick={printBulkReport} className="btn btn-outline gap-2 py-2 text-sm">
            <Printer size={14} /> Print Summary Report
          </button>

          <button onClick={load} className="btn btn-outline gap-2 py-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card card-body space-y-4">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by apartment name, customer name, email, phone..."
              className="form-input pl-9"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="form-input w-auto"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Responded">Responded</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Sort Order */}
          <select
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
            className="form-input w-auto"
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="name">Customer Name: A-Z</option>
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
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            No shortlet enquiries found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Apartment Name</th>
                    <th>Customer Name</th>
                    <th>Contact Info</th>
                    <th>Check-In / Out</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-semibold text-gray-900 cell-truncate text-sm" title={item.property_title}>
                          {item.property_title}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-gray-800 cell-truncate-sm" title={item.name}>
                          {item.name}
                        </div>
                      </td>
                      <td className="text-xs text-gray-600">
                        <div className="font-medium text-gray-800 cell-truncate-sm" title={item.phone}>{item.phone}</div>
                        <div className="text-gray-400 cell-truncate-sm" title={item.email}>{item.email}</div>
                      </td>
                      <td className="text-xs text-gray-700">
                        <div>In: <span className="font-semibold text-gray-900">{item.check_in_date || "N/A"}</span></div>
                        <div>Out: <span className="font-semibold text-gray-900">{item.check_out_date || "N/A"}</span></div>
                      </td>
                      <td className="text-xs font-semibold text-gray-800">
                        {item.guests ? `${item.guests} Guest${item.guests > 1 ? "s" : ""}` : "N/A"}
                      </td>
                      <td>
                        <select
                          value={item.status}
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                          className={`badge ${STATUS_BADGES[item.status] || "badge-gray"} cursor-pointer font-semibold border-none focus:outline-none`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Responded">Responded</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedEnquiry(item);
                              setReplySubject(`Re: Your Shortlet Enquiry for ${item.property_title}`);
                              setReplyMessage("");
                              setReplySuccess(null);
                              setReplyError(null);
                            }}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-navy"
                            title="View & Reply"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => printSingleEnquiry(item)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-navy"
                            title="Print Record"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteEnquiry(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Shortlet Enquiry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.next || data.previous ? (
              <div className="p-4 border-t flex items-center justify-between text-sm">
                <button
                  disabled={!data.previous}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn btn-outline text-xs px-3 py-1.5 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-gray-500 text-xs">Page {page}</span>
                <button
                  disabled={!data.next}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn btn-outline text-xs px-3 py-1.5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Modal: View Details & Send Reply */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 border-b pb-3">
              <Calendar className="text-gold" size={22} />
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Shortlet Enquiry #{selectedEnquiry.id}
                </h2>
                <p className="text-xs text-gray-500">
                  Received on {new Date(selectedEnquiry.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Enquiry Breakdown */}
            <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm mb-5">
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase block">Apartment</span>
                <span className="font-bold text-gray-900">{selectedEnquiry.property_title}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase block">Customer Name</span>
                <span className="font-bold text-gray-900">{selectedEnquiry.name}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase block">Email Address</span>
                <a href={`mailto:${selectedEnquiry.email}`} className="text-blue-600 hover:underline">
                  {selectedEnquiry.email}
                </a>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase block">Phone Number</span>
                <a href={`tel:${selectedEnquiry.phone}`} className="text-blue-600 hover:underline">
                  {selectedEnquiry.phone}
                </a>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase block">Check-In Date</span>
                <span className="font-bold text-gray-900">{selectedEnquiry.check_in_date || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase block">Check-Out Date</span>
                <span className="font-bold text-gray-900">{selectedEnquiry.check_out_date || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase block">Guests</span>
                <span className="font-bold text-gray-900">{selectedEnquiry.guests || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase block">Status</span>
                <span className={`badge ${STATUS_BADGES[selectedEnquiry.status] || "badge-gray"}`}>
                  {selectedEnquiry.status}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Customer Message
              </label>
              <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-xl text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Reply Form */}
            <div className="border-t pt-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Mail size={16} className="text-gold" /> Dispatch Email Reply (via Resend)
              </h3>

              {replySuccess && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-xs font-medium flex items-center gap-2">
                  <CheckCircle size={16} /> {replySuccess}
                </div>
              )}

              {replyError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                  ⚠ {replyError}
                </div>
              )}

              <div>
                <label className="text-xs text-gray-600 font-semibold block mb-1">Subject</label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 font-semibold block mb-1">Message</label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response to the customer..."
                  className="form-input text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => printSingleEnquiry(selectedEnquiry)}
                  className="btn btn-outline text-xs py-2 gap-2"
                >
                  <Printer size={14} /> Print Detail
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(null)}
                    className="btn btn-outline text-xs py-2"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={sendingReply || !replyMessage.trim()}
                    onClick={handleSendReply}
                    className="btn btn-primary text-xs py-2 gap-2 disabled:opacity-50"
                  >
                    <Send size={14} /> {sendingReply ? "Sending..." : "Send Resend Email"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
