import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, encryptSSOToken } from "@/lib/sso";
import { RPL_MODULES } from "@/lib/modules-config";

export async function GET(req: NextRequest) {
  const moduleId = req.nextUrl.searchParams.get("module");
  const session = await getCurrentSession();

  const targetMod = RPL_MODULES.find((m) => m.id === moduleId);
  if (!targetMod) {
    return NextResponse.json({ message: "Modul tidak ditemukan" }, { status: 404 });
  }

  // 1. Jika pengunjung belum login (Tamu), arahkan ke publicUrl jika modul bersifat Public Read
  if (!session) {
    if (targetMod.isPublicRead) {
      return NextResponse.redirect(targetMod.publicUrl);
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Cek hak akses user pada modul tersebut
  const accessRight = session.role === "SUPER_ADMIN" ? "ADMIN" : session.moduleAccess[targetMod.id] || "NONE";

  if (accessRight === "NONE") {
    if (targetMod.isPublicRead) {
      return NextResponse.redirect(targetMod.publicUrl);
    }
    return NextResponse.json({ message: `Akun Anda tidak memiliki akses ke ${targetMod.name}` }, { status: 403 });
  }

  // 3. Cetak token terenkripsi dan lempar ke callbackUrl domain modul terkait
  const handoffToken = await encryptSSOToken(session, "2h");
  const destination = new URL(targetMod.callbackUrl);
  destination.searchParams.set("token", handoffToken);

  return NextResponse.redirect(destination.toString());
}
