"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { gsap, useGSAP, prefersReducedMotion } from "@/src/_global/motion/gsap";
import { CharacterTile, Chip } from "@/src/_global/components/Showcase/Showcase";
import { VibeMark } from "@/src/_global/components/Shell/Wordmark";
import { Aurora } from "@/src/_global/components/Backdrop/Backdrop";
import { SKILL_COLOR, STATUS_COLOR } from "@/src/_global/design/tokens";

type Skill = keyof typeof SKILL_COLOR;

type Visual =
  | { kind: "list"; rows: Array<{ skill: Skill; text: string; done?: boolean }> }
  | { kind: "bars"; rows: Array<{ label: string; value: number; color: string }> }
  | { kind: "donut"; parts: Array<{ label: string; value: number; color: string }> }
  | { kind: "letter" };

const PROMPTS: Array<{ pill: string; reply: string; visual: Visual }> = [
  {
    pill: "Practise Listening",
    reply: "A Listening unit, broken into three short steps.",
    visual: {
      kind: "list",
      rows: [
        { skill: "LISTENING", text: "Read the questions & predict the context", done: true },
        { skill: "LISTENING", text: "Listen to the Section 1 audio" },
        { skill: "LISTENING", text: "Check answers & review" },
      ],
    },
  },
  {
    pill: "Check my latest band",
    reply: "Bands from your latest submitted mock test, per skill.",
    visual: {
      kind: "bars",
      rows: [
        { label: "Listening", value: 6.5, color: SKILL_COLOR.LISTENING.bg },
        { label: "Reading", value: 6, color: SKILL_COLOR.READING.bg },
        { label: "Writing", value: 5.5, color: SKILL_COLOR.WRITING.bg },
      ],
    },
  },
  {
    pill: "Write a Task 1 letter",
    reply: "A letter editor built around the three bullet points in the task.",
    visual: { kind: "letter" },
  },
  {
    pill: "Review wrong answers",
    reply: "Explanations grouped by the question types you miss most.",
    visual: {
      kind: "donut",
      parts: [
        { label: "True/False/NG", value: 45, color: SKILL_COLOR.SPEAKING.bg },
        { label: "Short answer", value: 35, color: "#579bfc" },
        { label: "Multiple choice", value: 20, color: "#9cd326" },
      ],
    },
  },
  {
    pill: "Plan my week",
    reply: "Suggested practice order: your lowest-band skill comes first.",
    visual: {
      kind: "list",
      rows: [
        { skill: "WRITING", text: "Mon–Tue · Task 1 letter" },
        { skill: "READING", text: "Wed–Thu · Reading GT section 2" },
        { skill: "SPEAKING", text: "Fri · 2-minute cue card" },
      ],
    },
  },
];

