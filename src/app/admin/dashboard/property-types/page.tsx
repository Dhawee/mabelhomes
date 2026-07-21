"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/admin/api";
import { Plus, Edit2, Trash2, Home, Search, Loader } from "lucide-react";

interface PropertyType {
  id: number;
  name: string;
  slug: string;
}

export default function PropertyTypesPage() {
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<PropertyType | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingType, setDeletingType] = useState<PropertyType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>("/api/property-types/");
      const data = Array.isArray(res) ? res : res.results || [];
      setTypes(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch property types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const handleOpenCreate = () => {
    setEditingType(null);
    setNameInput("");
    setShowModal(true);
  };

  const handleOpenEdit = (pt: PropertyType) => {
    setEditingType(pt);
    setNameInput(pt.name);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setSaving(true);
    try {
      if (editingType) {
        // Update
        const updated = await api.put<PropertyType>(`/api/property-types/${editingType.id}/`, {
          name: nameInput,
        });
        setTypes((prev) => prev.map((t) => (t.id === editingType.id ? updated : t)));
      } else {
        // Create
        const created = await api.post<PropertyType>("/api/property-types/", {
          name: nameInput,
        });
        setTypes((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to save property type.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (pt: PropertyType) => {
    setDeletingType(pt);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingType) return;
    setDeleting(true);
    try {
      await api.delete(`/api/property-types/${deletingType.id}/`);
      setTypes((prev) => prev.filter((t) => t.id !== deletingType.id));
      setShowDeleteModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to delete property type.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredTypes = types.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Home className="h-8 w-8 text-amber-500" /> Property Types
          </h1>
          <p className="text-gray-400 mt-1">
            Configure dynamic property tags and categories for Mabel Homes listings.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-750 text-white rounded-lg font-medium shadow-lg hover:shadow-amber-500/20 transition-all duration-200"
        >
          <Plus className="h-5 w-5" /> Add Property Type
        </button>
      </div>

      {/* Main Grid */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search property types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div className="text-sm text-gray-400">
            Total count: {filteredTypes.length}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader className="h-10 w-10 text-amber-500 animate-spin" />
            <span>Loading property types...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            {error}
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            No property types found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950/80 border-b border-gray-800 text-gray-400 font-medium text-sm">
                  <th className="p-4">Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredTypes.map((pt) => (
                  <tr key={pt.id} className="hover:bg-gray-800/20 text-gray-300 transition-colors">
                    <td className="p-4 font-semibold text-white">{pt.name}</td>
                    <td className="p-4 font-mono text-xs text-amber-400/80">{pt.slug}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(pt)}
                        className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition-colors"
                        title="Edit Property Type"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(pt)}
                        className="p-2 hover:bg-red-950/30 text-gray-400 hover:text-red-400 rounded transition-colors"
                        title="Delete Property Type"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingType ? "Edit Property Type" : "Add Property Type"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Type Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Duplex, Penthouse, Land"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-850">
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
                  {editingType ? "Save Changes" : "Create Type"}
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
            <h3 className="text-xl font-bold text-white mb-2">Delete Property Type</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete the property type <span className="text-white font-semibold">"{deletingType?.name}"</span>? 
              This action cannot be undone and may cause catalog errors if properties depend on it.
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
