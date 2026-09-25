"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { buttonVariants } from "@/components/ui/button";
import { Wordmark } from "@/src/_global/components/Shell/Wordmark";
import {
  AppWindow,
  BandMeter,
  Canvas,
  CharacterTile,
  Chip,
} from "@/src/_global/components/Showcase/Showcase";
import { SKILL_COLOR, SKILL_TINT, STATUS_COLOR } from "@/src/_global/design/tokens";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/src/_global/motion/gsap";
import { ProgressShowcase } from "./ProgressShowcase";
import { SkillShowcase } from "./SkillShowcase";
import { ScreenSpiral } from "./ScreenSpiral";
import { CrewArc } from "./CrewArc";
import { PromptWheel } from "./PromptWheel";
import { QuestionRail } from "./QuestionRail";
import { StackSteps } from "./StackSteps";
import { Aurora, DotBackdrop, GridBackdrop } from "@/src/_global/components/Backdrop/Backdrop";

// Three.js hanya dimuat di browser dan tidak menahan render pertama.
const HeroScene = dynamic(() => import("./HeroScene").then((mod) => mod.HeroScene), { ssr: false });

const HEADLINE = "From English basics to your target IELTS band";

type Skill = keyof typeof SKILL_TINT;

const SKILLS: Array<{ id: Skill; label: string; line: string; format: string }> = [
  { id: "LISTENING", label: "Listening", line: "Conversations, monologues, discussions and talks.", format: "40 questions · 30 min" },
  { id: "READING", label: "Reading", line: "Notices, workplace documents and one long text.", format: "40 questions · 60 min" },
  { id: "WRITING", label: "Writing", line: "A letter in Task 1, an essay in Task 2.", format: "2 tasks · 60 min" },
  { id: "SPEAKING", label: "Speaking", line: "Introduction, a cue card, then discussion.", format: "3 parts · 11–14 min" },
];

// ---------------------------------------------------------------------------
// Pratinjau "jendela aplikasi" di hero
// ---------------------------------------------------------------------------

