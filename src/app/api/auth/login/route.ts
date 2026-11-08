import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { encryptSSOToken, COOKIE_NAME, SSOPayload } from "@/lib/sso";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
  }

  const payload: SSOPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    moduleAccess: (user.moduleAccess as Record<string, string>) || {},
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

  return NextResponse.json({ message: "Login berhasil", redirectTo: "/dashboard" });
}
