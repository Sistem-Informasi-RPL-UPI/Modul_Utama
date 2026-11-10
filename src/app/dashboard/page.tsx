import Link from "next/link";
import { Suspense } from "react";
import { getCurrentSession } from "@/lib/sso";
import { RPL_MODULES } from "@/lib/modules-config";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await getCurrentSession();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <header className="bg-white border border-slate-200 rounded-xl p-5 mb-6 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Portal Terpadu Sistem Informasi RPL</h1>
            <p className="text-sm text-slate-500">{session ? `Login sebagai: ${session.name} (${session.email}) — Role Utama: ${session.role}` : "Mode Pengunjung Tamu (Hanya dapat melihat modul berstatus Public Read)"}</p>
          </div>

          <div className="flex items-center gap-3">
            {session?.role === "SUPER_ADMIN" && (
              <Link href="/admin/users" className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
                Kelola User & Hak Akses
              </Link>
            )}

            {session ? (
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50">
                  Logout
                </button>
              </form>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                Login SSO
              </Link>
            )}
          </div>
        </header>

        {/* Grid 10 Modul */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RPL_MODULES.map((mod) => {
            const userAccess = session ? (session.role === "SUPER_ADMIN" ? "ADMIN" : session.moduleAccess[mod.id] || "NONE") : "NONE";

            const canEnterWithAuth = userAccess !== "NONE";
            const canEnterAsPublic = mod.isPublicRead;

            return (
              <div key={mod.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded">
                      Modul {mod.number} • {mod.group}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {mod.isPublicRead && <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">Public Read</span>}
                      {session && <span className={`text-xs font-medium px-2 py-0.5 rounded ${canEnterWithAuth ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-100 text-slate-500"}`}>Akses: {userAccess}</span>}
                    </div>
                  </div>

                  <h2 className="text-base font-semibold text-slate-900">{mod.name}</h2>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  {canEnterWithAuth ? (
                    <a href={`/api/sso/launch?module=${mod.id}`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
                      Buka Modul ({userAccess}) &rarr;
                    </a>
                  ) : canEnterAsPublic ? (
                    <a href={`/api/sso/launch?module=${mod.id}`} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg">
                      Lihat Data Publik (Read-Only) &rarr;
                    </a>
                  ) : (
                    <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 text-sm font-medium rounded-lg cursor-not-allowed">
                      Tidak Ada Akses
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
