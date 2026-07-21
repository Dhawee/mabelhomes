"use client";

import { useEffect, useState, useCallback } from "react";
import { ImageIcon, Upload, Search, Link as LinkIcon, Trash2, RefreshCw, Eye, HardDrive, Database, ShieldAlert } from "lucide-react";
import { api } from "@/lib/admin/api";
import type { MediaAsset, PaginatedResponse } from "@/types/admin";

export default function MediaLibraryPage() {
  const [data, setData] = useState<PaginatedResponse<MediaAsset> | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [unusedFilter, setUnusedFilter] = useState(false);
  const [page, setPage] = useState(1);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState("");
  const [folder, setFolder] = useState("general");

  // Modal Preview State
  const [previewAsset, setPreviewAsset] = useState<any | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get<any>("/api/media/stats/");
      setStats(res);
    } catch (err) {
      console.error("Failed to load media statistics:", err);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "20",
      });
      if (search) params.set("search", search);
      if (typeFilter) params.set("media_type", typeFilter);
      if (unusedFilter) params.set("unused", "true");

      const result = await api.get<PaginatedResponse<MediaAsset>>(`/api/media/?${params}`);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load media assets.");
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, unusedFilter]);

  useEffect(() => {
    load();
    loadStats();
  }, [load, loadStats]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("alt_text", altText || files[0].name);
    formData.append("folder", folder || "general");

    try {
      await api.post("/api/media/", formData);
      alert("File uploaded successfully!");
      setAltText("");
      load();
      loadStats();
    } catch (err: any) {
      alert(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this media asset?")) return;
    try {
      await api.delete(`/api/media/${id}/`);
      alert("Media asset deleted.");
      load();
      loadStats();
    } catch (err: any) {
      alert(err.message || "Failed to delete asset.");
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Media URL copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2" style={{ color: "var(--color-navy)" }}>
            <ImageIcon size={20} style={{ color: "var(--color-navy)" }} />
            Media Library
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload, optimize, and link media files directly within property listings
          </p>
        </div>
        <div className="page-header-actions">
          <button onClick={() => { load(); loadStats(); }} className="btn btn-outline gap-2 py-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      {stats && (
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="stat-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-navy shrink-0" style={{ color: "var(--color-navy)" }}>
              <Database size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Total Storage Size</p>
              <p className="text-lg font-bold text-gray-800">
                {(stats.total_size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="stat-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
              <HardDrive size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Total Uploaded Items</p>
              <p className="text-lg font-bold text-gray-800">{stats.total_count} files</p>
            </div>
          </div>

          <div className="stat-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Unused Media Assets</p>
              <p className="text-lg font-bold text-gray-800">{stats.unused_count} files</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Panel */}
      <div className="card card-body grid md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="form-label">Alt Text / Label</label>
          <input
            type="text"
            className="form-input text-xs"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="e.g. Master suite balcony views"
          />
        </div>
        <div>
          <label className="form-label">Folder / Category</label>
          <input
            type="text"
            className="form-input text-xs"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="e.g. listings"
          />
        </div>
        <div>
          <label className="btn btn-primary w-full gap-2 justify-center cursor-pointer py-2.5 text-sm">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload File"}
            <input
              type="file"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
              accept="image/*,video/*,application/pdf"
            />
          </label>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card card-body">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search filename or description keywords..."
              className="form-input pl-9"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="form-input w-auto"
          >
            <option value="">All Media Types</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
            <option value="document">Documents Only</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-600">
            <input
              type="checkbox"
              className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
              checked={unusedFilter}
              onChange={(e) => { setUnusedFilter(e.target.checked); setPage(1); }}
            />
            <span>Show Unused Assets Only</span>
          </label>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="p-6 text-red-600 text-sm">⚠ {error}</div>
      ) : !data?.results.length ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-100">
          <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
          No media assets matches found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.results.map((asset) => (
            <div key={asset.id} className="card overflow-hidden flex flex-col group relative hover:border-gold transition">
              {/* Media Preview Box */}
              <div
                onClick={() => setPreviewAsset(asset)}
                className="relative aspect-[4/3] bg-gray-100 border-b border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
              >
                {asset.media_type === "image" ? (
                  <img src={asset.file_url} alt={asset.alt_text} className="object-cover w-full h-full group-hover:scale-105 transition duration-300" />
                ) : asset.media_type === "video" ? (
                  <div className="w-full h-full relative flex items-center justify-center bg-gray-950">
                    <video src={asset.file_url} className="object-cover w-full h-full opacity-80" muted />
                    <span className="absolute bg-black/60 text-white rounded-full p-2 text-xs">▶ Video</span>
                  </div>
                ) : (
                  <span className="text-4xl">📄</span>
                )}
              </div>

              {/* Asset Meta */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <p className="text-xs font-semibold text-gray-800 truncate" title={asset.file_name}>
                    {asset.file_name}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {asset.media_type} · {(asset.file_size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => setPreviewAsset(asset)}
                    className="btn btn-outline p-1.5 flex-1 flex justify-center text-gray-600 hover:text-navy"
                    title="View details / Replace file"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => handleCopyLink(asset.file_url)}
                    className="btn btn-outline p-1.5 flex-1 flex justify-center"
                    title="Copy URL"
                  >
                    <LinkIcon size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="btn btn-danger p-1.5 flex-1 flex justify-center"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && (data.next || data.previous) && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.previous}
            className="btn btn-outline py-1.5 px-4 text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="btn btn-outline py-1.5 px-4 text-xs cursor-default">
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.next}
            className="btn btn-outline py-1.5 px-4 text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Preview & Edit/Replace Modal */}
      {previewAsset && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide truncate max-w-[80%]">
                Preview: {previewAsset.file_name}
              </h3>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Media Rendering */}
            <div className="relative aspect-video rounded-xl bg-gray-900 overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner">
              {previewAsset.media_type === "image" ? (
                <img
                  src={previewAsset.file_url}
                  alt={previewAsset.alt_text}
                  className="max-h-full max-w-full object-contain"
                />
              ) : previewAsset.media_type === "video" ? (
                <video
                  src={previewAsset.file_url}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <span className="text-5xl block">📄</span>
                  <a
                    href={previewAsset.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline font-semibold text-sm"
                  >
                    View Document / PDF
                  </a>
                </div>
              )}
            </div>

            {/* Metadata & Usage */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Metadata</p>
                <p className="text-gray-700">Size: {(previewAsset.file_size / (1024 * 1024)).toFixed(2)} MB</p>
                <p className="text-gray-700">Folder: {previewAsset.folder || "general"}</p>
                <p className="text-gray-700">Type: {previewAsset.mime_type}</p>
                <p className="text-gray-700">Uploaded By: {previewAsset.uploaded_by_name || "System"}</p>
              </div>

              <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Usage In Properties</p>
                {previewAsset.usage && previewAsset.usage.length > 0 ? (
                  <ul className="list-disc pl-4 text-gray-700 space-y-1 max-h-24 overflow-y-auto">
                    {previewAsset.usage.map((title: string, idx: number) => (
                      <li key={idx} className="truncate">{title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">This asset is not currently linked to any properties (Unused).</p>
                )}
              </div>
            </div>

            {/* Replace Button & Controls */}
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center flex-wrap gap-2">
              <label className="btn btn-outline gap-2 text-xs py-1.5 cursor-pointer">
                <span>🔄 Replace Media File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    
                    const formData = new FormData();
                    formData.append("file", files[0]);
                    
                    try {
                      const updated = await api.post<any>(`/api/media/${previewAsset.id}/replace/`, formData);
                      alert("Media file replaced successfully!");
                      setPreviewAsset(updated);
                      load();
                      loadStats();
                    } catch (err: any) {
                      alert(err.message || "Failed to replace media.");
                    }
                  }}
                  accept={previewAsset.media_type === "image" ? "image/*" : previewAsset.media_type === "video" ? "video/*" : "*"}
                />
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyLink(previewAsset.file_url)}
                  className="btn btn-outline py-1.5 text-xs"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => {
                    handleDelete(previewAsset.id);
                    setPreviewAsset(null);
                  }}
                  className="btn btn-danger py-1.5 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
