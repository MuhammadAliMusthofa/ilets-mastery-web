"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Blocks } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/src/_global/motion/gsap";
import { SKILL_GUIDE } from "@/src/_global/design/tokens";
import type { StageKey } from "./SkillStage";

// Three.js hanya di browser.
const SkillStage = dynamic(() => import("./SkillStage").then((mod) => mod.SkillStage), { ssr: false });

/*
 * Showcase kategori ala halaman produk JINRO: latar penuh berwarna, judul
 * raksasa di belakang objek 3D, info di kiri, dan pemilih kategori melengkung di
 * kanan bawah. Klik kategori → warna, judul, info, objek 3D, dan karakter kru
 * berganti. Scroll → objek dan karakter terangkat, berputar, lalu menghilang.
 *
 * Warna latar dipilih supaya teks tinta (#181b34) tetap lolos kontras 4.5:1.
 */

type Category = {
  key: StageKey;
  label: string;
  headline: string;
  bg: string;
  chip: string;
  title: string;
  body: string;
  guide: keyof typeof SKILL_GUIDE | null;
};

const CATEGORIES: Category[] = [
  {
    key: "LISTENING",
    label: "Listening",
    headline: "LISTEN UP",
    bg: "#ff8a5c",
    chip: "40 QUESTIONS · 30 MIN",
    title: "IELTS GT Listening",
    body: "Four sections, from everyday conversations to a talk. Train your ear with real test timing.",
    guide: "LISTENING",
  },
  {
    key: "READING",
    label: "Reading",
    headline: "READ FAST",
    bg: "#ff7d9c",
    chip: "40 QUESTIONS · 60 MIN",
    title: "IELTS GT Reading",
    body: "Notices, workplace documents and one long text. Find the detail without losing the clock.",
    guide: "READING",
  },
  {
    key: "WRITING",
    label: "Writing",
    headline: "WRITE RIGHT",
    bg: "#6aa8ff",
    chip: "2 TASKS · 60 MIN",
    title: "IELTS GT Writing",
    body: "A letter in Task 1 and an essay in Task 2, with a word counter and a band descriptor rubric.",
    guide: "WRITING",
  },
  {
    key: "SPEAKING",
    label: "Speaking",
    headline: "SPEAK EASY",
    bg: "#b98cf0",
    chip: "3 PARTS · 11–14 MIN",
    title: "IELTS GT Speaking",
    body: "Warm-up questions, a two-minute cue card and a discussion. Practise fluency with the teleprompter.",
    guide: "SPEAKING",
  },
  {
    key: "BASIC",
    label: "Basic to Hero",
    headline: "START SIMPLE",
    bg: "#3ddc97",
    chip: "52 LESSONS · 4 LEVELS",
    title: "English Basic to Hero",
    body: "Parts of speech first, then Beginner to Advanced — with a learning path that fits your calendar.",
    guide: null,
  },
];

// Pemilih disusun di seperempat lingkaran yang berpusat di tombol START (pojok kanan
// bawah wadah 300×300): dari kiri (180°) melengkung ke atas (270°).
const ARC = [180, 202.5, 225, 247.5, 270];
const ARC_CENTER = 228;
const ARC_RADIUS = 178;

