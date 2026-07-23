"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/admin/api";
import type { Property } from "@/types/admin";

// Load MapPicker dynamically to prevent SSR issues with Leaflet
const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <div className="h-80 w-full bg-gray-100 rounded-xl flex items-center justify-center text-sm text-gray-400">Loading Map...</div>,
});

interface PropertyTypeChoice {
  id: number;
  name: string;
}

function getVideoThumbnail(video: any): string | null {
  if (video.video_type === "youtube" && video.video_url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = video.video_url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
    }
  }
  return null;
}

interface PropertyFormProps {
  initialData?: Partial<Property>;
  onSubmit: (data: any, tempImages?: any[], tempVideos?: any[]) => Promise<void>;
  loading: boolean;
  title: string;
}

export default function PropertyForm({
  initialData = {},
  onSubmit,
  loading,
  title,
}: PropertyFormProps) {
  const [isRange, setIsRange] = useState<boolean>(!!initialData.max_price);
  const [currency, setCurrency] = useState<"NGN" | "USD">(
    (initialData.currency as "NGN" | "USD") || "NGN"
  );
  const [form, setForm] = useState({
    title: initialData.title ?? "",
    description: initialData.description ?? "",
    price: initialData.price ?? "",
    max_price: (initialData.max_price ?? "") as number | "",
    bedrooms: initialData.bedrooms ?? "",
    bathrooms: initialData.bathrooms ?? "",
    sqft: initialData.sqft ?? "",
    status: (initialData.status || "For Sale") as "For Sale" | "For Rent" | "Sold" | "Under Offer" | "Shortlet" | "Archived",
    listing_type: (initialData.listing_type || (initialData.status === "Shortlet" ? "shortlet" : "property")) as "property" | "shortlet",
    property_type: initialData.property_type ?? "",
    featured: initialData.featured ?? false,
    luxury: initialData.luxury ?? false,
    is_visible: initialData.is_visible !== undefined ? initialData.is_visible : true,
    location: initialData.location ?? "",
    city: initialData.city ?? "",
    state: initialData.state ?? "",
    country: initialData.country ?? "",
    latitude: initialData.latitude ?? 6.45,
    longitude: initialData.longitude ?? 3.5,
    year_built: initialData.year_built ?? "",
    parking: initialData.parking ?? "",
    features_input: (initialData.features || []).join(", "),
    amenities_input: (initialData.amenities || []).join(", "),
    seo_title: initialData.seo_title || "",
    seo_description: initialData.seo_description || "",
    seo_keywords: initialData.seo_keywords || "",
  });

  const [types, setTypes] = useState<PropertyTypeChoice[]>([]);
  const [fetchingTypes, setFetchingTypes] = useState(true);

  // Gallery & Video States
  const [images, setImages] = useState<any[]>(initialData.images_details || []);
  const [videos, setVideos] = useState<any[]>(initialData.videos || []);
  const [tempImages, setTempImages] = useState<any[]>([]);
  const [tempVideos, setTempVideos] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const activeImages = initialData.id ? images : tempImages;
  const activeVideos = initialData.id ? videos : tempVideos;

  // Video Form States
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoType, setVideoType] = useState<"upload" | "youtube" | "vimeo">("youtube");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);

  useEffect(() => {
    api.get<any>("/api/property-types/")
      .then((res) => {
        const choiceList = Array.isArray(res) ? res : res.results || [];
        setTypes(choiceList);
        setFetchingTypes(false);

        // If creating a new property, set default type to the first type choice
        if (!initialData.property_type && choiceList.length > 0) {
          setForm((f) => ({ ...f, property_type: choiceList[0].id }));
        }
      })
      .catch(() => setFetchingTypes(false));
  }, [initialData.property_type]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Client-side validation
    const clientErrors: Record<string, string[]> = {};
    if (!form.title?.trim()) clientErrors.title = ["Property Title is required."];
    if (!form.description?.trim()) clientErrors.description = ["Description is required."];
    if (!form.price || Number(form.price) <= 0) {
      clientErrors.price = [isRange ? "Minimum Price must be a positive number." : "Price must be greater than 0."];
    }
    if (isRange) {
      if (!form.max_price || Number(form.max_price) <= 0) {
        clientErrors.max_price = ["Maximum Price must be a positive number."];
      } else if (Number(form.max_price) <= Number(form.price)) {
        clientErrors.max_price = ["Maximum Price must be greater than the Minimum Price."];
      }
    }
    if (!form.property_type) clientErrors.property_type = ["Property Type is required."];
    if (!form.city?.trim()) clientErrors.city = ["City is required."];
    if (!form.location?.trim()) clientErrors.location = ["Address / Neighborhood is required."];

    if (Object.keys(clientErrors).length > 0) {
      setValidationErrors(clientErrors);
      // Focus and scroll to first error
      const firstErrorField = Object.keys(clientErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      max_price: isRange && form.max_price !== "" ? Number(form.max_price) : null,
      currency: currency,
      bedrooms: Number(form.bedrooms || 0),
      bathrooms: Number(form.bathrooms || 0),
      sqft: Number(form.sqft || 0),
      status: form.status,
      listing_type: form.listing_type,
      property_type: Number(form.property_type),
      featured: form.featured,
      luxury: form.luxury,
      is_visible: form.is_visible,
      location: form.location,
      city: form.city,
      state: form.state || "",
      country: form.country || "",
      latitude: Number(Number(form.latitude || 6.5244).toFixed(6)),
      longitude: Number(Number(form.longitude || 3.3792).toFixed(6)),
      year_built: form.year_built !== "" && form.year_built !== null ? Number(form.year_built) : null,
      parking: form.parking !== "" && form.parking !== null ? Number(form.parking) : null,
      features: (form.features_input || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0),
      amenities: (form.amenities_input || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0),
      seo_title: form.seo_title || "",
      seo_description: form.seo_description || "",
      seo_keywords: form.seo_keywords || "",
    };

    try {
      await onSubmit(payload, tempImages, tempVideos);
    } catch (err: any) {
      console.error("Failed to save property:", err);
      if (err.data) {
        setValidationErrors(err.data);
        const firstErrorField = Object.keys(err.data)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }
    }
  };

  const handleMapChange = (data: { lat: number; lng: number; address: string; state?: string; country?: string }) => {
    setForm((f) => ({
      ...f,
      latitude: data.lat,
      longitude: data.lng,
      location: data.address,
      state: data.state || f.state,
      country: data.country || f.country,
    }));
  };

  // Image Upload Handler
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (initialData.id) {
      setImageError(null);
      setUploadProgress("Uploading...");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("property", String(initialData.id));
        formData.append("image_upload", file);
        formData.append("order", String(images.length + i + 1));

        try {
          setUploadProgress(`Uploading (${i + 1}/${files.length})...`);
          const res = await api.post<any>("/api/property-images/", formData);
          setImages((prev) => [...prev, res]);
        } catch (err: any) {
          console.error("Image upload failed:", err);
          setImageError(`Image upload failed for "${file.name}". Please try again.`);
        }
      }
      setUploadProgress(null);
    } else {
      // Offline store for new unsaved property
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const previewUrl = URL.createObjectURL(file);
        const tempId = "temp_img_" + Math.random().toString(36).substr(2, 9);
        setTempImages((prev) => [
          ...prev,
          {
            id: tempId,
            file: file,
            image_optimized: previewUrl,
            image_url: previewUrl,
            order: prev.length + 1,
            is_primary: prev.length === 0,
          },
        ]);
      }
    }
  };

  // Drag and Drop DragOver Handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Drag and Drop Drop Handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = async (imageId: any) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    if (initialData.id) {
      try {
        await api.delete(`/api/property-images/${imageId}/`);
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      } catch (err: any) {
        console.error("Failed to delete image:", err);
        alert("Unable to delete image. Please try again.");
      }
    } else {
      setTempImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };

  const handleSetCoverImage = async (imageId: any) => {
    if (initialData.id) {
      try {
        await api.patch<any>(`/api/property-images/${imageId}/`, { is_primary: true });
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_primary: img.id === imageId,
          }))
        );
      } catch (err: any) {
        console.error("Failed to set cover image:", err);
        alert("Unable to set cover image. Please try again.");
      }
    } else {
      setTempImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
      setTempVideos((prev) =>
        prev.map((vid) => ({
          ...vid,
          is_primary: false,
        }))
      );
    }
  };

  const handleImageOrderChange = async (imageId: any, order: number) => {
    if (initialData.id) {
      try {
        await api.patch(`/api/property-images/${imageId}/`, { order });
        setImages((prev) =>
          prev.map((img) => (img.id === imageId ? { ...img, order } : img))
        );
      } catch (err: any) {
        console.error("Failed to update image order:", err);
      }
    } else {
      setTempImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, order } : img))
      );
    }
  };

  // Video Handlers
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (videoType === "upload" && !videoFile) {
      alert("Please select a video file first.");
      return;
    }
    if (videoType !== "upload" && !videoUrlInput.trim()) {
      alert("Please enter a video URL.");
      return;
    }

    if (initialData.id) {
      setVideoUploading(true);
      try {
        if (videoType === "upload") {
          const formData = new FormData();
          formData.append("property", String(initialData.id));
          formData.append("video_upload", videoFile!);
          formData.append("title", videoTitle || videoFile!.name);
          formData.append("video_type", "upload");
          formData.append("order", String(videos.length + 1));

          const res = await api.post<any>("/api/property-videos/", formData);
          setVideos((prev) => [...prev, res]);
          setVideoFile(null);
        } else {
          const payload = {
            property: initialData.id,
            video_url: videoUrlInput,
            title: videoTitle || `${videoType === "youtube" ? "YouTube" : "Vimeo"} Video`,
            video_type: videoType === "youtube" ? "YouTube" : "Vimeo",
            order: videos.length + 1,
          };
          const res = await api.post<any>("/api/property-videos/", payload);
          setVideos((prev) => [...prev, res]);
          setVideoUrlInput("");
        }
        setVideoTitle("");
      } catch (err: any) {
        console.error("Failed to add video:", err);
        alert("Failed to add video. Please ensure the file is correct or the URL is valid, and try again.");
      } finally {
        setVideoUploading(false);
      }
    } else {
      // Offline store for new unsaved property
      const tempId = "temp_vid_" + Math.random().toString(36).substr(2, 9);
      const newTempVideo = {
        id: tempId,
        video_type: videoType,
        title: videoTitle || (videoType === "upload" ? videoFile!.name : `${videoType === "youtube" ? "YouTube" : "Vimeo"} Video`),
        file: videoFile || undefined,
        video_url: videoType !== "upload" ? videoUrlInput : undefined,
        video_src: videoType === "upload" ? URL.createObjectURL(videoFile!) : undefined,
        order: tempVideos.length + 1,
        is_primary: false,
      };
      setTempVideos((prev) => [...prev, newTempVideo]);
      setVideoFile(null);
      setVideoUrlInput("");
      setVideoTitle("");
    }
  };

  const handleDeleteVideo = async (videoId: any) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    if (initialData.id) {
      try {
        await api.delete(`/api/property-videos/${videoId}/`);
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
      } catch (err: any) {
        console.error("Failed to delete video:", err);
        alert("Unable to delete video. Please try again.");
      }
    } else {
      setTempVideos((prev) => prev.filter((v) => v.id !== videoId));
    }
  };

  const handleVideoOrderChange = async (videoId: any, order: number) => {
    if (initialData.id) {
      try {
        const res = await api.patch<any>(`/api/property-videos/${videoId}/`, { order });
        setVideos((prev) => prev.map((vid) => (vid.id === videoId ? res : vid)));
      } catch (err: any) {
        console.error("Failed to update video order:", err);
        alert("Failed to update video order. Please try again.");
      }
    } else {
      setTempVideos((prev) =>
        prev.map((vid) => (vid.id === videoId ? { ...vid, order } : vid))
      );
    }
  };

  const handleSetCoverVideo = async (videoId: any) => {
    if (initialData.id) {
      try {
        await api.post<any>(`/api/property-videos/${videoId}/set_primary/`, {});
        const refreshedVideos = await api.get<any>(`/api/property-videos/?property=${initialData.id}`);
        setVideos(Array.isArray(refreshedVideos) ? refreshedVideos : refreshedVideos.results || []);
        const refreshedImages = await api.get<any>(`/api/property-images/?property=${initialData.id}`);
        setImages(Array.isArray(refreshedImages) ? refreshedImages : refreshedImages.results || []);
      } catch (err: any) {
        console.error("Failed to set cover video:", err);
        alert("Failed to set cover video. Please try again.");
      }
    } else {
      setTempVideos((prev) =>
        prev.map((vid) => ({
          ...vid,
          is_primary: vid.id === videoId,
        }))
      );
      setTempImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: false,
        }))
      );
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="text-xl font-extrabold text-gray-900">{title}</h1>
        <div className="page-header-actions">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || fetchingTypes}
            className="btn btn-primary px-6 py-2 text-sm"
          >
            {loading ? "Saving..." : "Save Property"}
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        {/* Core fields */}
        <div className="xl:col-span-2 space-y-5">
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">General Information</h2>

            {/* Listing Type Toggle Switch */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Listing Type / Destination
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, listing_type: "property", status: f.status === "Shortlet" ? "For Sale" : f.status }))}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition-all ${
                    form.listing_type === "property"
                      ? "bg-navy text-white border-navy shadow-sm ring-2 ring-navy/20"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span>🏡 Property for Sale</span>
                  <span className="text-[11px] font-normal opacity-80">Appears on /properties</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, listing_type: "shortlet", status: "Shortlet" }))}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition-all ${
                    form.listing_type === "shortlet"
                      ? "bg-gold text-white border-gold shadow-sm ring-2 ring-gold/20"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span>🔑 Shortlet Apartment</span>
                  <span className="text-[11px] font-normal opacity-80">Appears on /shortlets</span>
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Property Title</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className={`form-input ${validationErrors.title ? "border-red-500 ring-1 ring-red-500" : ""}`}
                value={form.title || ""}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. 5 Bedroom Fully Detached Mansion"
              />
              {validationErrors.title && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.title[0]}</p>
              )}
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                className={`form-input ${validationErrors.description ? "border-red-500 ring-1 ring-red-500" : ""}`}
                required
                rows={5}
                value={form.description || ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Detailed description of the property..."
              />
              {validationErrors.description && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.description[0]}</p>
              )}
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-3 pt-1 pb-1">
              <span className="text-sm font-medium text-gray-700">Currency:</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCurrency("NGN")}
                  className={`px-4 py-1.5 text-sm font-semibold transition-colors ${
                    currency === "NGN"
                      ? "bg-navy text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  ₦ NGN
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-4 py-1.5 text-sm font-semibold transition-colors border-l border-gray-200 ${
                    currency === "USD"
                      ? "bg-navy text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            {/* Price Range Toggle */}
            <div className="flex items-center gap-2 pt-1 pb-1">
              <input
                id="is_range"
                type="checkbox"
                checked={isRange}
                onChange={(e) => {
                  setIsRange(e.target.checked);
                  if (!e.target.checked) setForm((f) => ({ ...f, max_price: "" }));
                }}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="is_range" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                This property has a price range
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">{isRange ? `Minimum Price (${currency === "USD" ? "$" : "₦"})` : `Price (${currency === "USD" ? "$" : "₦"})`}</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min={0}
                  className={`form-input ${validationErrors.price ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  value={form.price || ""}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                />
                {validationErrors.price && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.price[0]}</p>
                )}
              </div>

              {isRange ? (
                <div>
                  <label className="form-label">{`Maximum Price (${currency === "USD" ? "$" : "₦"})`}</label>
                  <input
                    id="max_price"
                    name="max_price"
                    type="number"
                    min={0}
                    className={`form-input ${validationErrors.max_price ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    value={form.max_price || ""}
                    onChange={(e) => setForm((f) => ({ ...f, max_price: Number(e.target.value) }))}
                  />
                  {validationErrors.max_price && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.max_price[0]}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="form-label">Property Type</label>
                  {fetchingTypes ? (
                    <div className="text-gray-400 text-sm py-2">Loading types...</div>
                  ) : (
                    <>
                      <select
                        id="property_type"
                        name="property_type"
                        className={`form-input ${validationErrors.property_type ? "border-red-500 ring-1 ring-red-500" : ""}`}
                        value={form.property_type || ""}
                        onChange={(e) => setForm((f) => ({ ...f, property_type: Number(e.target.value) }))}
                      >
                        {types.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      {validationErrors.property_type && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.property_type[0]}</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* When range is on, show Property Type in its own row below */}
            {isRange && (
              <div>
                <label className="form-label">Property Type</label>
                {fetchingTypes ? (
                  <div className="text-gray-400 text-sm py-2">Loading types...</div>
                ) : (
                  <>
                    <select
                      id="property_type"
                      name="property_type"
                      className={`form-input ${validationErrors.property_type ? "border-red-500 ring-1 ring-red-500" : ""}`}
                      value={form.property_type || ""}
                      onChange={(e) => setForm((f) => ({ ...f, property_type: Number(e.target.value) }))}
                    >
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    {validationErrors.property_type && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.property_type[0]}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Specs card */}
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Specifications</h2>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Bedrooms</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.bedrooms || ""}
                  onChange={(e) => setForm((f) => ({ ...f, bedrooms: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="form-label">Bathrooms</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.bathrooms || ""}
                  onChange={(e) => setForm((f) => ({ ...f, bathrooms: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="form-label">Area (sqft)</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.sqft || ""}
                  onChange={(e) => setForm((f) => ({ ...f, sqft: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="form-label">Year Built</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.year_built || ""}
                  onChange={(e) => setForm((f) => ({ ...f, year_built: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          {/* Location details & Map Picker */}
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Location & Map Coordinates</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className={`form-input ${validationErrors.city ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  value={form.city || ""}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
                {validationErrors.city && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.city[0]}</p>
                )}
              </div>
              <div>
                <label className="form-label">Address / Neighborhood</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  className={`form-input ${validationErrors.location ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  value={form.location || ""}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
                {validationErrors.location && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.location[0]}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.state || ""}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  placeholder="e.g. Lagos"
                />
              </div>
              <div>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.country || ""}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  placeholder="e.g. Nigeria"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="form-label">Location Map Picker</label>
              <MapPicker
                lat={Number(form.latitude)}
                lng={Number(form.longitude)}
                address={form.location}
                onChange={handleMapChange}
              />
            </div>
          </div>

          {/* Image Gallery Management */}
          <div className="card card-body space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Gallery Management</h2>
              <span className="text-xs text-gray-400">Drag & drop files or click to upload</span>
            </div>

            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gold transition cursor-pointer relative"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">Drag images here or click to select</p>
                  <p className="text-xs text-gray-400">JPEG, PNG, WEBP up to 5MB</p>
                </div>
              </div>

              {uploadProgress && (
                <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-xs font-semibold">
                  ⏳ {uploadProgress}
                </div>
              )}
              {imageError && (
                <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg text-xs font-semibold">
                  ⚠ {imageError}
                </div>
              )}

              {activeImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {activeImages.sort((a, b) => a.order - b.order).map((img) => (
                    <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex flex-col">
                      <img
                        src={img.image_optimized || img.image_url || img.image}
                        alt="Property"
                        className="w-full h-32 object-cover"
                      />
                      {img.is_primary && (
                        <span className="absolute top-2 left-2 bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          COVER
                        </span>
                      )}
                      <div className="p-2 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 justify-between">
                          <label className="text-[10px] text-gray-500 font-bold uppercase">Order</label>
                          <input
                            type="number"
                            value={img.order}
                            onChange={(e) => handleImageOrderChange(img.id, Number(e.target.value))}
                            className="w-12 text-center text-xs border border-gray-200 rounded p-0.5"
                          />
                        </div>
                        <div className="flex gap-1">
                          {!img.is_primary && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(img.id)}
                              className="btn btn-outline py-1 text-[10px] flex-1 text-center font-bold"
                            >
                              Set Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded transition flex items-center justify-center"
                            title="Delete image"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No images uploaded yet.</p>
              )}
            </div>
          </div>

          {/* Video Management */}
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Video Tour</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Add Video</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Video Source Type</label>
                    <select
                      value={videoType}
                      onChange={(e) => setVideoType(e.target.value as any)}
                      className="form-input text-xs"
                    >
                      <option value="youtube">YouTube URL</option>
                      <option value="vimeo">Vimeo URL</option>
                      <option value="upload">Upload MP4 File</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Video Label / Title</label>
                    <input
                      type="text"
                      value={videoTitle || ""}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g. Living Room Tour"
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                {videoType === "upload" ? (
                  <div>
                    <label className="form-label">Select MP4 Video File</label>
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("video/")) {
                          setVideoFile(file);
                        }
                      }}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gold transition cursor-pointer relative"
                    >
                      <input
                        type="file"
                        accept="video/mp4"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-1">
                        {videoFile ? (
                          <p className="text-xs font-semibold text-gold">Selected: {videoFile.name}</p>
                        ) : (
                          <>
                            <p className="text-xs font-semibold text-gray-600">Drag MP4 here or click to select</p>
                            <p className="text-[10px] text-gray-400">MP4 up to 50MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="form-label">Video Link URL</label>
                    <input
                      type="url"
                      value={videoUrlInput || ""}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      className="form-input text-xs"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddVideo}
                  disabled={videoUploading}
                  className="btn btn-gold text-xs px-4 py-2"
                >
                  {videoUploading ? "Adding Video..." : "Add Video Link"}
                </button>
              </div>

              {activeVideos.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Videos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeVideos.sort((a, b) => a.order - b.order).map((vid) => (
                      <div key={vid.id} className="relative group rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex flex-col sm:flex-row">
                        {/* Thumbnail / Platform Indicator */}
                        <div className="relative w-full sm:w-28 h-20 bg-black flex items-center justify-center shrink-0">
                          {getVideoThumbnail(vid) ? (
                            <img
                              src={getVideoThumbnail(vid)!}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover opacity-60"
                            />
                          ) : (
                            <div className="text-gold text-2xl">📹</div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="text-white text-[9px] bg-navy/80 px-2 py-0.5 rounded-full capitalize">
                              {vid.video_type}
                            </span>
                          </div>
                          {vid.is_primary && (
                            <span className="absolute top-1 left-1 bg-gold text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              COVER
                            </span>
                          )}
                        </div>
                        {/* Video Details and Actions */}
                        <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2 min-w-0">
                          <div>
                            <p className="text-xs font-bold text-gray-800 line-clamp-1">{vid.title || "Video Asset"}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[200px]" title={vid.video_src || vid.video_url || ""}>
                              {vid.video_src || vid.video_url}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                              <label className="text-[9px] text-gray-500 font-bold uppercase">Order</label>
                              <input
                                type="number"
                                value={vid.order || 0}
                                onChange={(e) => handleVideoOrderChange(vid.id, Number(e.target.value))}
                                className="w-10 text-center text-[10px] border border-gray-200 rounded p-0.5"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {!vid.is_primary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverVideo(vid.id)}
                                  className="text-gold hover:text-gold/80 text-[10px] font-bold"
                                >
                                  Set Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteVideo(vid.id)}
                                className="text-red-500 hover:text-red-700 text-[10px] font-bold"
                                title="Delete video"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">No videos added yet.</p>
              )}
            </div>
          </div>

          {/* SEO Block */}
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">SEO Metadata (Search Engine Optimization)</h2>
            <div>
              <label className="form-label">SEO Title</label>
              <input
                type="text"
                className="form-input"
                value={form.seo_title || ""}
                onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                placeholder="Recommended: 50-60 characters"
              />
            </div>
            <div>
              <label className="form-label">SEO Description</label>
              <textarea
                className="form-input text-xs"
                rows={3}
                value={form.seo_description || ""}
                onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
                placeholder="Recommended: 150-160 characters describing the property listing"
              />
            </div>
            <div>
              <label className="form-label">SEO Keywords (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                value={form.seo_keywords || ""}
                onChange={(e) => setForm((f) => ({ ...f, seo_keywords: e.target.value }))}
                placeholder="e.g. luxury home lagos, mansion for sale lekki"
              />
            </div>
          </div>
        </div>

        {/* Status & Options sidebar */}
        <div className="space-y-6">
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Status & Options</h2>

            <div>
              <label className="form-label">Property Status</label>
              <select
                className="form-input"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
              >
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
                <option value="Sold">Sold</option>
                <option value="Under Offer">Under Offer</option>
                <option value="Shortlet">Shortlet</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                  checked={form.is_visible}
                  onChange={(e) => setForm((f) => ({ ...f, is_visible: e.target.checked }))}
                />
                <span className="text-sm font-semibold text-gray-700">Is Visible (Publicly Published)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                />
                <span className="text-sm font-semibold text-gray-700">Featured Listing</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                  checked={form.luxury}
                  onChange={(e) => setForm((f) => ({ ...f, luxury: e.target.checked }))}
                />
                <span className="text-sm font-semibold text-gray-700">Luxury Tier</span>
              </label>
            </div>
          </div>

          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Features & Amenities</h2>
            <div>
              <label className="form-label">Features (comma-separated)</label>
              <textarea
                className="form-input text-xs"
                rows={3}
                value={form.features_input || ""}
                onChange={(e) => setForm((f) => ({ ...f, features_input: e.target.value }))}
                placeholder="e.g. Modern Design, BQ, Swimming Pool"
              />
            </div>
            <div>
              <label className="form-label">Amenities (comma-separated)</label>
              <textarea
                className="form-input text-xs"
                rows={3}
                value={form.amenities_input || ""}
                onChange={(e) => setForm((f) => ({ ...f, amenities_input: e.target.value }))}
                placeholder="e.g. 24/7 Power, Secure Estate Access"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
