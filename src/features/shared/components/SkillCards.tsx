"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Canvas, CharacterFigure } from "@/src/_global/components/Showcase/Showcase";
import { SKILL_COLOR, SKILL_TINT } from "@/src/_global/design/tokens";
import { SKILL_STORY } from "../constants/skills";

/** Empat kartu skill, masing-masing dijaga karakter kru yang "duduk" di tepi bawah. */
export function SkillCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {SKILL_STORY.map((item) => (
        <Canvas key={item.skill} as="article" tint={SKILL_TINT[item.skill]} className="group/skill min-h-[360px]">
          <Link href={item.href} className="flex h-full flex-col p-6 outline-offset-[-4px]">
            <span className="flex items-center justify-between">
              <span
                className="inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-medium"
                style={{ backgroundColor: SKILL_COLOR[item.skill].bg, color: SKILL_COLOR[item.skill].fg }}
              >
                {item.label}
              </span>
              <span className="flex size-9 items-center justify-center rounded-full bg-white text-slate-800 transition-transform duration-300 group-hover/skill:rotate-45">
                <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </span>
            <span className="mt-5 block font-display text-[24px] leading-tight text-slate-900">{item.label}</span>
            <span className="tabular mt-1 block text-[13px] text-slate-600">{item.format}</span>
            <span className="mt-3 block max-w-[24ch] text-[14px] leading-relaxed text-slate-700">{item.focus}</span>
            <span className="sr-only">Open {item.label} materials</span>
          </Link>
          <CharacterFigure
            skill={item.skill}
            className="absolute -bottom-2 right-0 h-[170px] w-[150px] transition-transform duration-500 ease-out group-hover/skill:-translate-y-1.5"
          />
        </Canvas>
      ))}
    </div>
  );
}
