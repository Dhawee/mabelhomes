"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Send, RefreshCw, Trash2 } from "lucide-react";
import { api } from "@/lib/admin/api";
import type { ServiceEnquiry } from "@/types/admin";

interface Reply {
  id: number;
  sender_name: string;
  recipient_email: string;
  subject: string;
  message: string;
  email_delivered: boolean;
  sent_at: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function ServiceEnquiryDetailPage({ params }: Props) {
  const { id } = use(params);
  const [enquiry, setEnquiry] = useState<ServiceEnquiry | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    try {
      const enq = await api.get<ServiceEnquiry>(`/api/service-enquiries/${id}/`);
      setEnquiry(enq);

      const reps = await api.get<Reply[]>(`/api/service-enquiries/${id}/replies/`);
      setReplies(reps);
    } catch (err: any) {
      setError(err.message || "Failed to load enquiry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !enquiry) return;
    setSending(true);

    try {
      await api.post(`/api/service-enquiries/${id}/reply/`, {
        subject: `Re: Enquiry on ${enquiry.service_title}`,
        message: replyText,
      });
      setReplyText("");
      alert("Reply sent successfully via email!");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleMarkResponded = async () => {
    try {
      await api.patch(`/api/service-enquiries/${id}/`, { status: "Responded", replied: true });
      alert("Status updated to Responded.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    }
  };

  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteEnquiry = async () => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete service enquiry #${id}? This action cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/api/service-enquiries/${id}/`);
      alert("Service enquiry deleted successfully.");
      router.push("/admin/dashboard/service-enquiries");
    } catch (err: any) {
      alert(err.message || "Failed to delete service enquiry.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseEnquiry = async () => {
    try {
      await api.patch(`/api/service-enquiries/${id}/`, { status: "Closed" });
      alert("Status updated to Closed.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to close enquiry.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
        ⚠ {error || "Enquiry not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard/service-enquiries" className="btn btn-outline p-2">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Service Enquiry #{enquiry.id}</h1>
            <p className="text-xs text-gray-400">Received on {new Date(enquiry.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {enquiry.status !== "Responded" && (
            <button onClick={handleMarkResponded} className="btn btn-outline text-green-600 border-green-200 hover:bg-green-50 py-2 text-xs">
              Mark Responded
            </button>
          )}
          {enquiry.status !== "Closed" && (
            <button onClick={handleCloseEnquiry} className="btn btn-danger py-2 text-xs">
              Close Enquiry
            </button>
          )}
          <button
            onClick={handleDeleteEnquiry}
            disabled={deleting}
            className="btn btn-danger py-2 text-xs gap-1"
            title="Delete Service Enquiry"
          >
            <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete"}
          </button>
          <button onClick={loadData} className="btn btn-outline p-2" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enquiry content & reply editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Enquiry Content */}
          <div className="card card-body space-y-4">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Client Details</h2>
              <span className={`badge ${enquiry.status === "Pending" ? "badge-warning" : enquiry.status === "Responded" ? "badge-success" : "badge-gray"}`}>
                {enquiry.status}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Client Name</p>
                <p className="font-semibold text-gray-800">{enquiry.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Email Address</p>
                <p className="font-semibold text-blue-600">{enquiry.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Phone Number</p>
                <p className="font-semibold text-gray-800">{enquiry.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Service Type Requested</p>
                <p className="font-semibold text-navy">{enquiry.service_title}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <p className="text-gray-400 text-xs mb-1">Message</p>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {enquiry.message}
              </div>
            </div>
          </div>

          {/* Conversation / Reply Log */}
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
              <MessageSquare size={14} className="text-gold" /> Conversation History ({replies.length} replies)
            </h2>

            {replies.length > 0 ? (
              <div className="space-y-4">
                {replies.map((rep) => (
                  <div key={rep.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-navy">{rep.sender_name}</span>
                      <span className="text-gray-400">{new Date(rep.sent_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Subject: {rep.subject}</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{rep.message}</p>
                    <div className="text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${rep.email_delivered ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {rep.email_delivered ? "Delivered" : "Delivery Failed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic py-2">No replies have been sent to this enquiry yet.</p>
            )}

            {/* Quick Reply Form */}
            {enquiry.status !== "Closed" && (
              <form onSubmit={handleSendReply} className="pt-4 border-t border-gray-100 space-y-3">
                <div>
                  <label className="form-label">Send Email Reply</label>
                  <textarea
                    rows={4}
                    required
                    className="form-input"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to the client..."
                  />
                </div>
                <button type="submit" disabled={sending} className="btn btn-primary w-full gap-2 justify-center py-2.5">
                  <Send size={14} /> {sending ? "Sending Reply..." : "Send Reply"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
