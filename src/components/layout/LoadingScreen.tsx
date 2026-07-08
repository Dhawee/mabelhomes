"use client";

import { useState, useEffect } from "react";
import Logo from "@/components/ui/Logo";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const removeTimer = setTimeout(() => setLoading(false), 2400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-navy flex flex-col items-center justify-center transition-opacity duration-[600ms] ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="text-center animate-fade-up">
        <Logo href={undefined} width={220} height={72} priority className="mx-auto mb-8" />
        <div className="w-48 h-[1px] bg-white/20 mx-auto overflow-hidden">
          <div className="h-full bg-gold animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}
