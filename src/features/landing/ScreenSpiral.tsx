"use client";

import { useEffect, useRef, useState } from "react";
import { Spiral3DSlider } from "@/components/ui/spiral-3d-slider";

/**
 * Galeri spiral berisi layar produk yang sebenarnya. Spiralnya berputar
 * sendiri dan ikut bergerak saat halaman di-scroll; komponennya sendiri
 * berhenti bergerak bila pengguna meminta gerak dikurangi.
 */

const SCREENS = [
  { src: "/assets/images/showcase/dashboard.jpg", alt: "Student home: today’s plan, quote of the day and the next mock test" },
  { src: "/assets/images/showcase/learning-path.jpg", alt: "Basic to Hero learning path with a level gauge and this week’s schedule" },
  { src: "/assets/images/showcase/quick-check.jpg", alt: "Lesson quick check: multiple choice, typing and drag-and-drop questions" },
  { src: "/assets/images/showcase/mock-tests.jpg", alt: "Mock test list: one full test and single-skill practice" },
  { src: "/assets/images/showcase/test-detail.jpg", alt: "Mock test detail with section order, duration and rules" },
  { src: "/assets/images/showcase/ielts-space.jpg", alt: "IELTS General Training space with the four skills" },
  { src: "/assets/images/showcase/path-setup.jpg", alt: "Path setup: choose a self-paced or scheduled plan" },
];

export function ScreenSpiral() {
  const sectionRef = useRef<HTMLElement>(null);
  // Di layar sempit kartunya dibesarkan; dengan batas bawaan, layar produk
  // hanya jadi bentuk warna-warni yang tidak terbaca.
  const [narrow, setNarrow] = useState(false);
  // Halaman ini sudah punya dua kanvas WebGL (hero & showcase skill). Kanvas
  // ketiga baru dibuat saat bagian ini mendekati layar, supaya perangkat lemah
  // tidak menanggung ketiganya sekaligus sejak awal.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(section);

    const query = window.matchMedia("(max-width: 640px)");
    const syncWidth = () => setNarrow(query.matches);
    syncWidth();
    query.addEventListener("change", syncWidth);

    return () => {
      observer.disconnect();
      query.removeEventListener("change", syncWidth);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="screens-title" className="relative overflow-hidden pt-24">
      <div data-reveal className="mx-auto mb-4 max-w-[720px] px-5 text-center">
        <h2
          id="screens-title"
          className="font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[48px]"
        >
          Every screen, in one spiral
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-slate-700">
          Real screens from the app — scroll to travel through them.
        </p>
      </div>

      {mounted ? (
        <Spiral3DSlider
          items={SCREENS}
          ariaLabel="Screens from IELTS vibe"
          className="min-h-[34rem] bg-transparent sm:min-h-[42rem] dark:bg-transparent"
          cardWidth={narrow ? 260 : 300}
          radius={narrow ? 150 : 250}
          cardAspectRatio={3 / 2}
          maxWidthRatio={narrow ? 0.52 : 0.225}
          maxRadiusRatio={narrow ? 0.3 : 0.245}
        />
      ) : (
        // Penahan tinggi supaya tata letak tidak melompat saat spiralnya dipasang.
        <div aria-hidden="true" className="min-h-[34rem] sm:min-h-[42rem]" />
      )}
    </section>
  );
}
