"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, Globe, MapPin, Send, AlertCircle } from "lucide-react";
import { SITE } from "@/data/site";
import { API_BASE_URL } from "@/config";
import FadeIn from "@/components/ui/FadeIn";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width="18"
    height="18"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ContactForm() {
  const [services, setServices] = useState<{ id: number; title: string; slug: string }[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services/`)
      .then((res) => res.json())
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load services:", err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    try {
      let res: Response;

      if (form.service) {
        // Submit as a service enquiry when a service category is selected
        res = await fetch(`${API_BASE_URL}/api/service-enquiries/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_type: form.service,
            name: form.name,
            email: form.email,
            phone: form.phone,
            message: form.message,
          }),
        });
      } else {
        // Submit as a general contact message
        res = await fetch(`${API_BASE_URL}/api/contact-messages/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            subject: "General Contact Enquiry",
            message: form.message,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }

      setSubmitted(true);
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <FadeIn direction="left">
        <div className="space-y-8">
          <div className="luxury-card p-8">
            <h2 className="font-heading text-2xl text-navy dark:text-white mb-6">
              Contact Information
            </h2>
            <div className="space-y-5">
              {SITE.phone.map((phone) => {
                const isWhatsApp = phone.includes("706");
                return (
                  <a
                    key={phone}
                    href={isWhatsApp ? `https://wa.me/${phone.replace(/[\s+]/g, "")}` : `tel:${phone.replace(/[\s+]/g, "")}`}
                    target={isWhatsApp ? "_blank" : undefined}
                    rel={isWhatsApp ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-4 text-navy/70 dark:text-white/70 hover:text-gold transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      {isWhatsApp ? (
                        <WhatsAppIcon />
                      ) : (
                        <Phone size={18} />
                      )}
                    </div>
                    {phone}
                  </a>
                );
              })}
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-4 text-navy/70 dark:text-white/70 hover:text-gold transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Mail size={18} className="text-gold" />
                </div>
                {SITE.email}
              </a>
              <a
                href={`https://${SITE.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-navy/70 dark:text-white/70 hover:text-gold transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Globe size={18} className="text-gold" />
                </div>
                {SITE.website}
              </a>
              <div className="flex items-center gap-4 text-navy/70 dark:text-white/70">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <MapPin size={18} className="text-gold" />
                </div>
                {SITE.address}
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden h-72">
            <iframe
              title="Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.44600903447!2d3.3792057!3d6.5243793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf48d7c394a69%3A0x103f281ac141c050!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </FadeIn>

      <FadeIn direction="right" delay={0.2}>
        <form onSubmit={handleSubmit} className="luxury-card p-8 md:p-10">
          <h2 className="font-heading text-2xl text-navy dark:text-white mb-6">
            Send a Message
          </h2>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted && (
            <div className="p-3 mb-4 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/30 text-center font-medium">
              Message sent successfully! We will get in touch shortly.
            </div>
          )}

          <div className="space-y-5">
            <input
              type="text"
              placeholder="Your Name"
              required
              disabled={loading}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold disabled:opacity-50"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              disabled={loading}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold disabled:opacity-50"
            />
            <input
              type="email"
              placeholder="Email Address"
              required
              disabled={loading}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold disabled:opacity-50"
            />
            <select
              required
              disabled={loading}
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold appearance-none disabled:opacity-50"
            >
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s.id} value={s.slug}>{s.title}</option>
              ))}
              {services.length === 0 && (
                <>
                  <option value="buying-property">Buying Property</option>
                  <option value="selling-property">Selling Property</option>
                  <option value="investment-consultation">Investment Consultation</option>
                  <option value="property-marketing">Property Marketing</option>
                  <option value="property-documentation">Property Documentation</option>
                  <option value="property-inspection">Property Inspection</option>
                  <option value="property-management">Property Management</option>
                  <option value="shortlet-apartments">Shortlet Apartments</option>
                </>
              )}
            </select>
            <textarea
              placeholder="Your Message"
              rows={5}
              required
              disabled={loading}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy/30 text-sm focus:outline-none focus:border-gold resize-none disabled:opacity-50"
            />
            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
              <Send size={16} />
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
