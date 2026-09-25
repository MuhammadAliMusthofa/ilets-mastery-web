/**
 * Warna label IELTS Vibe (palet monday.com) beserta warna teks pasangannya.
 * Setiap pasangan lolos kontras teks 4.5:1 — sebagian label monday aslinya
 * memakai teks putih di atas warna terang dan gagal kontras, jadi di sini
 * label terang memakai tinta gelap.
 */

export interface LabelColor {
  bg: string;
  fg: string;
}

const INK = "#323338";
const WHITE = "#ffffff";

export const SKILL_COLOR = {
  LISTENING: { bg: "#ff7a45", fg: INK },
  READING: { bg: "#bb3354", fg: WHITE },
  WRITING: { bg: "#1f5fcc", fg: WHITE },
  SPEAKING: { bg: "#784bd1", fg: WHITE },
} as const satisfies Record<string, LabelColor>;

export const MODULE_COLOR = {
  IELTS_GT: { bg: "#0073ea", fg: WHITE },
  BASIC: { bg: "#00c875", fg: INK },
} as const satisfies Record<string, LabelColor>;

export type StatusTone = "done" | "working" | "stuck" | "empty" | "info" | "partial";

export const STATUS_COLOR: Record<StatusTone, LabelColor> = {
  done: { bg: "#00c875", fg: INK },
  working: { bg: "#fdab3d", fg: INK },
  partial: { bg: "#fdab3d", fg: INK },
  stuck: { bg: "#d83a52", fg: WHITE },
  empty: { bg: "#c4c4c4", fg: INK },
  info: { bg: "#0073ea", fg: WHITE },
};

/** Karakter kru per skill: tampil sebagai avatar di kolom "Pemandu". */
export const SKILL_GUIDE = {
  LISTENING: { name: "Listening guide", src: "/assets/icons/listeningggwp.png" },
  READING: { name: "Reading guide", src: "/assets/icons/reading.png" },
  WRITING: { name: "Writing guide", src: "/assets/icons/writingggwp.png" },
  SPEAKING: { name: "Speaking guide", src: "/assets/icons/speaking.png" },
} as const;

/**
 * Warna pastel per skill/module untuk panel besar di sisi siswa, seperti
 * kanvas lavender pada halaman marketing monday. Teks di atasnya selalu tinta.
 */
export const SKILL_TINT = {
  LISTENING: "#ffe6d9",
  READING: "#fbe1e8",
  WRITING: "#dde8fb",
  SPEAKING: "#ece3fb",
} as const;

export const MODULE_TINT = {
  IELTS_GT: "#e1ecff",
  BASIC: "#d7f5e6",
} as const;
