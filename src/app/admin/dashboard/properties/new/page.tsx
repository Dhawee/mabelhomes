"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/admin/api";
import PropertyForm from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false); // Guard against double-click

  const handleSubmit = async (formData: any, tempImages: any[] = [], tempVideos: any[] = []) => {
    // Prevent duplicate submissions
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);

    let created: any = null;

    try {
      // Step 1: Create the property
      created = await api.post<any>("/api/properties/", formData);
      const propertyId = created.id;

      // Step 2: Upload images — collect individual successes/failures (non-fatal)
      const imageFailures: string[] = [];
      for (const img of tempImages) {
        try {
          const imgData = new FormData();
          imgData.append("property", String(propertyId));
          imgData.append("image_upload", img.file);
          imgData.append("order", String(img.order));
          imgData.append("is_primary", String(img.is_primary));
          await api.post("/api/property-images/", imgData);
        } catch (imgErr: any) {
          console.error("Image upload failed:", imgErr);
          imageFailures.push(img.file?.name || "Unknown file");
        }
      }

      // Step 3: Upload videos — also non-fatal
      const videoFailures: string[] = [];
      for (const vid of tempVideos) {
        try {
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
        } catch (vidErr: any) {
          console.error("Video upload failed:", vidErr);
          videoFailures.push(vid.title || "Unknown video");
        }
      }

      // Step 4: Always redirect — property was created successfully.
      // Show a non-blocking warning if some media uploads failed.
      if (imageFailures.length > 0 || videoFailures.length > 0) {
        const failedItems = [...imageFailures, ...videoFailures].join(", ");
        alert(
          `Property created successfully!\n\nNote: Some media files could not be uploaded (${failedItems}). ` +
          `You can add them from the property edit page.`
        );
      }

      router.push(`/admin/dashboard/properties/${created.slug}`);
    } catch (err: any) {
      console.error("Failed to create property:", err);
      // Only rethrow if property creation itself failed (not media uploads)
      if (!created) {
        throw err;
      }
      // If property was created but something else failed, still redirect
      router.push(`/admin/dashboard/properties/${created.slug}`);
    } finally {
      setSaving(false);
      savingRef.current = false;
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
