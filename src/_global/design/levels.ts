import type { GaugeSegment } from "@/src/_global/components/Charts/Charts";

/*
 * Rentang untuk gauge. Band IELTS dipetakan ke CEFR mengikuti padanan umum
 * yang dipublikasikan IELTS; level Basic to Hero diturunkan dari band yang sama
 * sampai tes penempatan jenjang tersedia.
 */

export const BAND_SEGMENTS: GaugeSegment[] = [
  { from: 0, to: 4, color: "#d83a52", label: "A2" },
  { from: 4, to: 5.5, color: "#fdab3d", label: "B1" },
  { from: 5.5, to: 7, color: "#579bfc", label: "B2" },
  { from: 7, to: 8.5, color: "#00c875", label: "C1" },
  { from: 8.5, to: 9, color: "#037f4c", label: "C2" },
];

export const LEVEL_SEGMENTS: GaugeSegment[] = [
  { from: 0, to: 4, color: "#ff7a45", label: "Beginner" },
  { from: 4, to: 5.5, color: "#fdab3d", label: "Elementary" },
  { from: 5.5, to: 7, color: "#579bfc", label: "Intermediate" },
  { from: 7, to: 9, color: "#00c875", label: "Advanced" },
];

export const segmentFor = (segments: GaugeSegment[], value: number | null) =>
  value === null ? undefined : segments.find((segment) => value >= segment.from && value <= segment.to);

/** Overall IELTS: rata-rata dibulatkan ke 0.5 terdekat. */
export const overallBand = (bands: number[]) =>
  bands.length === 0 ? null : Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 2) / 2;
