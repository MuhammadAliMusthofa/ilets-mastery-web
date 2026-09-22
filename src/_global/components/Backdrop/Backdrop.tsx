import React from "react";
import { cn } from "@/src/libs/utils";

/*
 * Latar dekoratif ala halaman monday: grid garis tipis, pola titik, dan cahaya
 * aurora lembut. Semuanya pointer-events-none, aria-hidden, dan dipudarkan di
 * tepi dengan mask supaya tidak bersaing dengan isi.
 */

type Fade = "radial" | "top" | "bottom" | "none";

const MASK: Record<Fade, string | undefined> = {
  radial: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 80%)",
  top: "linear-gradient(to bottom, #000 0%, transparent 85%)",
  bottom: "linear-gradient(to top, #000 0%, transparent 85%)",
  none: undefined,
};

export function GridBackdrop({
  cell = 72,
  color = "rgb(185 227 255 / 0.55)",
  fade = "radial",
  className,
}: {
  cell?: number;
  color?: string;
  fade?: Fade;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
        backgroundSize: `${cell}px ${cell}px`,
        backgroundPosition: "center top",
        maskImage: MASK[fade],
        WebkitMaskImage: MASK[fade],
      }}
    />
  );
}

export function DotBackdrop({
  gap = 22,
  size = 1.5,
  color = "rgb(150 153 166 / 0.45)",
  fade = "radial",
  className,
}: {
  gap?: number;
  size?: number;
  color?: string;
  fade?: Fade;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `radial-gradient(circle, ${color} ${size}px, transparent ${size + 0.5}px)`,
        backgroundSize: `${gap}px ${gap}px`,
        maskImage: MASK[fade],
        WebkitMaskImage: MASK[fade],
      }}
    />
  );
}

/**
 * Cahaya aurora: beberapa gumpalan warna skill yang diburamkan dan berputar
 * pelan. Dipakai di belakang jendela pratinjau, seperti kilau di sekitar
 * tangkapan layar produk monday.
 */
export function Aurora({ className, intensity = 0.55 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute", className)} style={{ opacity: intensity }}>
      <div className="aurora-spin absolute inset-0">
        <span className="absolute left-[8%] top-[10%] size-[46%] rounded-full bg-[#b9e3ff] blur-[70px]" />
        <span className="absolute right-[6%] top-[4%] size-[40%] rounded-full bg-[#ece3fb] blur-[70px]" />
        <span className="absolute bottom-[6%] left-[22%] size-[38%] rounded-full bg-[#c9f3a8] blur-[70px]" />
        <span className="absolute bottom-[12%] right-[14%] size-[36%] rounded-full bg-[#ffd9c7] blur-[70px]" />
      </div>
    </div>
  );
}
