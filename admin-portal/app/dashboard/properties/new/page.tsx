"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import PropertyForm from "@/components/PropertyForm";

export default function NewPropertyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (formData: any) => {
    setSaving(true);
    try {
      const created = await api.post<any>("/api/properties/", formData);
      alert("Property created successfully!");
      router.push(`/dashboard/properties/${created.slug}`);
    } catch (err: any) {
      alert(err.message || "Failed to create property.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PropertyForm
      title="Create New Property"
      onSubmit={handleSubmit}
      loading={saving}
    />
  );
}
