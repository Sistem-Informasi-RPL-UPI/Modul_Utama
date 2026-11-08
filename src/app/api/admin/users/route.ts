import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/sso";

// Ambil semua user
export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden: Khusus Super Admin" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, moduleAccess: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

// Tambah user baru beserta hak akses modulnya
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { name, email, password, role, moduleAccess } = await req.json();
  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { name, email, passwordHash, role, moduleAccess: moduleAccess || {} },
  });

  return NextResponse.json({ message: "User berhasil dibuat", userId: newUser.id }, { status: 201 });
}

// Update role, password (opsional), atau matriks hak akses modul
export async function PATCH(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { userId, name, role, password, moduleAccess } = await req.json();

  const updateData: Record<string, unknown> = { name, role, moduleAccess };
  if (password && password.trim() !== "") {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return NextResponse.json({ message: "Hak akses & data user berhasil diperbarui" });
}

// Hapus user
export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const userId = req.nextUrl.searchParams.get("id");
  if (!userId) return NextResponse.json({ message: "ID wajib diisi" }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ message: "User dihapus" });
}