function Donut({ parts }: { parts: Array<{ label: string; value: number; color: string }> }) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  const stops = parts
    .map((part, index) => {
      const before = parts.slice(0, index).reduce((sum, item) => sum + item.value, 0);
      return `${part.color} ${(before / total) * 360}deg ${((before + part.value) / total) * 360}deg`;
    })
    .join(", ");
  return (
    <div className="flex items-center gap-5">
      <span className="wheel-pop size-24 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops})` }} />
      <ul className="space-y-2 text-[13px] text-slate-700">
        {parts.map((part) => (
          <li key={part.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: part.color }} />
            {part.label} <span className="tabular text-slate-500">{part.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VisualBlock({ visual }: { visual: Visual }) {
  if (visual.kind === "list") {
    return (
      <ul className="space-y-2">
        {visual.rows.map((row) => (
          <li key={row.text} className="wheel-pop flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 text-[14px] text-slate-800">
            <CharacterTile skill={row.skill} size={30} className="rounded-lg" />
            <span className="flex-1">{row.text}</span>
            {row.done ? (
              <Chip color={STATUS_COLOR.done} className="h-5 text-[11px]">
                <Check size={11} strokeWidth={3} /> Done
              </Chip>
            ) : (
              <span className="size-4 rounded-full border-2 border-slate-300" />
            )}
          </li>
        ))}
      </ul>
    );
  }
  if (visual.kind === "bars") {
    return (
      <div className="space-y-3">
        {visual.rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-[13px]">
              <span className="text-slate-700">{row.label}</span>
              <span className="tabular font-medium text-slate-900">{row.value.toFixed(1)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100">
              <div className="wheel-bar h-2.5 rounded-full" style={{ width: `${(row.value / 9) * 100}%`, backgroundColor: row.color }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (visual.kind === "donut") return <Donut parts={visual.parts} />;
  return (
    <div className="wheel-pop space-y-2 rounded-xl border border-slate-100 p-3 font-mono text-[12.5px] leading-relaxed text-slate-700">
      <p>Dear Sir or Madam,</p>
      <p>
        I am writing to complain about <span className="rounded bg-[#ffe6d9] px-1">the delivery I received</span> on…
      </p>
      <p className="text-slate-400">Point 2 · Explain the problem</p>
      <p className="text-slate-400">Point 3 · Ask for a solution</p>
    </div>
  );
}

/**
 * Daftar tugas ala halaman monday sidekick: pill menyala satu per satu
 * mengikuti scroll (di-pin di layar lebar), jendela aplikasi berganti isinya.
 * Di layar sempit tidak di-pin; pill cukup diketuk.
 */
export function PromptWheel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const current = PROMPTS[active];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: `+=${PROMPTS.length * 380}`,
            pin: true,
            scrub: true,
            onUpdate: (self) => setActive(Math.min(PROMPTS.length - 1, Math.floor(self.progress * PROMPTS.length))),
          },
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  // Isi jendela dianimasikan ulang tiap kali perintah aktif berganti.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline()
        .from(".wheel-ask", { y: 14, opacity: 0, duration: 0.35 })
        .from(".wheel-reply", { y: 10, opacity: 0, duration: 0.35 }, "-=0.1")
        .from(".wheel-pop", { y: 12, opacity: 0, scale: 0.96, duration: 0.35, stagger: 0.07 }, "-=0.15")
        .from(".wheel-bar", { scaleX: 0, transformOrigin: "left", duration: 0.6, stagger: 0.08, ease: "power3.out" }, "<");
    },
    { scope: rootRef, dependencies: [active] }
  );

  return (
    <div ref={rootRef} className="relative flex min-h-screen items-center overflow-hidden bg-slate-50 py-16">
      <div className="mx-auto grid w-full max-w-[1320px] items-center gap-10 px-5 lg:grid-cols-[1fr_1.15fr] lg:px-8 [&>*]:min-w-0">
        <div>
          <h2 className="mb-8 max-w-[16ch] font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[44px]">
            What do you want to work on today?
          </h2>
          <ul className="flex gap-3 overflow-x-auto pb-2 lg:block lg:space-y-3 lg:overflow-visible" role="tablist" aria-label="Example tasks">
            {PROMPTS.map((prompt, index) => {
              const on = index === active;
              // Lengkung: pill bergeser ke kanan mendekati pill aktif, seperti roda.
              const offset = Math.max(0, 3 - Math.abs(index - active)) * 36;
              return (
                <li key={prompt.pill} className="shrink-0 transition-transform duration-500 ease-out lg:[transform:translateX(var(--x))]" style={{ ["--x" as string]: `${offset}px` }}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setActive(index)}
                    className={cn(
                      "h-14 rounded-full px-8 text-[17px] transition-all duration-300 lg:h-16 lg:w-[320px] lg:text-[20px]",
                      on
                        ? "rainbow-ring scale-105 text-slate-900 shadow-[0_12px_30px_-12px_rgb(120_75_209/0.45)]"
                        : "border border-slate-200 bg-white/60 text-slate-400 hover:text-slate-700"
                    )}
                  >
                    {prompt.pill}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative">
          <Aurora className="-inset-16" intensity={0.8} />
          <div className="relative overflow-hidden rounded-3xl border border-white bg-white shadow-[0_30px_80px_-30px_rgb(24_27_52/0.35)]">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
              <VibeMark size={18} />
              <span className="text-[14px] font-medium text-slate-800">IELTS Vibe</span>
              <span className="ml-auto flex gap-1.5">
                {["#ff7a45", "#fdab3d", "#00c875"].map((color) => (
                  <span key={color} className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
                ))}
              </span>
            </div>
            <div className="min-h-[380px] space-y-4 p-6" aria-live="polite">
              <h3 className="wheel-ask font-display text-[24px] font-normal text-slate-900">{current.pill}</h3>
              <p className="wheel-reply text-[15px] text-slate-700">{current.reply}</p>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <VisualBlock visual={current.visual} />
              </div>
              <p className="text-[12px] text-slate-400">Sample view · illustrative data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
