"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import type { Property } from "@/types";

// Load MapPicker dynamically to prevent SSR issues with Leaflet
const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <div className="h-80 w-full bg-gray-100 rounded-xl flex items-center justify-center text-sm text-gray-400">Loading Map...</div>,
});

interface PropertyTypeChoice {
  id: number;
  name: string;
}

interface PropertyFormProps {
  initialData?: Partial<Property>;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  title: string;
}

export default function PropertyForm({
  initialData = {},
  onSubmit,
  loading,
  title,
}: PropertyFormProps) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    price: initialData.price || 0,
    bedrooms: initialData.bedrooms || 0,
    bathrooms: initialData.bathrooms || 0,
    sqft: initialData.sqft || 0,
    status: (initialData.status || "For Sale") as "For Sale" | "For Rent" | "Sold" | "Under Offer" | "Shortlet" | "Archived",
    property_type: initialData.property_type || "",
    featured: initialData.featured || false,
    luxury: initialData.luxury || false,
    is_visible: initialData.is_visible !== undefined ? initialData.is_visible : true,
    location: initialData.location || "",
    city: initialData.city || "",
    state: initialData.state || "",
    country: initialData.country || "",
    latitude: initialData.latitude || 6.45,
    longitude: initialData.longitude || 3.5,
    year_built: initialData.year_built || 2025,
    parking: initialData.parking || 0,
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
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map input fields to API payload
    const payload = {
      ...form,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sqft: Number(form.sqft),
      year_built: Number(form.year_built),
      parking: Number(form.parking),
      property_type: Number(form.property_type),
      features: form.features_input
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0),
      amenities: form.amenities_input
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0),
    };

    onSubmit(payload);
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
    if (!initialData.id) {
      alert("Please save the property details first before uploading images.");
      return;
    }

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
        setImageError(err.message || `Failed to upload image "${file.name}".`);
      }
    }
    setUploadProgress(null);
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

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await api.delete(`/api/property-images/${imageId}/`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: any) {
      alert(err.message || "Failed to delete image.");
    }
  };

  const handleSetCoverImage = async (imageId: number) => {
    try {
      await api.patch<any>(`/api/property-images/${imageId}/`, { is_primary: true });
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
    } catch (err: any) {
      alert(err.message || "Failed to set cover image.");
    }
  };

  const handleImageOrderChange = async (imageId: number, order: number) => {
    try {
      await api.patch(`/api/property-images/${imageId}/`, { order });
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, order } : img))
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  // Video Handlers
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData.id) {
      alert("Please save the property details first before adding videos.");
      return;
    }
    if (videoType === "upload" && !videoFile) {
      alert("Please select a video file first.");
      return;
    }
    if (videoType !== "upload" && !videoUrlInput.trim()) {
      alert("Please enter a video URL.");
      return;
    }

    setVideoUploading(true);
    try {
      if (videoType === "upload") {
        const formData = new FormData();
        formData.append("property", String(initialData.id));
        formData.append("video_upload", videoFile!);
        formData.append("title", videoTitle || videoFile!.name);
        formData.append("video_type", "MP4");
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
      alert(err.message || "Failed to add video.");
    } finally {
      setVideoUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await api.delete(`/api/property-videos/${videoId}/`);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err: any) {
      alert(err.message || "Failed to delete video.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
        <button
          onClick={handleSubmit}
          disabled={loading || fetchingTypes}
          className="btn btn-primary px-8 py-2 text-sm"
        >
          {loading ? "Saving..." : "Save Property"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Core fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">General Information</h2>

            <div>
              <label className="form-label">Property Title</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. 5 Bedroom Fully Detached Mansion"
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Detailed description of the property..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Price (₦)</label>
                <input
                  type="number"
                  required
                  min={0}
                  className="form-input"
                  value={form.price || ""}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="form-label">Property Type</label>
                {fetchingTypes ? (
                  <div className="text-gray-400 text-sm py-2">Loading types...</div>
                ) : (
                  <select
                    className="form-input"
                    value={form.property_type}
                    onChange={(e) => setForm((f) => ({ ...f, property_type: Number(e.target.value) }))}
                  >
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
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
                  value={form.bedrooms}
                  onChange={(e) => setForm((f) => ({ ...f, bedrooms: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="form-label">Bathrooms</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.bathrooms}
                  onChange={(e) => setForm((f) => ({ ...f, bathrooms: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="form-label">Area (sqft)</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.sqft}
                  onChange={(e) => setForm((f) => ({ ...f, sqft: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="form-label">Year Built</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.year_built}
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
                  type="text"
                  required
                  className="form-input"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">Address / Neighborhood</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  placeholder="e.g. Lagos"
                />
              </div>
              <div>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.country}
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

            {initialData.id ? (
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

                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.sort((a, b) => a.order - b.order).map((img) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex flex-col">
                        <img
                          src={img.image_optimized || img.image_url}
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
            ) : (
              <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl">
                Please save this property first to enable image uploads.
              </p>
            )}
          </div>

          {/* Video Management */}
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Video Tour</h2>
            {initialData.id ? (
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
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="e.g. Living Room Tour"
                        className="form-input text-xs"
                      />
                    </div>
                  </div>

                  {videoType === "upload" ? (
                    <div>
                      <label className="form-label">Select MP4 Video File</label>
                      <input
                        type="file"
                        accept="video/mp4"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="form-input text-xs"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="form-label">Video Link URL</label>
                      <input
                        type="url"
                        value={videoUrlInput}
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

                {videos.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Videos</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {videos.sort((a, b) => a.order - b.order).map((vid) => (
                        <div key={vid.id} className="card card-body p-3 bg-gray-50 flex items-center justify-between border border-gray-100">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{vid.title || "Video Link"}</p>
                            <span className="text-[10px] text-gray-400 capitalize">{vid.video_type || "External"}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="text-red-500 hover:text-red-700 text-xs shrink-0 font-bold"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">No videos added yet.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl">
                Please save this property first to enable video uploads.
              </p>
            )}
          </div>

          {/* SEO Block */}
          <div className="card card-body space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">SEO Metadata (Search Engine Optimization)</h2>
            <div>
              <label className="form-label">SEO Title</label>
              <input
                type="text"
                className="form-input"
                value={form.seo_title}
                onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                placeholder="Recommended: 50-60 characters"
              />
            </div>
            <div>
              <label className="form-label">SEO Description</label>
              <textarea
                className="form-input text-xs"
                rows={3}
                value={form.seo_description}
                onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
                placeholder="Recommended: 150-160 characters describing the property listing"
              />
            </div>
            <div>
              <label className="form-label">SEO Keywords (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                value={form.seo_keywords}
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
                value={form.features_input}
                onChange={(e) => setForm((f) => ({ ...f, features_input: e.target.value }))}
                placeholder="e.g. Modern Design, BQ, Swimming Pool"
              />
            </div>
            <div>
              <label className="form-label">Amenities (comma-separated)</label>
              <textarea
                className="form-input text-xs"
                rows={3}
                value={form.amenities_input}
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
