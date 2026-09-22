"use client";

import React, { useRef } from "react";
import { CloudUpload, Flag, Headphones, Timer } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/src/_global/motion/gsap";
import { CharacterTile } from "@/src/_global/components/Showcase/Showcase";
import { DotBackdrop } from "@/src/_global/components/Backdrop/Backdrop";
import { SKILL_TINT } from "@/src/_global/design/tokens";

type Skill = keyof typeof SKILL_TINT;

const STEPS: Array<{
  title: string;
  body: string;
  tint: string;
  nodes: Array<{ skill?: Skill; icon?: typeof Flag; text: React.ReactNode }>;
}> = [
  {
    title: "Start from where you are",
    body: "Foundations still shaky? Start with Basic to Hero. Already have a test date? Go straight to IELTS General Training. You can run both from one account.",
    tint: "#e1ecff",
    nodes: [
      { icon: Flag, text: <><b>Account</b> created</> },
      { skill: "READING", text: <><b>Basic to Hero</b> or <b>IELTS GT</b></> },
      { skill: "SPEAKING", text: <>Target band <b>set</b></> },
    ],
  },
  {
    title: "A crew guides every skill",
    body: "Each skill has its own guide: strategies, General Training question formats and short practice sessions that fit into a busy day.",
    tint: "#ffe6d9",
    nodes: [
      { skill: "LISTENING", text: <><b>Listening</b> unit done</> },
      { skill: "READING", text: <>20-minute <b>Reading</b> practice</> },
      { skill: "WRITING", text: <><b>Task 1</b> letter written</> },
    ],
  },
  {
    title: "Feels like test day",
    body: "The timer runs on the server, answers save automatically, and you can flag questions to check before you submit.",
    tint: "#ece3fb",
    nodes: [
      { icon: Timer, text: <><b>2:45:00</b> timer started</> },
      { icon: CloudUpload, text: <>Answers <b>saved automatically</b></> },
      { icon: Headphones, text: <><b>Section 1</b> audio playing</> },
    ],
  },
  {
    title: "Know where you stand and what's next",
    body: "Listening and Reading bands come from the General Training conversion table and are labelled as estimates. Every question has an explanation, including why your answer was wrong.",
    tint: "#d7f5e6",
    nodes: [
      { skill: "LISTENING", text: <>Listening <b>6.5</b></> },
      { skill: "READING", text: <>Reading <b>6.0</b></> },
      { icon: Flag, text: <><b>3 questions</b> to review</> },
    ],
  },
];

const TOP = 96;
const STEP_OFFSET = 22;

/**
 * Scroll stack: setiap kartu menempel (sticky) sedikit lebih rendah dari yang
 * sebelumnya; saat kartu berikutnya naik, kartu di bawahnya mengecil dan meredup
 * sehingga tampak bertumpuk ke belakang.
 */
export function StackSteps() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
      cards.forEach((card, index) => {
        const next = cards[index + 1];
        if (!next) return;
        // Nilai awal filter ditulis eksplisit: interpolasi dari "none" membuat kartu sempat menghitam.
        gsap.fromTo(
          card.querySelector(".stack-inner"),
          { scale: 1, filter: "brightness(1)" },
          {
          scale: 0.9 + index * 0.02,
          filter: "brightness(0.94)",
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: `top ${TOP + (index + 1) * STEP_OFFSET}px`, scrub: true },
          }
        );
      });
      gsap.utils.toArray<HTMLElement>(".stack-node").forEach((node) => {
        gsap.from(node, {
          x: -24,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: node, start: "top 85%", once: true },
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="relative mx-auto max-w-[1320px] px-3 sm:px-5 lg:px-8">
      <div className="mx-auto mb-10 max-w-[720px] px-2 text-center">
        <h2 className="font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[48px]">
          How it works, step by step
        </h2>
      </div>

      <ol className="space-y-8 pb-10">
        {STEPS.map((step, index) => (
          <li key={step.title} className="stack-card sticky" style={{ top: TOP + index * STEP_OFFSET }}>
            <div
              className="stack-inner relative grid origin-top overflow-hidden rounded-4xl p-3 shadow-[0_-12px_40px_-20px_rgb(24_27_52/0.25)] sm:p-4 lg:min-h-[460px] lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0"
              style={{ backgroundColor: step.tint }}
            >
              <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl bg-white px-6 py-10">
                <DotBackdrop />
                <ol className="relative w-full max-w-[360px] space-y-5">
                  <span className="absolute bottom-8 left-[30px] top-8 w-px bg-slate-300" aria-hidden="true" />
                  {step.nodes.map((node, nodeIndex) => {
                    const Icon = node.icon;
                    return (
                      <li
                        key={nodeIndex}
                        className="stack-node relative flex items-center gap-3 rounded-2xl bg-white p-3 text-[15px] text-slate-800 shadow-[0_6px_20px_-12px_rgb(24_27_52/0.3)] ring-1 ring-slate-100 [&_b]:font-semibold"
                      >
                        {node.skill ? (
                          <CharacterTile skill={node.skill} size={36} className="rounded-xl" />
                        ) : (
                          <span className="flex size-9 items-center justify-center rounded-xl bg-[#00c875] text-slate-900">
                            {Icon && <Icon size={17} aria-hidden="true" />}
                          </span>
                        )}
                        <span>{node.text}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="flex flex-col justify-center px-5 pb-8 pt-8 sm:px-10 lg:py-10">
                <span className="tabular font-display text-[15px] text-slate-600">Step 0{index + 1}</span>
                <h3 className="mt-2 font-display text-[30px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[42px]">
                  {step.title}
                </h3>
                <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-slate-800">{step.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
