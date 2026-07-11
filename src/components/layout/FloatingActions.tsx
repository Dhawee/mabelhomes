"use client";

import { ArrowUp, Mail, Phone, PhoneCall, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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

export default function FloatingActions() {
  const [showBackTop, setShowBackTop] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[99] flex flex-col items-end gap-3 select-none">
      {/* Floating Menu Items */}
      <div
        className={cn(
          "flex flex-col items-end gap-4 transition-all duration-300 ease-out origin-bottom",
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-90 pointer-events-none"
        )}
      >
        {/* Give us a call */}
        <a
          href="tel:+2347063711532"
          className="flex items-center gap-3 group cursor-pointer"
        >
          <span className="px-3 py-1.5 bg-[#FF4A4A] text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap transform group-hover:scale-105 transition-all duration-300 font-heading">
            Give us a call!
          </span>
          <div className="w-12 h-12 rounded-full bg-[#FF4A4A] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300">
            <PhoneCall size={18} />
          </div>
        </a>

        {/* Let's chat */}
        <a
          href="https://wa.me/2347063711532"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group cursor-pointer"
        >
          <span className="px-3 py-1.5 bg-[#00E676] text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap transform group-hover:scale-105 transition-all duration-300 font-heading">
            Let's chat!
          </span>
          <div className="w-12 h-12 rounded-full bg-[#00E676] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300">
            <WhatsAppIcon />
          </div>
        </a>

        {/* Email us */}
        <a
          href="mailto:info@mabelhomes.com"
          className="flex items-center gap-3 group cursor-pointer"
        >
          <span className="px-3 py-1.5 bg-[#EA4335] text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap transform group-hover:scale-105 transition-all duration-300 font-heading">
            Email us!
          </span>
          <div className="w-12 h-12 rounded-full bg-[#EA4335] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300">
            <Mail size={18} />
          </div>
        </a>
      </div>

      {/* Action Trigger Buttons Stack (Horizontal) */}
      <div className="flex items-center gap-3 mt-1">
        {/* Back to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={cn(
            "w-12 h-12 bg-navy dark:bg-white text-white dark:text-navy rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer",
            showBackTop ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
          )}
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>

        {/* Main Dialer Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer",
            isOpen ? "bg-navy dark:bg-white dark:text-navy" : "bg-[#4CAF50] hover:bg-[#43A047]"
          )}
          aria-label="Contact actions menu"
        >
          {isOpen ? (
            <X size={24} className="animate-spin-once" />
          ) : (
            <Phone size={24} className="animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}
