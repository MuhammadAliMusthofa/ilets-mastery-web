"use client";
import type React from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Plugin didaftarkan sekali di sini; komponen cukup mengimpor dari modul ini.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/** Pengguna yang meminta gerak dikurangi tidak mendapat animasi scroll maupun parallax. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, useGSAP };

/**
 * Reveal saat scroll untuk halaman di dalam aplikasi: setiap elemen ber-atribut
 * data-reveal naik dan muncul sekali saat masuk layar.
 */
export function useScrollReveal(scope: React.RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    },
    { scope, dependencies: deps }
  );
}
