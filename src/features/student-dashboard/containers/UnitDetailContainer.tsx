"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Lightbulb } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { Button } from "@/components/ui/button";
import { Canvas, CharacterTile } from "@/src/_global/components/Showcase/Showcase";
import { SKILL_TINT } from "@/src/_global/design/tokens";

interface UnitDetailProps {
  skill: string;
  unitId: number;
}

const OPTIONS = [
  "Start thinking about the answers straight away",
  "Read the questions and predict the context",
  "Close your eyes and concentrate on the audio",
];
const CORRECT = 1;

type CoreSkill = keyof typeof SKILL_TINT;

export default function UnitDetailContainer({ skill, unitId }: UnitDetailProps) {
  const [choice, setChoice] = useState<number | null>(null);
  const skillKey = skill.toUpperCase() as CoreSkill;
  const isCore = skillKey in SKILL_TINT;
  const skillTitle = skill.charAt(0).toUpperCase() + skill.slice(1);

  return (
    <div className="mx-auto max-w-[1320px] px-3 pt-4 sm:px-5 lg:px-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2">
        <Link
          href={`/student/materials/${skill}`}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[14px] text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft size={15} /> {skillTitle} unit path
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3].map((part) => (
              <span key={part} className={cn("h-1.5 w-8 rounded-full", part <= 1 ? "bg-slate-900" : "bg-slate-200")} />
            ))}
          </div>
          <span className="tabular text-[13px] text-slate-600">Part 1 of 3</span>
        </div>
      </div>

      <Canvas tint={isCore ? SKILL_TINT[skillKey] : "#ecedf5"} className="px-7 py-10 sm:px-12 sm:py-14">
        <div className="flex items-center gap-3">
          {isCore && <CharacterTile skill={skillKey} size={44} />}
          <span className="text-[15px] text-slate-700">
            {skillTitle} · Unit {unitId}
          </span>
        </div>
        <h1 className="mt-5 max-w-[22ch] font-display text-[36px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[48px]">
          Getting ready to start
        </h1>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-slate-700">
          In this unit you'll learn to understand the context of a conversation before the audio plays, a key skill in IELTS
          Listening.
        </p>
      </Canvas>

      <article className="mx-auto max-w-[760px] px-2 pt-14 sm:px-0">
        <h2 className="font-display text-[26px] font-normal text-slate-900">The basics</h2>
        <p className="mt-4 text-[17px] leading-[1.75] text-slate-800">
          Before the recording starts, you're given time to read the questions. Use it to guess who will be speaking,
          where they are and what they'll talk about.
        </p>

        <div className="mt-8 flex gap-4 rounded-3xl bg-[#d7f5e6] p-6">
          <Lightbulb size={22} className="mt-0.5 shrink-0 text-[#007a47]" aria-hidden="true" />
          <div>
            <p className="font-medium text-slate-900">Tips</p>
            <p className="mt-1 text-[15px] leading-relaxed text-slate-800">
              Pay attention to section headings and instructions, for example{" "}
              <span className="font-semibold">&ldquo;Write NO MORE THAN TWO WORDS&rdquo;</span>. The traps are often hidden in
              these instructions.
            </p>
          </div>
        </div>

        <section aria-labelledby="quick-check" className="mt-14 rounded-4xl bg-slate-50 p-6 sm:p-8">
          <h2 id="quick-check" className="font-display text-[24px] font-normal text-slate-900">
            Quick check
          </h2>
          <p className="mt-2 text-[15px] text-slate-700">
            Based on the basics above, what should you do before the audio plays?
          </p>

          <fieldset className="mt-6 space-y-2.5">
            <legend className="sr-only">Choose one answer</legend>
            {OPTIONS.map((option, index) => {
              const picked = choice === index;
              const revealed = choice !== null;
              const right = index === CORRECT;
              return (
                <label
                  key={option}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-2xl border-2 bg-white p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-500",
                    picked && right && "border-[#00c875]",
                    picked && !right && "border-[#d83a52]",
                    !picked && "border-transparent hover:border-slate-300"
                  )}
                >
                  <input
                    type="radio"
                    name="quick-check"
                    className="sr-only"
                    checked={picked}
                    onChange={() => setChoice(index)}
                  />
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                      picked ? (right ? "border-[#00c875] bg-[#00c875]" : "border-[#d83a52] bg-[#d83a52]") : "border-slate-300"
                    )}
                    aria-hidden="true"
                  >
                    {picked && <Check size={14} strokeWidth={3} className="text-white" />}
                  </span>
                  <span className="text-[15px] text-slate-900">{option}</span>
                  {revealed && picked && (
                    <span className={cn("ml-auto text-[13px] font-medium", right ? "text-[#007a47]" : "text-[#b12a41]")}>
                      {right ? "Correct" : "Not quite"}
                    </span>
                  )}
                </label>
              );
            })}
          </fieldset>
        </section>

        <div className="mt-12 flex flex-col-reverse gap-3 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" shape="pill">
            <ChevronLeft size={18} /> Previous unit
          </Button>
          <Button variant="dark" shape="pill" size="lg">
            Finish & continue <ArrowRight size={16} />
          </Button>
        </div>
      </article>
    </div>
  );
}
