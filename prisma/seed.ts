import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Akun Super Admin (Akses penuh ke semua modul & kelola user)
  const superAdminAccess = Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [`modul_${i + 1}`, "ADMIN"])
  );
  await prisma.user.upsert({
    where: { email: "superadmin@upi.edu" },
    update: { role: "SUPER_ADMIN", moduleAccess: superAdminAccess },
    create: {
      name: "Super Admin RPL",
      email: "superadmin@upi.edu",
      passwordHash,
      role: "SUPER_ADMIN",
      moduleAccess: superAdminAccess,
    },
  });

  // 2. Akun Staff Prodi (Admin di Modul 3, 4, 6; Editor/Viewer di modul lain)
  const staffAccess = {
    modul_2: "EDITOR",
    modul_3: "ADMIN",
    modul_4: "ADMIN",
    modul_6: "ADMIN",
    modul_8: "VIEWER",
  };
  await prisma.user.upsert({
    where: { email: "staff@upi.edu" },
    update: { role: "STAFF", moduleAccess: staffAccess },
    create: {
      name: "Staf Administrasi RPL",
      email: "staff@upi.edu",
      passwordHash,
      role: "STAFF",
      moduleAccess: staffAccess,
    },
  });

  console.log("Seed berhasil! Password semua akun: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
