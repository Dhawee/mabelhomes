"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import PropertyForm from "@/components/PropertyForm";

export default function NewPropertyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (formData: any, tempImages: any[] = [], tempVideos: any[] = []) => {
    setSaving(true);
    try {
      const created = await api.post<any>("/api/properties/", formData);
      const propertyId = created.id;

      // Upload temp images
      for (const img of tempImages) {
        const imgData = new FormData();
        imgData.append("property", String(propertyId));
        imgData.append("image_upload", img.file);
        imgData.append("order", String(img.order));
        imgData.append("is_primary", String(img.is_primary));
        await api.post("/api/property-images/", imgData);
      }

      // Upload temp videos
      for (const vid of tempVideos) {
        if (vid.video_type === "upload") {
          const vidData = new FormData();
          vidData.append("property", String(propertyId));
          vidData.append("video_upload", vid.file!);
          vidData.append("title", vid.title);
          vidData.append("video_type", "upload");
          vidData.append("order", String(vid.order));
          vidData.append("is_primary", String(vid.is_primary));
          await api.post("/api/property-videos/", vidData);
        } else {
          const vidData = {
            property: propertyId,
            video_url: vid.video_url,
            title: vid.title,
            video_type: vid.video_type,
            order: vid.order,
            is_primary: vid.is_primary,
          };
          await api.post("/api/property-videos/", vidData);
        }
      }

      alert("Property created successfully!");
      router.push(`/dashboard/properties/${created.slug}`);
    } catch (err: any) {
      console.error("Failed to create property:", err);
      alert("Unable to save property. Please check that all required fields are filled correctly and try again.");
      throw err;
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
