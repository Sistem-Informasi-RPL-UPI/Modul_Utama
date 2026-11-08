import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { encryptSSOToken, COOKIE_NAME, SSOPayload } from "@/lib/sso";
import { DEFAULT_MAHASISWA_ACCESS } from "@/lib/modules-config";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    // 1. Validasi kelengkapan input dasar
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ message: "Nama, email, dan password wajib diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password minimal 6 karakter" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Konfirmasi password tidak cocok" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar, silakan login" }, { status: 409 });
    }

    // 3. Hash password & simpan user baru dengan default role MAHASISWA
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "MAHASISWA",
        moduleAccess: DEFAULT_MAHASISWA_ACCESS,
      },
    });

    // 4. Langsung buatkan session SSO (Auto-Login setelah registrasi)
    const payload: SSOPayload = {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      moduleAccess: (newUser.moduleAccess as Record<string, string>) || {},
    };

    const token = await encryptSSOToken(payload, "8h");
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil! Mengarahkan ke dashboard...",
        redirectTo: "/dashboard",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
