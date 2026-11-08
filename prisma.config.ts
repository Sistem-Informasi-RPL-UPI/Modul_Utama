import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // CLI (migrate, db push, studio) pakai koneksi langsung (non-pooler) Neon
  datasource: {
    url: env("DIRECT_URL"),
  },
});