export function SkillShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [index, setIndex] = useState(0);
  const current = CATEGORIES[index];

  // Masuk & scroll: judul dan karakter ikut bergerak, lalu memudar seperti objek 3D-nya.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      const track = (self: ScrollTrigger) => {
        progressRef.current = self.progress;
      };
      // Layar lebar: section di-pin selama 70% tinggi layar; objek 3D bergerak lalu hilang di rentang itu.
      mm.add("(min-width: 1024px)", () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "+=70%", pin: true, scrub: 0.6, onUpdate: track },
          })
          .to(".show-guide", { yPercent: -60, xPercent: 20, rotate: 12, opacity: 0, ease: "none" }, 0)
          .to(".show-headline", { yPercent: -35, opacity: 0.15, ease: "none" }, 0);
      });
      // Layar sempit: tanpa pin, progres diambil saat section melewati layar.
      mm.add("(max-width: 1023px)", () => {
        ScrollTrigger.create({ trigger: sectionRef.current, start: "top top", end: "bottom top", onUpdate: track });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // Ganti kategori: latar berpindah warna, judul naik huruf per huruf, info & karakter berganti.
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      if (prefersReducedMotion()) {
        section.style.backgroundColor = current.bg;
        return;
      }
      gsap.to(section, { backgroundColor: current.bg, duration: 0.7, ease: "power2.out" });
      gsap.fromTo(".show-char", { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.025, ease: "power4.out" });
      gsap.fromTo(".show-info > *", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" });
      gsap.fromTo(
        ".show-guide-inner",
        { y: 80, rotate: -8, opacity: 0 },
        { y: 0, rotate: 0, opacity: 1, duration: 0.9, delay: 0.25, ease: "back.out(1.5)" }
      );
    },
    { scope: sectionRef, dependencies: [index] }
  );

  return (
    <section
      ref={sectionRef}
      id="kru"
      aria-labelledby="show-title"
      className="relative flex min-h-screen flex-col overflow-hidden pt-16 text-[#181b34]"
      style={{ backgroundColor: CATEGORIES[0].bg }}
    >
      {/* Judul raksasa di belakang objek 3D */}
      <p
        aria-hidden="true"
        className="show-headline pointer-events-none relative z-0 mt-6 select-none overflow-hidden whitespace-nowrap px-4 text-center font-display text-[clamp(56px,13.5vw,240px)] font-semibold leading-[0.9] tracking-[-0.04em] lg:mt-10"
      >
        {current.headline.split("").map((char, i) => (
          <span key={`${current.key}-${i}`} className="show-char inline-block">
            {char === " " ? " " : char}
          </span>
        ))}
      </p>

      {/* Objek 3D, di atas judul */}
      <SkillStage active={current.key} progress={progressRef} className="absolute inset-0 z-10 [&>canvas]:block [&>canvas]:size-full" />

      {/* Karakter kru di samping objek, seperti maskot di samping botol */}
      <div className="show-guide pointer-events-none absolute left-1/2 top-[30%] z-20 hidden h-[46%] w-[21%] translate-x-[62%] lg:block">
        <div className="show-guide-inner relative size-full">
          {/* Basic tidak punya karakter sendiri; balok hurufnya sudah cukup bercerita. */}
          {current.guide && (
            <Image
              src={SKILL_GUIDE[current.guide].src}
              alt=""
              fill
              sizes="320px"
              className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,#000_78%,transparent)]"
            />
          )}
        </div>
      </div>

      {/* Info kiri bawah */}
      <div className="relative z-20 mt-auto flex flex-col gap-10 px-6 pb-10 sm:px-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="show-info max-w-[420px]" aria-live="polite">
          <span className="inline-flex h-8 items-center rounded-lg border-2 border-[#181b34] px-3 text-[12px] font-semibold tracking-[0.04em]">
            {current.chip}
          </span>
          <h2 id="show-title" className="mt-4 font-display text-[34px] font-semibold uppercase leading-[1] sm:text-[40px]">
            {current.title}
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed">{current.body}</p>
          <Link
            href="/register"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#181b34] px-7 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Explore <ArrowRight size={16} />
          </Link>
        </div>

        {/* Pemilih kategori melengkung + tombol bundar */}
        <div className="relative flex items-end gap-4 lg:h-[300px] lg:w-[300px]">
          <div role="tablist" aria-label="Choose a category" className="flex gap-2 lg:contents">
            {CATEGORIES.map((category, i) => {
              const angle = (ARC[i] * Math.PI) / 180;
              const selected = i === index;
              return (
                <button
                  key={category.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={category.label}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 sm:size-14 border-white/70 transition-transform duration-300 lg:absolute lg:left-[var(--x)] lg:top-[var(--y)]",
                    selected ? "scale-110 ring-4 ring-[#181b34]" : "hover:scale-105"
                  )}
                  style={{
                    backgroundColor: category.bg,
                    ["--x" as string]: `${ARC_CENTER + Math.cos(angle) * ARC_RADIUS - 28}px`,
                    ["--y" as string]: `${ARC_CENTER + Math.sin(angle) * ARC_RADIUS - 28}px`,
                  }}
                >
                  {category.guide ? (
                    <Image src={SKILL_GUIDE[category.guide].src} alt="" fill sizes="112px" className="object-cover object-top" />
                  ) : (
                    <Blocks size={22} aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
          <Link
            href="/register"
            className="group/start hidden size-28 shrink-0 items-center justify-center rounded-full bg-[#181b34] text-[18px] font-semibold tracking-[0.04em] text-white ring-[14px] ring-[#181b34]/15 transition-transform hover:scale-105 lg:absolute lg:bottom-0 lg:right-0 lg:flex lg:size-36 lg:text-[22px]"
          >
            START
          </Link>
        </div>
      </div>
    </section>
  );
}
