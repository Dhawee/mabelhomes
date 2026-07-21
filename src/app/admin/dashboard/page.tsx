"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Heart,
  MessageSquare,
  Bell,
  Eye,
  Star,
  TrendingUp,
  Users,
  Phone,
  Building2,
  Clock,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/admin/api";
import type { DashboardStats, AdminNotification } from "@/types/admin";

interface RecentEnquiry {
  id: number;
  name: string;
  email: string;
  status: "Pending" | "Responded" | "Closed";
  created_at: string;
  property_title?: string;
  service_title?: string;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  href?: string;
  sublabel?: string;
}

function StatCard({ label, value, icon, color = "#0f2044", href, sublabel }: StatCardProps) {
  const content = (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
          style={{ background: color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-extrabold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
      {sublabel && <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:no-underline">
        {content}
      </Link>
    );
  }
  return content;
}

function EnquiryRow({ enq, type }: { enq: RecentEnquiry; type: string }) {
  const statusColors: Record<string, string> = {
    Pending: "badge-warning",
    Responded: "badge-success",
    Closed: "badge-gray",
  };

  return (
    <tr>
      <td>
        <div className="font-medium text-gray-900">{enq.name}</div>
        <div className="text-xs text-gray-400">{enq.email}</div>
      </td>
      <td>
        <div className="text-sm text-gray-600 cell-truncate">
          {enq.property_title || enq.service_title || "General"}
        </div>
      </td>
      <td>
        <span className={`badge ${statusColors[enq.status] || "badge-gray"}`}>
          {enq.status}
        </span>
      </td>
      <td className="text-xs text-gray-400 whitespace-nowrap">
        {new Date(enq.created_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td>
        <Link
          href={`/dashboard/${type === "property" ? "property-enquiries" : "service-enquiries"}/${enq.id}`}
          className="btn btn-outline py-1 px-3 text-xs"
        >
          View
        </Link>
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [propertyEnquiries, setPropertyEnquiries] = useState<RecentEnquiry[]>([]);
  const [serviceEnquiries, setServiceEnquiries] = useState<RecentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await Promise.allSettled([
          api.get<DashboardStats>("/api/dashboard/stats/"),
          api.get<{ results: AdminNotification[] }>("/api/notifications/?read=false&page_size=5"),
          api.get<{ results: RecentEnquiry[] }>("/api/property-enquiries/?page_size=5&ordering=-created_at"),
          api.get<{ results: RecentEnquiry[] }>("/api/service-enquiries/?page_size=5&ordering=-created_at"),
        ]);

        if (results[0].status === "fulfilled") {
          setStats(results[0].value);
        } else {
          console.error("Failed to load dashboard stats:", results[0].reason);
        }

        if (results[1].status === "fulfilled") {
          setNotifications(results[1].value.results || []);
        } else {
          console.error("Failed to load notifications:", results[1].reason);
        }

        if (results[2].status === "fulfilled") {
          setPropertyEnquiries(results[2].value.results || []);
        } else {
          console.error("Failed to load property enquiries:", results[2].reason);
        }

        if (results[3].status === "fulfilled") {
          setServiceEnquiries(results[3].value.results || []);
        } else {
          console.error("Failed to load service enquiries:", results[3].reason);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" style={{ width: 32, height: 32, borderTopColor: "#0f2044" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
        ⚠ {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Mabel Homes at a glance</p>
        </div>
        <Link href="/admin/dashboard/properties/new" className="btn btn-primary">
          + Add Property
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Properties"
          value={stats?.total_properties ?? 0}
          icon={<Home size={20} />}
          color="#0f2044"
          href="/admin/dashboard/properties"
        />
        <StatCard
          label="Visible"
          value={stats?.visible_properties ?? 0}
          icon={<Eye size={20} />}
          color="#059669"
          sublabel="on frontend"
        />
        <StatCard
          label="Featured"
          value={stats?.featured_properties ?? 0}
          icon={<Star size={20} />}
          color="#c9a84c"
        />
        <StatCard
          label="Total Likes"
          value={stats?.total_likes ?? 0}
          icon={<Heart size={20} />}
          color="#e74c3c"
        />
        <StatCard
          label="Unread Alerts"
          value={stats?.unread_notifications ?? 0}
          icon={<Bell size={20} />}
          color="#7c3aed"
          href="/admin/dashboard/notifications"
        />
      </div>

      {/* Enquiries Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Property Enquiries"
          value={stats?.property_enquiries ?? 0}
          icon={<MessageSquare size={20} />}
          color="#2563eb"
          href="/admin/dashboard/property-enquiries"
        />
        <StatCard
          label="Service Enquiries"
          value={stats?.service_enquiries ?? 0}
          icon={<Building2 size={20} />}
          color="#0891b2"
          href="/admin/dashboard/service-enquiries"
        />
        <StatCard
          label="Contact Messages"
          value={stats?.contact_messages ?? 0}
          icon={<Phone size={20} />}
          color="#8b5cf6"
          href="/admin/dashboard/contact-messages"
        />
      </div>

      {/* Lower panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Property Enquiries */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-500" />
              Recent Property Enquiries
            </h2>
            <Link href="/admin/dashboard/property-enquiries" className="text-xs text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            {propertyEnquiries.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Property</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {propertyEnquiries.map((enq) => (
                    <EnquiryRow key={enq.id} enq={enq} type="property" />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                No property enquiries yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Service Enquiries */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Building2 size={14} className="text-cyan-500" />
              Recent Service Enquiries
            </h2>
            <Link href="/admin/dashboard/service-enquiries" className="text-xs text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            {serviceEnquiries.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {serviceEnquiries.map((enq) => (
                    <EnquiryRow key={enq.id} enq={enq} type="service" />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                No service enquiries yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unread Notifications */}
      {notifications.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Bell size={14} className="text-violet-500" />
              Unread Notifications
            </h2>
            <Link href="/admin/dashboard/notifications" className="text-xs text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div key={notif.id} className="px-5 py-3 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{notif.title}</p>
                  <p className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
