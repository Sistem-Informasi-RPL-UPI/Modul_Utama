"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Gagal login");
      return;
    }

    router.push(data.redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Portal SSO Sistem Informasi RPL</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Masuk satu kali untuk mengakses 10 modul akademik sesuai hak akses Anda.</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@upi.edu" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition">
            {loading ? "Memproses..." : "Masuk ke Portal"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link href="/dashboard" className="text-xs text-blue-600 hover:underline">
            Lihat Modul Publik tanpa Login (Mode Tamu) &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
