"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Menu, User, Lock } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import { verifySession, logout, hasPermission } from "@/lib/admin/auth";
import { api } from "@/lib/admin/api";

const routePermissions: Record<string, string> = {
  "/admin/dashboard/properties": "core.view_property",
  "/admin/dashboard/property-types": "core.view_propertytype",
  "/admin/dashboard/service-types": "core.view_servicetype",
  "/admin/dashboard/property-enquiries": "core.view_propertyenquiry",
  "/admin/dashboard/service-enquiries": "core.view_serviceenquiry",
  "/admin/dashboard/contact-messages": "core.view_contactmessage",
  "/admin/dashboard/media": "core.view_mediaasset",
  "/admin/dashboard/notifications": "core.view_adminnotification",
  "/admin/dashboard/audit-log": "core.view_auditlog",
  "/admin/dashboard/users": "auth.view_user",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let intervalId: any;

    const initializeSession = async () => {
      const user = await verifySession();
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      // Default access to true for verified staff/superusers
      if (user.is_staff || user.is_superuser) {
        setHasAccess(true);
        setUsername(user.username || "Staff User");
      }

      let cachedUsername = user.username || "";
      const cachedProfileStr = sessionStorage.getItem("mabel_user_profile");
      if (cachedProfileStr) {
        try {
          const profile = JSON.parse(cachedProfileStr);
          cachedUsername = profile.username || cachedUsername;
          if (cachedUsername) {
            setUsername(cachedUsername);
          }
        } catch {}
      }

      const fetchStats = async () => {
        try {
          const stats = await api.get<any>("/api/dashboard/stats/");
          setUnreadCount(stats.unread_notifications || 0);
        } catch (err) {
          console.error("Failed to load layout stats:", err);
        }
      };

      const fetchProfile = async () => {
        try {
          const profile = await api.get<any>("/api/users/me/");
          sessionStorage.setItem("mabel_user_profile", JSON.stringify(profile));
          const finalUsername = profile.username || user.username || "Staff User";
          setUsername(finalUsername);
          if (profile.is_staff || profile.is_superuser) {
            setHasAccess(true);
          }
        } catch (err) {
          console.error("Failed to load user permissions profile:", err);
          // If authenticated user is staff/superuser, preserve access
          if (user.is_staff || user.is_superuser) {
            setHasAccess(true);
          }
        }
      };

      // Execute in parallel without blocking rendering
      Promise.allSettled([fetchStats(), fetchProfile()]);

      // Poll stats every 30 seconds
      intervalId = setInterval(fetchStats, 30000);
    };

    initializeSession();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [router]);

  useEffect(() => {
    if (username) {
      const match = Object.keys(routePermissions).find(route => pathname.startsWith(route));
      const requiredPermission = match ? routePermissions[match] : null;
      if (requiredPermission) {
        setHasAccess(hasPermission(requiredPermission));
      } else {
        setHasAccess(true);
      }
    }
  }, [pathname, username]);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <a
              href="/admin/dashboard/notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </a>

            {/* User info */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-navy-light flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--color-navy)" }}>
                {username ? username[0].toUpperCase() : "A"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {username || "Administrator"}
                </p>
                <p className="text-xs text-gray-400">Staff</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content fade-in">
          {username === "" || hasAccess === null ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : hasAccess === false ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-red-950/20 border border-red-800/30 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-950/10">
                <Lock className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
              <p className="text-gray-400 max-w-md mb-6">
                Your account does not possess the required permission to access this management view. Please contact your system administrator to adjust your role assignments.
              </p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
