"use client";

import { useRef } from "react";
import { cn } from "@/src/libs/utils";
import { gsap, useGSAP, prefersReducedMotion } from "@/src/_global/motion/gsap";
import { GridBackdrop } from "@/src/_global/components/Backdrop/Backdrop";

/*
 * Slide horizontal: enam tipe soal yang ditangani aplikasi, masing-masing
 * dengan cuplikan tampilannya. Di layar lebar section di-pin dan deretan kartu
 * digeser ke kiri mengikuti scroll; di layar sempit cukup digeser dengan jari.
 */

function Option({ letter, text, on }: { letter: string; text: string; on?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5 rounded-xl border p-2.5 text-[13px]", on ? "border-[#0073ea] bg-[#e6f2ff]" : "border-slate-200 bg-white")}>
      <span className={cn("flex size-6 items-center justify-center rounded-md text-[12px] font-semibold", on ? "bg-[#0073ea] text-white" : "border border-slate-300 text-slate-700")}>
        {letter}
      </span>
      <span className="text-slate-800">{text}</span>
    </div>
  );
}

const TYPES: Array<{ title: string; skill: string; tint: string; body: React.ReactNode }> = [
  {
    title: "Multiple choice",
    skill: "Listening · Reading",
    tint: "#dde8fb",
    body: (
      <div className="space-y-2">
        <Option letter="A" text="At the front desk" />
        <Option letter="B" text="In the staff room" on />
        <Option letter="C" text="Near the car park" />
      </div>
    ),
  },
  {
    title: "True / False / Not Given",
    skill: "Reading",
    tint: "#fbe1e8",
    body: (
      <div>
        <p className="mb-3 text-[13px] text-slate-700">Staff must wear ID badges at all times.</p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-center text-[12px]">
          <span className="rounded-lg bg-white py-2 font-medium text-slate-900 shadow-sm">TRUE</span>
          <span className="py-2 text-slate-600">FALSE</span>
          <span className="py-2 text-slate-600">NOT GIVEN</span>
        </div>
      </div>
    ),
  },
  {
    title: "Short answer",
    skill: "Listening · Reading",
    tint: "#ffe6d9",
    body: (
      <p className="text-[14px] leading-loose text-slate-800">
        The museum opens at{" "}
        <span className="inline-block min-w-16 rounded-md border-b-2 border-[#0073ea] bg-[#e6f2ff] px-2 text-center font-medium">9.30</span>{" "}
        and the café is on the{" "}
        <span className="inline-block min-w-16 rounded-md border-b-2 border-slate-300 bg-white px-2 text-center text-slate-400">…</span>{" "}
        floor.
      </p>
    ),
  },
  {
    title: "Map labelling",
    skill: "Listening",
    tint: "#d7f5e6",
    body: (
      <div className="relative h-32 rounded-xl border border-slate-200 bg-white">
        <span className="absolute left-3 top-3 h-12 w-20 rounded-md bg-[#ece3fb]" />
        <span className="absolute right-3 top-3 h-20 w-16 rounded-md bg-[#fff0d4]" />
        <span className="absolute bottom-3 left-3 h-10 w-28 rounded-md bg-[#dde8fb]" />
        {[
          ["left-9 top-6", "11"],
          ["right-8 top-10", "12"],
          ["bottom-5 left-14", "13"],
        ].map(([pos, n]) => (
          <span key={n} className={`absolute ${pos} flex size-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white`}>
            {n}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Multiple choice, multiple answers",
    skill: "Reading",
    tint: "#fff0d4",
    body: (
      <div className="space-y-2">
        <p className="text-[12px] text-slate-600">Choose TWO letters · 2/2 selected</p>
        <Option letter="A" text="Free parking" on />
        <Option letter="C" text="Online booking" on />
      </div>
    ),
  },
  {
    title: "Essays & letters",
    skill: "Writing · Speaking",
    tint: "#ece3fb",
    body: (
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="space-y-2">
          {[92, 100, 78, 96, 60].map((w, i) => (
            <span key={i} className="block h-2 rounded-full bg-slate-200" style={{ width: `${w}%` }} />
          ))}
        </div>
        <p className="tabular mt-3 text-right text-[12px] text-slate-600">162 / 150 words</p>
      </div>
    ),
  },
];

export function QuestionRail() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const track = trackRef.current!;
        const distance = () => track.scrollWidth - window.innerWidth + 64;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        // Kartu sedikit berputar dan kembali lurus saat melintas, memberi kesan kedalaman.
        gsap.utils.toArray<HTMLElement>(".rail-card").forEach((card) => {
          gsap.fromTo(card, { rotate: 3, y: 30 }, { rotate: 0, y: 0, ease: "none", scrollTrigger: { trigger: rootRef.current, start: "top top", end: () => `+=${distance()}`, scrub: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-white py-16">
      <GridBackdrop fade="radial" />
      <div className="relative mx-auto mb-10 w-full max-w-[1320px] px-5 lg:px-8">
        <h2 className="max-w-[18ch] font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[48px]">
          Six question types, one real-test feel
        </h2>
        <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-slate-700">
          Each question type looks like the computer-based test, so nothing feels unfamiliar on the day.
        </p>
      </div>

      <div className="relative overflow-x-auto pb-4 lg:overflow-visible [scrollbar-width:none]">
        <div ref={trackRef} className="flex w-max snap-x snap-mandatory gap-5 px-5 lg:snap-none lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))]">
          {TYPES.map((type, index) => (
            <article
              key={type.title}
              className="rail-card flex w-[300px] shrink-0 snap-start flex-col rounded-4xl p-3 sm:w-[380px]"
              style={{ backgroundColor: type.tint }}
            >
              <div className="rounded-3xl bg-white p-5">{type.body}</div>
              <div className="flex items-end justify-between gap-3 px-3 pb-2 pt-5">
                <div>
                  <p className="text-[13px] text-slate-600">{type.skill}</p>
                  <h3 className="mt-1 font-display text-[22px] font-normal leading-tight text-slate-900">{type.title}</h3>
                </div>
                <span className="tabular font-display text-[40px] leading-none text-slate-900/15">0{index + 1}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
