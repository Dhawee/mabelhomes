"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Edit, Shield, Check, X, RefreshCw, Upload, Clock, User as UserIcon } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminUser, PaginatedResponse } from "@/types";

export default function UsersPage() {
  const [data, setData] = useState<PaginatedResponse<AdminUser> | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Detail sidebar state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"general" | "permissions">("general");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  const [form, setForm] = useState<{
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    is_staff: boolean;
    is_superuser: boolean;
    is_active: boolean;
    groups: number[];
    user_permissions: number[];
  }>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    is_staff: true,
    is_superuser: false,
    is_active: true,
    groups: [],
    user_permissions: [],
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        api.get<PaginatedResponse<AdminUser>>("/api/users/"),
        api.get<any>("/api/groups/"),
        api.get<any>("/api/permissions/"),
      ]);

      if (results[0].status === "fulfilled") {
        setData(results[0].value);
      } else {
        throw new Error(results[0].reason?.message || "Failed to load users list.");
      }

      if (results[1].status === "fulfilled") {
        const resGroups = results[1].value;
        setGroups(Array.isArray(resGroups) ? resGroups : resGroups.results || []);
      } else {
        console.error("Failed to load groups:", results[1].reason);
      }

      if (results[2].status === "fulfilled") {
        const resPerms = results[2].value;
        setPermissions(Array.isArray(resPerms) ? resPerms : resPerms.results || []);
      } else {
        console.error("Failed to load permissions:", results[2].reason);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load users data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setForm({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      is_staff: true,
      is_superuser: false,
      is_active: true,
      groups: [],
      user_permissions: [],
    });
    setModalTab("general");
    setShowModal(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      password: "",
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      is_active: user.is_active,
      groups: user.groups || [],
      user_permissions: user.user_permissions || [],
    });
    setModalTab("general");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...form };
      if (!payload.password) delete payload.password;

      if (editingUser) {
        await api.patch(`/api/users/${editingUser.id}/`, payload);
        alert("User updated successfully!");
      } else {
        if (!payload.password) {
          alert("Password is required for new users.");
          return;
        }
        await api.post("/api/users/", payload);
        alert("User created successfully!");
      }
      setShowModal(false);
      load();
      if (selectedUser && selectedUser.id === editingUser?.id) {
        setSelectedUser(null); // refresh sidebar
      }
    } catch (err: any) {
      alert(err.message || "Failed to save user.");
    }
  };

  const toggleActiveStatus = async (user: AdminUser) => {
    try {
      await api.patch(`/api/users/${user.id}/`, { is_active: !user.is_active });
      load();
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev: any) => prev ? { ...prev, is_active: !prev.is_active } : null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to toggle status.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingUser) return;
    setAvatarUploading(true);

    const formData = new FormData();
    formData.append("avatar", files[0]);

    try {
      const updatedUser = await api.patch<AdminUser>(`/api/users/${editingUser.id}/`, formData);
      alert("Profile picture updated!");
      load();
      setEditingUser(updatedUser);
    } catch (err: any) {
      alert(err.message || "Failed to upload avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleViewDetails = async (user: AdminUser) => {
    setSelectedUser(user);
    setLoadingActivity(true);
    try {
      const res = await api.get<any>(`/api/audit-log/?search=${user.username}`);
      setUserActivity(res.results || []);
    } catch (err) {
      console.error("Failed to load user activity timeline:", err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleGroupToggle = (id: number) => {
    setForm((f) => {
      const grps = [...f.groups];
      const idx = grps.indexOf(id);
      if (idx > -1) grps.splice(idx, 1);
      else grps.push(id);
      return { ...f, groups: grps };
    });
  };

  const handlePermissionToggle = (id: number) => {
    setForm((f) => {
      const perms = [...f.user_permissions];
      const idx = perms.indexOf(id);
      if (idx > -1) perms.splice(idx, 1);
      else perms.push(id);
      return { ...f, user_permissions: perms };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy flex items-center gap-2" style={{ color: "var(--color-navy)" }}>
            <Users size={22} className="text-navy" style={{ color: "var(--color-navy)" }} />
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage staff credentials, upload avatars, toggle status, and configure permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn btn-outline gap-2 py-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={handleOpenCreate} className="btn btn-primary gap-2 py-2 text-sm">
            <Plus size={14} /> Create Staff User
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Main Users Table */}
        <div className="lg:col-span-2 card">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="spinner" />
            </div>
          ) : error ? (
            <div className="p-6 text-red-600 text-sm">⚠ {error}</div>
          ) : !data?.results.length ? (
            <div className="p-12 text-center text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              No staff members found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table text-sm">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Superuser</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((user) => (
                    <tr key={user.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(user)}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold text-xs" style={{ color: "var(--color-navy)" }}>
                              {user.username[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 leading-none">{user.username}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{user.first_name || ""} {user.last_name || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-600">{user.email}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleActiveStatus(user)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                            user.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {user.is_active ? <><Check size={11} /> Active</> : <><X size={11} /> Suspended</>}
                        </button>
                      </td>
                      <td>
                        <span className={`badge ${user.is_superuser ? "badge-gold" : "badge-gray"}`}>
                          {user.is_superuser ? "Superuser" : "Staff"}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleOpenEdit(user)} className="btn btn-outline py-1 px-3 text-xs gap-1">
                          <Edit size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Details & Timeline Panel */}
        <div className="card card-body space-y-6">
          {selectedUser ? (
            <>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Staff Profile Summary</h2>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">✕ Close</button>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 py-2">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gold shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-navy text-white text-2xl font-bold flex items-center justify-center border-2 border-gold" style={{ background: "var(--color-navy)" }}>
                    {selectedUser.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-800 text-base">{selectedUser.username}</h3>
                  <p className="text-xs text-gray-400">{selectedUser.first_name} {selectedUser.last_name}</p>
                  <p className="text-xs text-blue-600 font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-xs border border-gray-100">
                <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Permission Roles</h4>
                <div className="flex flex-wrap gap-1.5">
                  <span className="badge badge-gray">Staff Access</span>
                  {selectedUser.is_superuser && <span className="badge badge-gold">Full Admin privileges</span>}
                  {selectedUser.groups_names?.map((gName: string, idx: number) => (
                    <span key={idx} className="badge badge-info">{gName}</span>
                  ))}
                </div>
              </div>

              {/* Activity history timeline */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                  <Clock size={13} className="text-gold" /> Activity History Timeline
                </h4>
                {loadingActivity ? (
                  <div className="flex justify-center py-4"><div className="spinner" /></div>
                ) : userActivity.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {userActivity.slice(0, 8).map((act: any) => (
                      <div key={act.id} className="relative pl-4 border-l-2 border-gray-200 py-0.5 text-xs">
                        <div className="absolute w-2 h-2 rounded-full bg-gold -left-[5px] top-1.5" />
                        <p className="text-gray-400 text-[10px]">{new Date(act.timestamp).toLocaleString()}</p>
                        <p className="font-semibold text-gray-700 capitalize">{act.action}: <span className="font-normal text-gray-600">{act.description}</span></p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-4">No audit logs recorded for this user.</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <UserIcon size={36} className="mx-auto mb-2 opacity-35" />
              <p className="text-sm">Select a staff user to view profile timeline and permission sets.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">
                {editingUser ? `Edit Staff User: ${editingUser.username}` : "Create New Staff User"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            {/* Tab Headers */}
            <div className="flex gap-4 border-b border-gray-100 pb-2">
              <button
                type="button"
                onClick={() => setModalTab("general")}
                className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition ${
                  modalTab === "general" ? "border-gold text-gold" : "border-transparent text-gray-400"
                }`}
              >
                General Info
              </button>
              <button
                type="button"
                onClick={() => setModalTab("permissions")}
                className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition ${
                  modalTab === "permissions" ? "border-gold text-gold" : "border-transparent text-gray-400"
                }`}
              >
                Roles & Permissions
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalTab === "general" ? (
                <div className="space-y-4">
                  {editingUser && (
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {editingUser.avatar ? (
                        <img src={editingUser.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-gold" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-navy text-white text-lg font-bold flex items-center justify-center" style={{ background: "var(--color-navy)" }}>
                          {editingUser.username[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <label className="form-label text-[10px]">Replace Profile Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={avatarUploading}
                          onChange={handleAvatarUpload}
                          className="text-xs text-gray-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={form.first_name}
                        onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={form.last_name}
                        onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingUser}
                      className="form-input"
                      value={form.username}
                      onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="form-label">Password {editingUser && "(Leave blank to keep current)"}</label>
                    <input
                      type="password"
                      className="form-input"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder={editingUser ? "••••••••" : "Enter password"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                        checked={form.is_staff}
                        onChange={(e) => setForm((f) => ({ ...f, is_staff: e.target.checked }))}
                      />
                      <span className="text-xs font-semibold text-gray-700">Is Staff</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                        checked={form.is_superuser}
                        onChange={(e) => setForm((f) => ({ ...f, is_superuser: e.target.checked }))}
                      />
                      <span className="text-xs font-semibold text-gray-700">Superuser</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Groups Checkbox grid */}
                  <div className="space-y-2 border border-gray-100 p-3 rounded-xl bg-gray-50">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assign Roles (Groups)</h3>
                    {groups.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {groups.map((g) => (
                          <label key={g.id} className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 select-none">
                            <input
                              type="checkbox"
                              checked={form.groups.includes(g.id)}
                              onChange={() => handleGroupToggle(g.id)}
                              className="rounded border-gray-300 text-gold focus:ring-gold"
                            />
                            <span>{g.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">No groups/roles defined in system settings.</p>
                    )}
                  </div>

                  {/* Permissions Checkbox grid */}
                  <div className="space-y-2 border border-gray-100 p-3 rounded-xl bg-gray-50">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assign Direct Permissions</h3>
                    {permissions.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {permissions.map((p) => (
                          <label key={p.id} className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-700 select-none">
                            <input
                              type="checkbox"
                              checked={form.user_permissions.includes(p.id)}
                              onChange={() => handlePermissionToggle(p.id)}
                              className="rounded border-gray-300 text-gold focus:ring-gold"
                            />
                            <span className="truncate" title={p.codename}>{p.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">No custom permissions found in system registry.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1 py-2">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1 py-2 text-white">
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
