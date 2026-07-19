"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ArrowLeft,
  Edit,
  Eye,
  EyeOff,
  Star,
  Heart,
  Trash2,
  Calendar,
  Layers,
  MapPin,
  Maximize,
  Bed,
  Bath,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatAdminPrice } from "@/lib/utils";
import type { Property, PropertyEnquiry } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function PropertyDetailsPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [enquiries, setEnquiries] = useState<PropertyEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const prop = await api.get<Property>(`/api/properties/${slug}/`);
        setProperty(prop);

        // Fetch enquiries for this property
        const enqs = await api.get<{ results: PropertyEnquiry[] }>(
          `/api/property-enquiries/?search=${slug}`
        );
        setEnquiries(enqs.results || []);
      } catch (err: any) {
        setError(err.message || "Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  const toggleVisibility = async () => {
    if (!property) return;
    try {
      const updated = await api.post<any>(`/api/properties/${slug}/toggle_visibility/`, {});
      setProperty((prev: any) => prev ? { ...prev, is_visible: updated.is_visible } : null);
    } catch (err: any) {
      alert(err.message || "Failed to update visibility.");
    }
  };

  const toggleFeatured = async () => {
    if (!property) return;
    try {
      const updated = await api.post<any>(`/api/properties/${slug}/toggle_featured/`, {});
      setProperty((prev: any) => prev ? { ...prev, featured: updated.featured } : null);
    } catch (err: any) {
      alert(err.message || "Failed to update featured status.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to soft-delete this property?")) return;
    try {
      await api.delete(`/api/properties/${slug}/`);
      alert("Property soft-deleted successfully.");
      router.push("/dashboard/properties");
    } catch (err: any) {
      alert(err.message || "Failed to delete property.");
    }
  };

  const handleDuplicate = async () => {
    try {
      const duplicated = await api.post<Property>(`/api/properties/${slug}/duplicate/`, {});
      alert("Property duplicated successfully!");
      router.push(`/dashboard/properties/${duplicated.slug}`);
    } catch (err: any) {
      alert(err.message || "Failed to duplicate property.");
    }
  };

  const handleArchive = async () => {
    try {
      await api.post(`/api/properties/${slug}/archive/`, {});
      alert("Property archived successfully!");
      const prop = await api.get<Property>(`/api/properties/${slug}/`);
      setProperty(prop);
    } catch (err: any) {
      alert(err.message || "Failed to archive property.");
    }
  };

  const handleRestore = async () => {
    try {
      await api.post(`/api/properties/${slug}/restore/`, {});
      alert("Property restored successfully!");
      const prop = await api.get<Property>(`/api/properties/${slug}/`);
      setProperty(prop);
    } catch (err: any) {
      alert(err.message || "Failed to restore property.");
    }
  };

  const handlePermanentDelete = async () => {
    if (!window.confirm("WARNING: Are you sure you want to PERMANENTLY delete this property? This cannot be undone.")) return;
    try {
      await api.delete(`/api/properties/${slug}/permanent_delete/`);
      alert("Property permanently deleted.");
      router.push("/dashboard/properties");
    } catch (err: any) {
      alert(err.message || "Failed to permanently delete property.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
        ⚠ {error || "Property not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/properties" className="btn btn-outline p-2">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{property.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
              <MapPin size={13} className="text-gold" /> {property.location}, {property.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {property.is_deleted ? (
            <>
              <button onClick={handleRestore} className="btn btn-gold gap-2 text-white">
                🔄 Restore Property
              </button>
              <button onClick={handlePermanentDelete} className="btn btn-danger gap-2">
                <Trash2 size={14} /> Permanent Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleVisibility}
                className={`btn ${property.is_visible ? "btn-outline" : "btn-primary"} gap-2`}
              >
                {property.is_visible ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Publish</>}
              </button>
              <button
                onClick={toggleFeatured}
                className={`btn ${property.featured ? "btn-gold" : "btn-outline"} gap-2`}
              >
                <Star size={14} className={property.featured ? "fill-white" : ""} />
                {property.featured ? "Featured" : "Make Featured"}
              </button>
              <button onClick={handleDuplicate} className="btn btn-outline gap-2">
                👥 Duplicate
              </button>
              {property.status !== "Archived" && (
                <button onClick={handleArchive} className="btn btn-outline gap-2">
                  📦 Archive
                </button>
              )}
              <Link href={`/dashboard/properties/${slug}/edit`} className="btn btn-primary gap-2">
                <Edit size={14} /> Edit
              </Link>
              <button onClick={handleDelete} className="btn btn-danger gap-2">
                <Trash2 size={14} /> Soft Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Cover & Gallery preview */}
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Media Assets</h2>
            {property.images && property.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {property.images.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={img} alt="" className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">No images uploaded.</p>
            )}

            {/* Video List */}
            {property.videos && property.videos.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">Videos</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {property.videos.map((vid: any) => (
                    <div key={vid.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{vid.title || "Video Link"}</p>
                        <p className="text-xs text-gray-400 capitalize">{vid.video_type} Video</p>
                      </div>
                      <a href={vid.video_url || vid.video_src || "#"} target="_blank" rel="noopener noreferrer" className="btn btn-outline py-1 px-3 text-xs">
                        Play
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details & Specs */}
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Property Specs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <Bed size={18} className="text-gold" />
                <div>
                  <p className="text-xs text-gray-400">Bedrooms</p>
                  <p className="text-sm font-bold text-gray-800">{property.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bath size={18} className="text-gold" />
                <div>
                  <p className="text-xs text-gray-400">Bathrooms</p>
                  <p className="text-sm font-bold text-gray-800">{property.bathrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Maximize size={18} className="text-gold" />
                <div>
                  <p className="text-xs text-gray-400">Area (sqft)</p>
                  <p className="text-sm font-bold text-gray-800">{property.sqft.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-gold" />
                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="text-sm font-bold text-gray-800">{property.type}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 text-sm mb-1.5">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </div>

            {property.features && property.features.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-2">Features & Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feat: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md border border-gray-200">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Status & Pricing */}
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Status & Pricing</h2>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Status</span>
              <span className="badge badge-gold">{property.status}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Price</span>
              <span className="text-lg font-bold text-gold">
                {formatAdminPrice(property.price, property.max_price, property.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Likes</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <Heart size={14} className="fill-red-500 text-red-500" />
                {property.likes_count ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Visibility</span>
              <span className={`badge ${property.is_visible ? "badge-success" : "badge-gray"}`}>
                {property.is_visible ? "Visible" : "Hidden"}
              </span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="card card-body space-y-3">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
              <Calendar size={14} /> Timestamps
            </h2>
            <div className="text-xs text-gray-500 space-y-1.5">
              <p>Created: {new Date(property.created_at || "").toLocaleString()}</p>
              <p>Updated: {new Date(property.updated_at || "").toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Enquiries Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Enquiries on this Property</h2>
        </div>
        {enquiries.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr key={enq.id}>
                  <td>{enq.name}</td>
                  <td>{enq.email}</td>
                  <td className="max-w-xs truncate">{enq.message}</td>
                  <td>
                    <span className={`badge ${enq.status === "Pending" ? "badge-warning" : "badge-success"}`}>
                      {enq.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/dashboard/property-enquiries/${enq.id}`} className="btn btn-outline py-1 px-3 text-xs">
                      View Reply
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400 text-sm">
            No enquiries received for this property yet.
          </div>
        )}
      </div>
    </div>
  );
}
