"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface PropertyEnquiryProps {
  propertyTitle: string;
}

export default function PropertyEnquiry({ propertyTitle }: PropertyEnquiryProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="luxury-card p-6">
      <h3 className="font-heading text-xl text-navy dark:text-white mb-4">
        Property Enquiry
      </h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
        />
        <input
          type="email"
          placeholder="Email Address"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold"
        />
        <input
          type="text"
          value={propertyTitle}
          readOnly
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-soft dark:bg-navy/20 text-sm text-navy/60 dark:text-white/60"
        />
        <textarea
          placeholder="Your Message"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold resize-none"
        />
        <button type="submit" className="btn-gold w-full text-sm !py-2.5">
          <Send size={14} />
          {submitted ? "Enquiry Sent!" : "Send Enquiry"}
        </button>
      </div>
    </form>
  );
}
