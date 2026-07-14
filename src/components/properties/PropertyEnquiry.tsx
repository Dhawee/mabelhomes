"use client";

import { useState } from "react";
import { Send, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/config";

interface PropertyEnquiryProps {
  propertyTitle: string;
  propertyId: string | number;
}

export default function PropertyEnquiry({ propertyTitle, propertyId }: PropertyEnquiryProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/property-enquiries/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property: propertyId,
          name,
          email,
          phone,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry. Check fields and try again.");
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="luxury-card p-6">
      <h3 className="font-heading text-xl text-navy dark:text-white mb-4">
        Property Enquiry
      </h3>
      
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {submitted && (
        <div className="p-3 mb-4 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/30 text-center font-medium">
          Enquiry submitted successfully! We will get in touch shortly.
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold disabled:opacity-50"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold disabled:opacity-50"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold disabled:opacity-50"
        />
        <input
          type="text"
          value={propertyTitle}
          readOnly
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-soft dark:bg-navy/20 text-sm text-navy/60 dark:text-white/60 focus:outline-none"
        />
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={loading}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold resize-none disabled:opacity-50"
        />
        <button type="submit" disabled={loading} className="btn-gold w-full text-sm !py-2.5 flex items-center justify-center gap-2">
          <Send size={14} />
          {loading ? "Sending..." : "Send Enquiry"}
        </button>
      </div>
    </form>
  );
}
