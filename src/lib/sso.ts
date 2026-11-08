import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(process.env.SSO_SECRET_KEY);
export const COOKIE_NAME = "rpl_central_sso";

export interface SSOPayload {
  userId: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "KAPRODI" | "DOSEN" | "STAFF" | "MAHASISWA";
  // Contoh: { "modul_1": "USER", "modul_3": "ADMIN" }
  moduleAccess: Record<string, string>;
}

export async function encryptSSOToken(payload: SSOPayload, expiresIn = "8h"): Promise<string> {
  return await new EncryptJWT({ ...payload }).setProtectedHeader({ alg: "dir", enc: "A256GCM" }).setIssuedAt().setExpirationTime(expiresIn).encrypt(SECRET_KEY);
}

export async function decryptSSOToken(token: string): Promise<SSOPayload | null> {
  try {
    const { payload } = await jwtDecrypt(token, SECRET_KEY);
    return payload as unknown as SSOPayload;
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<SSOPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await decryptSSOToken(token);
}
