"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { NAV_LINKS } from "@/data/site";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const showScrolled = true;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          showScrolled
            ? "glass-nav shadow-luxury py-3"
            : "bg-transparent py-5"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Logo
            width={140}
            height={46}
            priority
            className={cn(
              "transition-opacity",
              showScrolled ? "opacity-100" : "opacity-95"
            )}
          />

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors hover:text-gold",
                  showScrolled
                    ? "text-navy/80 dark:text-white/80"
                    : "text-white/90"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full transition-colors",
                showScrolled
                  ? "text-navy dark:text-white hover:bg-soft dark:hover:bg-white/10"
                  : "text-white hover:bg-white/10"
              )}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <Link
              href="/contact"
              className="hidden md:inline-flex btn-gold text-sm !px-6 !py-2.5"
            >
              Book Consultation
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              className={cn(
                "lg:hidden p-2 rounded-full transition-colors",
                showScrolled ? "text-navy dark:text-white" : "text-white"
              )}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-navy shadow-luxury-lg transition-transform duration-500",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
            <span className="font-heading text-xl text-navy dark:text-white">
              Menu
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-navy dark:text-white"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col p-6 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-4 text-lg font-medium text-navy dark:text-white border-b border-gray-50 dark:border-white/5 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="btn-gold mt-6 text-center"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
