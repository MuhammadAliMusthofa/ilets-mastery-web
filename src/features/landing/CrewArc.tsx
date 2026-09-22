"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, prefersReducedMotion } from "@/src/_global/motion/gsap";
import { VibeMark } from "@/src/_global/components/Shell/Wordmark";
import { SKILL_COLOR, SKILL_GUIDE, SKILL_TINT } from "@/src/_global/design/tokens";

type Skill = keyof typeof SKILL_GUIDE;

type Item =
  | { kind: "dot"; size: number; color: string }
  | { kind: "crew"; size: number; skill: Skill }
  | { kind: "mark"; size: number };

// Simetris: titik kecil di ujung, karakter membesar ke tengah, tanda IELTS Vibe di pusat.
const ITEMS: Item[] = [
  { kind: "dot", size: 44, color: "#fdab3d" },
  { kind: "dot", size: 64, color: SKILL_COLOR.LISTENING.bg },
  { kind: "crew", size: 92, skill: "LISTENING" },
  { kind: "crew", size: 124, skill: "READING" },
  { kind: "mark", size: 156 },
  { kind: "crew", size: 124, skill: "WRITING" },
  { kind: "crew", size: 92, skill: "SPEAKING" },
  { kind: "dot", size: 64, color: SKILL_COLOR.SPEAKING.bg },
  { kind: "dot", size: 44, color: "#c9f3a8" },
];

/** Deret lingkaran kru di bawah hero; muncul dari tengah lalu mengapung pelan. */
export function CrewArc() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".crew-item", {
        scale: 0,
        duration: 0.8,
        ease: "back.out(1.8)",
        stagger: { each: 0.07, from: "center" },
        delay: 0.6,
      });
      gsap.utils.toArray<HTMLElement>(".crew-item").forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? -8 : 8, duration: 2.4 + (i % 3) * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.4 });
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} aria-hidden="true" className="flex items-center justify-center py-6 [--k:0.58] max-sm:py-2 sm:[--k:1]">
      {ITEMS.map((item, index) => (
        <span
          key={index}
          className={`crew-item relative -mx-2.5 shrink-0 overflow-hidden rounded-full ring-4 ring-white ${item.kind === "dot" ? "max-sm:hidden" : ""}`}
          style={{
            // Ukuran asli dikali --k (0.58 di layar sempit) supaya lebar tata letak ikut mengecil.
            width: `calc(${item.size}px * var(--k))`,
            height: `calc(${item.size}px * var(--k))`,
            zIndex: 10 - Math.abs(index - 4),
            backgroundColor:
              item.kind === "dot" ? item.color : item.kind === "crew" ? SKILL_TINT[item.skill] : "#181b34",
          }}
        >
          {item.kind === "crew" && (
            <Image
              src={SKILL_GUIDE[item.skill].src}
              alt=""
              fill
              sizes={`${item.size * 2}px`}
              className="object-cover object-top"
            />
          )}
          {item.kind === "mark" && (
            <span className="flex size-full items-center justify-center">
              <span className="scale-[var(--k)]"><VibeMark size={64} /></span>
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
