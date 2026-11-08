"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Gagal membuat akun");
      return;
    }

    router.push(data.redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Buat Akun SSO RPL</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Pendaftaran mandiri otomatis mendapatkan akses dasar Mahasiswa. Untuk perubahan role Dosen/Staff, hubungi Admin Prodi.</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Budi Santoso" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@upi.edu" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
            <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition">
            {loading ? "Mendaftarkan Akun..." : "Daftar & Masuk"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 text-center text-xs">
          <span className="text-slate-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Login di sini
            </Link>
          </span>
          <Link href="/dashboard" className="text-slate-500 hover:underline">
            Lihat Modul Publik tanpa Login &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
