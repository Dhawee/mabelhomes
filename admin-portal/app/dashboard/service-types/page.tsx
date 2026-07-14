"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Plus, Edit2, Trash2, Shield, Search, Loader, Check, Wrench } from "lucide-react";

interface ServiceType {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
  benefits: string[];
  long_description?: string;
}

export default function ServiceTypesPage() {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "Wrench",
    features_input: "",
    benefits_input: "",
    long_description: "",
  });

  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingService, setDeletingService] = useState<ServiceType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>("/api/services/");
      const data = Array.isArray(res) ? res : res.results || [];
      setServices(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch service types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setForm({
      title: "",
      description: "",
      icon: "Wrench",
      features_input: "",
      benefits_input: "",
      long_description: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (st: ServiceType) => {
    setEditingService(st);
    setForm({
      title: st.title,
      description: st.description || "",
      icon: st.icon || "Wrench",
      features_input: (st.features || []).join(", "),
      benefits_input: (st.benefits || []).join(", "),
      long_description: st.long_description || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      icon: form.icon,
      features: form.features_input.split(",").map((s) => s.trim()).filter(Boolean),
      benefits: form.benefits_input.split(",").map((s) => s.trim()).filter(Boolean),
      long_description: form.long_description,
    };

    try {
      if (editingService) {
        // Update
        const updated = await api.put<ServiceType>(`/api/services/${editingService.id}/`, payload);
        setServices((prev) => prev.map((s) => (s.id === editingService.id ? updated : s)));
      } else {
        // Create
        const created = await api.post<ServiceType>("/api/services/", payload);
        setServices((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to save service type.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (st: ServiceType) => {
    setDeletingService(st);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    setDeleting(true);
    try {
      await api.delete(`/api/services/${deletingService.id}/`);
      setServices((prev) => prev.filter((s) => s.id !== deletingService.id));
      setShowDeleteModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to delete service type.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wrench className="h-8 w-8 text-amber-500" /> Service Types
          </h1>
          <p className="text-gray-400 mt-1">
            Configure dynamic maintenance, cleanup, and advisory services offered to clients.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-750 text-white rounded-lg font-medium shadow-lg hover:shadow-amber-500/20 transition-all duration-200"
        >
          <Plus className="h-5 w-5" /> Add Service Type
        </button>
      </div>

      {/* Main Grid */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search service types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div className="text-sm text-gray-400">
            Total count: {filteredServices.length}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader className="h-10 w-10 text-amber-500 animate-spin" />
            <span>Loading service types...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            {error}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            No service types found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950/80 border-b border-gray-800 text-gray-400 font-medium text-sm">
                  <th className="p-4">Service Title</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Icon Identifier</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-800/20 text-gray-300 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{s.title}</div>
                      <div className="text-xs text-amber-400/85 font-mono">{s.slug}</div>
                    </td>
                    <td className="p-4 text-sm max-w-sm truncate text-gray-400">{s.description}</td>
                    <td className="p-4 font-mono text-xs flex items-center gap-2 text-gray-400">
                      <span className="p-1.5 bg-gray-950 border border-gray-850 rounded text-amber-500 font-bold">{s.icon}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition-colors"
                          title="Edit Service Type"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(s)}
                          className="p-2 hover:bg-red-950/30 text-gray-400 hover:text-red-400 rounded transition-colors"
                          title="Delete Service Type"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl my-8 relative">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingService ? "Edit Service Type" : "Add Service Type"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Service Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Renovation, Interior Design, Painting"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Brief Description
                </label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Summarize what this service entails"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Icon Name (Lucide)
                  </label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Wrench">Wrench</option>
                    <option value="Home">Home</option>
                    <option value="Shield">Shield</option>
                    <option value="Layers">Layers</option>
                    <option value="Paintbrush">Paintbrush</option>
                    <option value="Hammer">Hammer</option>
                    <option value="Droplet">Droplet</option>
                    <option value="Key">Key</option>
                    <option value="Sparkles">Sparkles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Features (comma-separated list)
                </label>
                <textarea
                  value={form.features_input}
                  onChange={(e) => setForm((prev) => ({ ...prev, features_input: e.target.value }))}
                  placeholder="e.g. Electrical Checks, Pipeline Swapping, Core Inspections"
                  rows={2}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Benefits (comma-separated list)
                </label>
                <textarea
                  value={form.benefits_input}
                  onChange={(e) => setForm((prev) => ({ ...prev, benefits_input: e.target.value }))}
                  placeholder="e.g. Free Estimate, 1 Year Warranty, Same Day Service"
                  rows={2}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Long Detailed Description
                </label>
                <textarea
                  value={form.long_description}
                  onChange={(e) => setForm((prev) => ({ ...prev, long_description: e.target.value }))}
                  placeholder="Explain the entire process and terms of service"
                  rows={3}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-lg shadow transition-colors flex items-center gap-2"
                >
                  {saving && <Loader className="h-4 w-4 animate-spin" />}
                  {editingService ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">Delete Service Type</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete the service type <span className="text-white font-semibold">"{deletingService?.title}"</span>? 
              This action cannot be undone and clients won't be able to log inquiries for it.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg shadow transition-colors flex items-center gap-2"
              >
                {deleting && <Loader className="h-4 w-4 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
