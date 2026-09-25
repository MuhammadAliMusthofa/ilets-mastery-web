import { BookOpen, MessagesSquare, Mic, Shapes, type LucideIcon } from "lucide-react";
import type { LevelKey, Pillar } from "@/src/models/basic";

/** Warna pastel & aksen per pilar; teks di atas tint selalu tinta gelap. */
export const PILLAR_STYLE: Record<Pillar, { tint: string; accent: string; icon: LucideIcon }> = {
  GRAMMAR: { tint: "#dde8fb", accent: "#1f5fcc", icon: BookOpen },
  VOCABULARY: { tint: "#fff0d4", accent: "#b86e00", icon: Shapes },
  CONVERSATION: { tint: "#d7f5e6", accent: "#007a47", icon: MessagesSquare },
  PRONUNCIATION: { tint: "#ece3fb", accent: "#784bd1", icon: Mic },
};

export const LEVEL_STYLE: Record<LevelKey, { tint: string; accent: string; blurb: string }> = {
  BEGINNER: { tint: "#d7f5e6", accent: "#00c875", blurb: "Start from zero: parts of speech, to be, everyday words, first conversations." },
  ELEMENTARY: { tint: "#dde8fb", accent: "#579bfc", blurb: "Past and future, daily life, getting things done." },
  INTERMEDIATE: { tint: "#fff0d4", accent: "#fdab3d", blurb: "Connect ideas, collocations, opinions and rhythm." },
  ADVANCED: { tint: "#ece3fb", accent: "#784bd1", blurb: "Precision, register and sounding natural." },
};

export const WEEKDAYS = [
  { value: 1, short: "Mon" },
  { value: 2, short: "Tue" },
  { value: 3, short: "Wed" },
  { value: 4, short: "Thu" },
  { value: 5, short: "Fri" },
  { value: 6, short: "Sat" },
  { value: 0, short: "Sun" },
] as const;

/** Nilai lulus checkpoint level. */
export const CHECKPOINT_PASS = 0.7;

/** Nilai lulus quick check sebelum lesson atau review boleh ditandai selesai. */
export const QUICK_CHECK_PASS = 0.7;

/** Jawaban benar minimal untuk lulus, dibulatkan ke atas. */
export const passMarkOf = (total: number) => (total === 0 ? 0 : Math.max(1, Math.ceil(total * QUICK_CHECK_PASS)));
