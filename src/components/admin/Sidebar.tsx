"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Users,
  MessageSquare,
  Bell,
  ImageIcon,
  FileText,
  LogOut,
  Building2,
  Phone,
  Layers,
  Settings,
  Calendar,
} from "lucide-react";
import { logout } from "@/lib/admin/auth";

const navSections = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Properties",
    items: [
      { label: "All Properties", href: "/admin/dashboard/properties", icon: Home },
      { label: "Property Types", href: "/admin/dashboard/property-types", icon: Layers },
    ],
  },
  {
    title: "Enquiries",
    items: [
      { label: "Property Enquiries", href: "/admin/dashboard/property-enquiries", icon: MessageSquare },
      { label: "Shortlet Enquiries", href: "/admin/dashboard/shortlet-enquiries", icon: Calendar },
      { label: "Service Enquiries", href: "/admin/dashboard/service-enquiries", icon: Building2 },
      { label: "Contact Messages", href: "/admin/dashboard/contact-messages", icon: Phone },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Media Library", href: "/admin/dashboard/media", icon: ImageIcon },
      { label: "Notifications", href: "/admin/dashboard/notifications", icon: Bell },
      { label: "Audit Log", href: "/admin/dashboard/audit-log", icon: FileText },
      { label: "Users", href: "/admin/dashboard/users", icon: Users },
    ],
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center shrink-0">
              <span className="text-base">🏠</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">Mabel Homes</p>
              <p className="text-white/40 text-xs">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/50 hover:text-white p-1 rounded hover:bg-white/10 transition shrink-0"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {navSections.map((section) => (
            <div key={section.title} className="mb-1">
              <p className="px-4 py-1.5 text-white/30 text-[10px] font-semibold uppercase tracking-widest">
                {section.title}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${active ? "active" : ""}`}
                    onClick={onClose}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => logout()}
            className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
