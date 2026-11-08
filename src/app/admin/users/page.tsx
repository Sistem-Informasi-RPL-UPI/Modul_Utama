"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RPL_MODULES, ACCESS_LEVELS } from "@/lib/modules-config";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "KAPRODI" | "DOSEN" | "STAFF" | "MAHASISWA";
  moduleAccess: Record<string, string>;
}

const ROLES = ["MAHASISWA", "STAFF", "DOSEN", "KAPRODI", "SUPER_ADMIN"] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRecord["role"]>("MAHASISWA");
  const [moduleAccess, setModuleAccess] = useState<Record<string, string>>({});

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Preset cepat saat ganti Role Utama agar Admin tidak capek klik satu-satu
  function applyRolePreset(selectedRole: UserRecord["role"]) {
    setRole(selectedRole);
    const preset: Record<string, string> = {};
    RPL_MODULES.forEach((m) => {
      if (selectedRole === "SUPER_ADMIN" || selectedRole === "KAPRODI") {
        preset[m.id] = "ADMIN";
      } else if (selectedRole === "DOSEN") {
        preset[m.id] = ["modul_1", "modul_2", "modul_5", "modul_7", "modul_8"].includes(m.id) ? "EDITOR" : "VIEWER";
      } else if (selectedRole === "STAFF") {
        preset[m.id] = ["modul_3", "modul_4", "modul_6"].includes(m.id) ? "ADMIN" : "VIEWER";
      } else {
        preset[m.id] = ["modul_1", "modul_3", "modul_5", "modul_6", "modul_9", "modul_10"].includes(m.id) ? "USER" : "NONE";
      }
    });
    setModuleAccess(preset);
  }

  function startEdit(user: UserRecord) {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setModuleAccess(user.moduleAccess || {});
  }

  function resetForm() {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("MAHASISWA");
    setModuleAccess({});
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingUser) {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editingUser.id, name, role, password, moduleAccess }),
      });
    } else {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, moduleAccess }),
      });
    }
    resetForm();
    fetchUsers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus user ini?")) return;
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    fetchUsers();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Manajemen User & Matriks Akses 10 Modul</h1>
            <p className="text-sm text-slate-500">Atur role utama dan tentukan hak akses spesifik (NONE, VIEWER, USER, EDITOR, ADMIN) di tiap modul.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
            &larr; Kembali ke Dashboard
          </Link>
        </div>

        {/* Form Tambah / Edit User */}
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900">{editingUser ? `Edit User: ${editingUser.email}` : "Tambah User Baru"}</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input type="email" required disabled={!!editingUser} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{editingUser ? "Password Baru (Kosongkan jika tetap)" : "Password"}</label>
              <input type="password" required={!editingUser} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role Utama (Otomatis Isi Preset)</label>
              <select value={role} onChange={(e) => applyRolePreset(e.target.value as UserRecord["role"])} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matriks Hak Akses 10 Modul */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Hak Akses Spesifik per Modul (Dikirim di dalam Payload SSO)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {RPL_MODULES.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-700 truncate">
                    <strong>M{mod.number}:</strong> {mod.name}
                  </span>
                  <select value={moduleAccess[mod.id] || "NONE"} onChange={(e) => setModuleAccess((prev) => ({ ...prev, [mod.id]: e.target.value }))} className="px-2.5 py-1 border border-slate-300 rounded bg-white text-xs font-medium">
                    {ACCESS_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editingUser && (
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">
                Batal
              </button>
            )}
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700">
              {editingUser ? "Simpan Perubahan" : "Buat User"}
            </button>
          </div>
        </form>

        {/* Tabel Daftar User */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="p-3">Nama & Email</th>
                <th className="p-3">Role Utama</th>
                <th className="p-3">Ringkasan Akses Modul</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold">{u.role}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(u.moduleAccess || {})
                        .filter(([, lvl]) => lvl !== "NONE")
                        .map(([modId, lvl]) => (
                          <span key={modId} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                            {modId.replace("modul_", "M")}: {lvl}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => startEdit(u)} className="text-blue-600 hover:underline text-xs font-medium">
                      Edit Akses
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline text-xs font-medium">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
