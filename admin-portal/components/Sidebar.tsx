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
} from "lucide-react";
import { logout } from "@/lib/auth";

const navSections = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Properties",
    items: [
      { label: "All Properties", href: "/dashboard/properties", icon: Home },
      { label: "Property Types", href: "/dashboard/property-types", icon: Layers },
    ],
  },
  {
    title: "Enquiries",
    items: [
      { label: "Property Enquiries", href: "/dashboard/property-enquiries", icon: MessageSquare },
      { label: "Service Enquiries", href: "/dashboard/service-enquiries", icon: Building2 },
      { label: "Contact Messages", href: "/dashboard/contact-messages", icon: Phone },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Media Library", href: "/dashboard/media", icon: ImageIcon },
      { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { label: "Audit Log", href: "/dashboard/audit-log", icon: FileText },
      { label: "Users", href: "/dashboard/users", icon: Users },
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
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-400/20 flex items-center justify-center shrink-0">
            <span className="text-lg">🏠</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Mabel Homes</p>
            <p className="text-white/40 text-xs">Admin Portal v2</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-white/50 hover:text-white p-1 rounded hover:bg-white/10 transition"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="mb-2">
            <p className="px-5 py-2 text-white/30 text-[10px] font-semibold uppercase tracking-widest">
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
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => logout()}
          className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