function PreviewMock() {
  return (
    <AppWindow title="Mock test" starred toolbar={<Chip color={STATUS_COLOR.working}>In progress</Chip>}>
      <p className="text-[13px] text-slate-500">GT Full Test · Package 1</p>
      <div className="mt-3 space-y-2">
        {SKILLS.map((skill, index) => (
          <div key={skill.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2">
            <CharacterTile skill={skill.id} size={30} className="rounded-lg" />
            <span className="flex-1 text-[14px] text-slate-800">{skill.label}</span>
            <Chip
              color={index === 0 ? STATUS_COLOR.done : index === 1 ? STATUS_COLOR.working : { bg: "#ecedf5", fg: "#323338" }}
              className="h-5 text-[11px]"
            >
              {index === 0 ? "Done" : index === 1 ? "Running" : "Waiting"}
            </Chip>
          </div>
        ))}
      </div>
    </AppWindow>
  );
}

function PreviewBand() {
  const bands: Array<[Skill, number]> = [
    ["LISTENING", 6.5],
    ["READING", 6],
  ];
  return (
    <AppWindow title="Test result">
      <div className="flex items-end gap-3">
        <span className="tabular font-display text-[52px] leading-none text-slate-900">6.0</span>
        <span className="pb-1 text-[13px] text-slate-500">estimated band</span>
      </div>
      <div className="mt-5 space-y-4">
        {bands.map(([skill, band]) => (
          <div key={skill}>
            <div className="mb-1.5 flex justify-between text-[13px]">
              <span className="text-slate-700">{skill === "LISTENING" ? "Listening" : "Reading"}</span>
              <span className="tabular font-medium text-slate-900">{band.toFixed(1)}</span>
            </div>
            <BandMeter band={band} target={7} color={SKILL_COLOR[skill].bg} />
          </div>
        ))}
      </div>
      <p className="mt-5 text-[12px] text-slate-500">Black line: your target band</p>
    </AppWindow>
  );
}

function PreviewUnits() {
  const units = ["Getting ready to start", "Following a conversation", "Detail & specific information"];
  return (
    <AppWindow title="Listening unit path">
      <ol className="space-y-2">
        {units.map((unit, index) => (
          <li
            key={unit}
            className={cn(
              "flex items-center gap-3 rounded-xl p-2.5 text-[14px]",
              index === 1 ? "bg-slate-950 text-white" : "border border-slate-100 text-slate-800"
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-lg text-[12px] font-medium",
                index === 0 && "bg-[#00c875] text-slate-900",
                index === 1 && "bg-[#b9e3ff] text-slate-900",
                index === 2 && "bg-slate-100 text-slate-500"
              )}
            >
              {index === 0 ? <Check size={14} strokeWidth={3} /> : index + 1}
            </span>
            <span className="truncate">{unit}</span>
          </li>
        ))}
      </ol>
    </AppWindow>
  );
}

// ---------------------------------------------------------------------------
// Halaman
// ---------------------------------------------------------------------------

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Tinggi halaman berubah setelah render (komponen dinamis, gambar, font). Hitung ulang
  // posisi semua ScrollTrigger setiap kali itu terjadi supaya pin & progres tidak meleset.
  useEffect(() => {
    let timer: number | undefined;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    observer.observe(document.body);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Intro hero: kata judul naik satu per satu, lalu paragraf dan tombol.
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-word", { yPercent: 110, duration: 0.9, stagger: 0.06 })
        .from(".hero-sub", { opacity: 0, y: 16, duration: 0.7 }, "-=0.5")
        .from(".hero-cta > *", { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, "-=0.45");

      // Pratinjau: kanvas membesar, tiap jendela bergerak dengan kecepatan berbeda (parallax).
      gsap.from(".preview-canvas", {
        scale: 0.92,
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.4,
      });
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        gsap.to(el, {
          y: () => Number(el.dataset.speed) * -70,
          ease: "none",
          scrollTrigger: { trigger: ".preview-canvas", start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      // Reveal umum untuk judul dan blok yang ditandai data-reveal.
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 48,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      // Ajakan akhir: kanvas membuka dari sedikit mengecil.
      gsap.from(".cta-canvas", {
        scale: 0.9,
        borderRadius: 80,
        ease: "none",
        scrollTrigger: { trigger: ".cta-canvas", start: "top bottom", end: "top 55%", scrub: true },
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-clip bg-white">
      <header className="sticky top-0 z-40 bg-white">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-6 px-5 lg:px-8">
          <Wordmark href="/" />
          <nav aria-label="Page sections" className="hidden items-center gap-1 md:flex">
            {[
              ["#kru", "The crew"],
              ["#progres", "Progress"],
              ["#alur", "How it works"],
              ["#jujur", "About scores"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="rounded-full px-3.5 py-2 text-[15px] text-slate-700 hover:bg-slate-100">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="whitespace-nowrap px-2 text-[15px] text-slate-800 hover:underline max-[359px]:hidden">
              Sign in
            </Link>
            <Link href="/register" className={buttonVariants({ variant: "dark", shape: "pill" })}>
              Sign up <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <GridBackdrop fade="radial" />
          {/* Layar sempit: scene jadi strip di atas judul. Layar lebar: di belakang, mengapit judul. */}
          <HeroScene className="absolute inset-x-0 top-0 h-[210px] md:inset-y-0 md:h-auto [&>canvas]:block [&>canvas]:size-full" />
          <div className="relative mx-auto max-w-[1320px] px-5 pb-16 pt-[210px] text-center md:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
          <h1
            aria-label={HEADLINE}
            className="mx-auto max-w-[17ch] font-display text-[42px] font-normal leading-[1.08] tracking-[-0.03em] text-slate-900 sm:text-[64px] lg:text-[76px]"
          >
            {HEADLINE.split(" ").map((word, index) => (
              <span key={index} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-top">
                <span className="hero-word inline-block">{word}&nbsp;</span>
              </span>
            ))}
          </h1>
          <p className="hero-sub mx-auto mt-6 max-w-[56ch] text-[18px] leading-relaxed text-slate-700">
            Practice and mock tests built for <b className="font-medium text-slate-900">General Training</b>, for people who
            study on their own. Every screen tells you what to work on today.
          </p>
          <div className="hero-cta mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/register" className={buttonVariants({ variant: "dark", shape: "pill", size: "lg" })}>
              Start learning <ArrowRight size={16} />
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "outline", shape: "pill", size: "lg" })}>
              I already have an account
            </Link>
          </div>
          <div className="mt-12">
            <CrewArc />
          </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-[1320px] px-3 sm:px-5 lg:px-8" aria-label="App preview">
          <Aurora className="-inset-x-10 -inset-y-16" intensity={0.7} />
          <Canvas tint="#f1e4fc" className="preview-canvas grid gap-4 p-4 sm:p-6 md:grid-cols-3 md:pb-14 lg:p-8 lg:pb-16 [&>*]:min-w-0">
            <div className="md:translate-y-6">
              <div data-speed="0.35">
                <PreviewUnits />
              </div>
            </div>
            <div data-speed="0.8">
              <PreviewMock />
            </div>
            <div className="md:translate-y-10">
              <div data-speed="0.2">
                <PreviewBand />
              </div>
            </div>
          </Canvas>
        </section>

        

        {/* Showcase kategori: warna, objek 3D, dan karakter berganti; scroll membuatnya menghilang */}
        <div className="pt-24">
          <SkillShowcase />
        </div>

        {/* Daftar tugas, di-pin mengikuti scroll */}
        <section className="mt-24" aria-label="What you can do">
          <PromptWheel />
        </section>

        {/* Progres */}
        <section id="progres" className="relative mx-auto max-w-[1320px] scroll-mt-20 px-3 pt-24 sm:px-5 lg:px-8" aria-labelledby="progres-title">
          <DotBackdrop fade="top" className="top-10 h-[420px]" />
          <div data-reveal className="relative mx-auto mb-10 max-w-[720px] px-2 text-center">
            <h2
              id="progres-title"
              className="font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[48px]"
            >
              Progress you can see
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-700">
              Your skill map, band trend across mock tests and a weekly study plan. The numbers below are examples
              only.
            </p>
          </div>
          <ProgressShowcase />
        </section>

        {/* Tipe soal, slide horizontal */}
        <section className="mt-24" aria-label="Question types">
          <QuestionRail />
        </section>

        {/* Layar asli aplikasi, tersusun sebagai spiral yang berputar mengikuti scroll */}
        <ScreenSpiral />

        {/* Alur, kartu bertumpuk */}
        <section id="alur" className="scroll-mt-20 pt-24" aria-label="How it works">
          <StackSteps />
        </section>

        {/* Kejujuran nilai */}
        <section id="jujur" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 pt-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center [&>*]:min-w-0">
            <div>
              <h2 data-reveal className="font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[46px]">
                Honest about scores
              </h2>
              <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-slate-700">
                We never promise official scores. What you get are estimates that openly say they’re estimates.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                ["Listening & Reading", "Auto-scored from the General Training conversion table and labelled as estimates.", "#dde8fb"],
                ["Writing & Speaking", "Scored through self-assessment with the band descriptor rubric and labelled self-reported.", "#ece3fb"],
                ["Reading GT", "Uses the stricter GT conversion, not the Academic table.", "#fbe1e8"],
                ["Short packages", "Scores are scaled to 40 questions before conversion, and we tell you so.", "#fff0d4"],
              ].map(([title, body, tint]) => (
                <li key={title} data-reveal className="rounded-3xl p-6" style={{ backgroundColor: tint }}>
                  <p className="font-display text-[19px] text-slate-900">{title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Ajakan akhir */}
        <section className="mx-auto max-w-[1320px] px-3 pb-10 pt-24 sm:px-5 lg:px-8">
          <Canvas tint="#b9e3ff" className="cta-canvas px-7 py-14 text-center sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-[20ch] font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[52px]">
              Your test date won’t wait
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-slate-800">
              Create an account, pick a track and take your first mock test today.
            </p>
            <Link href="/register" className={cn(buttonVariants({ variant: "dark", shape: "pill", size: "lg" }), "mt-9")}>
              Sign up <ArrowRight size={16} />
            </Link>
          </Canvas>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-5 py-10 text-[14px] text-slate-500 lg:px-8">
        <Wordmark href="/" />
        <p>IELTS General Training practice. Not affiliated with the official IELTS.</p>
      </footer>
    </div>
  );
}
