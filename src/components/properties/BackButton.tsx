"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface BackButtonProps {
  fallback?: string;
  className?: string;
}

export default function BackButton({ fallback = "/properties", className = "" }: BackButtonProps) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasNextHistory = window.history.state && window.history.state.idx > 0;
      const isSameOriginReferrer = !!(document.referrer && document.referrer.startsWith(window.location.origin));
      setCanGoBack(!!(hasNextHistory || isSameOriginReferrer));
    }
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-sm font-medium text-navy/70 dark:text-white/70 hover:text-gold dark:hover:text-gold transition-colors cursor-pointer bg-transparent border-none p-0 ${className}`}
      type="button"
    >
      <ArrowLeft size={16} /> Back to previous page
    </button>
  );
}
