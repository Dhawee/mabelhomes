"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Property } from "@/types";
import PropertyForm from "@/components/PropertyForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function EditPropertyPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Property>(`/api/properties/${slug}/`)
      .then((data) => {
        setProperty(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load property.");
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (formData: any) => {
    setSaving(true);
    try {
      await api.patch(`/api/properties/${slug}/`, formData);
      alert("Property updated successfully!");
      router.push(`/dashboard/properties/${slug}`);
    } catch (err: any) {
      alert(err.message || "Failed to save property.");
    } finally {
      setSaving(false);
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
    <PropertyForm
      title={`Edit Property: ${property.title}`}
      initialData={property}
      onSubmit={handleSubmit}
      loading={saving}
    />
  );
}
