export interface ModuleConfig {
  id: string;
  number: number;
  name: string;
  group: string;
  isPublicRead: boolean;
  callbackUrl: string; // URL penerima token SSO (ketika user sudah login)
  publicUrl: string; // URL halaman publik (ketika diakses tamu tanpa login)
}

export const ACCESS_LEVELS = ["NONE", "VIEWER", "USER", "EDITOR", "ADMIN"] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

// Preset otomatis untuk user yang daftar mandiri (Role: MAHASISWA)
export const DEFAULT_MAHASISWA_ACCESS: Record<string, AccessLevel> = {
  modul_1: "USER",
  modul_2: "NONE",
  modul_3: "USER",
  modul_4: "VIEWER",
  modul_5: "USER",
  modul_6: "USER",
  modul_7: "VIEWER",
  modul_8: "NONE",
  modul_9: "USER",
  modul_10: "USER",
};

export const RPL_MODULES: ModuleConfig[] = [
  {
    id: "modul_1",
    number: 1,
    name: "Sistem Informasi Akademik Seminar Proposal dan Tugas Akhir",
    group: "SINERGO",
    isPublicRead: false,
    callbackUrl: "https://modul1-kelompok-e.vercel.app/api/auth/sso-callback",
    publicUrl: "https://modul1-kelompok-e.vercel.app",
  },
  {
    id: "modul_2",
    number: 2,
    name: "Sistem Informasi Notulensi Rapat",
    group: "Nodecraft",
    isPublicRead: false,
    callbackUrl: "https://modul2-kelompok-b.vercel.app/api/auth/sso-callback",
    publicUrl: "https://modul2-kelompok-b.vercel.app",
  },
  {
    id: "modul_3",
    number: 3,
    name: "Sistem Informasi Layanan Pengajuan Surat untuk Mahasiswa",
    group: "Friday",
    isPublicRead: false,
    callbackUrl: "https://modul3-kelompok-d.vercel.app/api/auth/sso-callback",
    publicUrl: "https://modul3-kelompok-d.vercel.app",
  },
  {
    id: "modul_4",
    number: 4,
    name: "Sistem Penataan Arsip Program Studi (SK, Surat Tugas, dsb.)",
    group: "Overexposed",
    isPublicRead: true,
    callbackUrl: "https://modul4-7-rpl.vercel.app/api/auth/sso-callback?target=/arsip",
    publicUrl: "https://modul4-7-rpl.vercel.app/arsip",
  },
  {
    id: "modul_5",
    number: 5,
    name: "Sistem Informasi P3NK / Magang & Studi Independen",
    group: "SINERGO",
    isPublicRead: false,
    callbackUrl: "https://modul5-kelompok-e.vercel.app/api/auth/sso-callback",
    publicUrl: "https://modul5-kelompok-e.vercel.app",
  },
  {
    id: "modul_6",
    number: 6,
    name: "Sistem Informasi Peminjaman Barang dan Ruangan Lab",
    group: "Friday",
    isPublicRead: true,
    callbackUrl: "https://modul6-kelompok-d.vercel.app/api/auth/sso-callback",
    publicUrl: "https://modul6-kelompok-d.vercel.app",
  },
  {
    id: "modul_7",
    number: 7,
    name: "Sistem Informasi Data Penelitian/PkM, Publikasi Dosen",
    group: "Overexposed",
    isPublicRead: true,
    callbackUrl: "https://modul4-7-rpl.vercel.app/api/auth/sso-callback?target=/penelitian",
    publicUrl: "https://modul4-7-rpl.vercel.app/penelitian",
  },
  {
    id: "modul_8",
    number: 8,
    name: "Dashboard Kinerja dan Penugasan Dosen dan Staf Program Studi",
    group: "Nodecraft",
    isPublicRead: false,
    callbackUrl: "https://modul8-kelompok-b.vercel.app/api/auth/sso-callback",
    publicUrl: "https://modul8-kelompok-b.vercel.app",
  },
  {
    id: "modul_9",
    number: 9,
    name: "Sistem Informasi Repository Portofolio Mahasiswa",
    group: "Arcova",
    isPublicRead: true,
    callbackUrl: "https://modul9-kelompok-a.vercel.app/api/auth/sso-callback",
    publicUrl: "https://modul9-kelompok-a.vercel.app",
  },
  {
    id: "modul_10",
    number: 10,
    name: "Dashboard Data Mahasiswa (Prestasi, Project, Penelitian, dll)",
    group: "Arcova",
    isPublicRead: true,
    callbackUrl: "https://modul10-kelompok-a.vercel.app/api/auth/sso-callback",
    publicUrl: "https://modul10-kelompok-a.vercel.app",
  },
];
