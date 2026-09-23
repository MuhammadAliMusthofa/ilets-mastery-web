"use client";

import React, { useRef } from "react";
import { ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "./gsap";

/**
 * Pembungkus yang menganimasikan isinya saat ia muncul — termasuk ketika
 * datanya baru datang dari server, karena animasinya dipicu oleh mount
 * komponen, bukan oleh scroll saja. Yang masih di bawah layar menunggu
 * di-scroll; yang sudah terlihat langsung naik-pudar di tempat.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  /** Selector anak yang dianimasikan berurutan, mis. "article" untuk grid kartu. */
  select,
  stagger = 0.08,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  select?: string;
  stagger?: number;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (context, contextSafe) => {
      const el = ref.current;
      if (!el || prefersReducedMotion() || !contextSafe) return;

      const play = contextSafe((targets: HTMLElement[]) => {
        // Elemen yang masih jauh di bawah layar dianimasikan saat di-scroll;
        // sisanya langsung, supaya isi paruh atas tidak menunggu interaksi.
        const belowFold = el.getBoundingClientRect().top > window.innerHeight * 0.9;

        gsap.from(targets, {
          y,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          delay: belowFold ? 0 : delay,
          stagger: select ? stagger : 0,
          clearProps: "opacity,transform",
          ...(belowFold ? { scrollTrigger: { trigger: el, start: "top 88%", once: true } } : {}),
        });

        // Bagian yang datanya menyusul menggeser isi di bawahnya, jadi titik
        // picu milik bagian lain harus dihitung ulang.
        ScrollTrigger.refresh();
      });

      const targets = select ? gsap.utils.toArray<HTMLElement>(select, el) : [el];
      if (targets.length > 0) {
        play(targets);
        return;
      }

      // Isinya belum ada — biasanya masih "Loading…" dan kartunya menyusul.
      // Tunggu sampai anaknya benar-benar dirender, lalu animasikan sekali.
      const observer = new MutationObserver(() => {
        const found = gsap.utils.toArray<HTMLElement>(select as string, el);
        if (found.length === 0) return;
        observer.disconnect();
        play(found);
      });
      observer.observe(el, { childList: true, subtree: true });
      return () => observer.disconnect();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement & HTMLElement>} className={className} data-reveal-wrap="">
      {children}
    </Tag>
  );
}
