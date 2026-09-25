"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, MessagesSquare, MonitorPlay, Shapes, type LucideIcon } from "lucide-react";
import { Canvas, CharacterFigure } from "@/src/_global/components/Showcase/Showcase";
import { SKILL_TINT } from "@/src/_global/design/tokens";
import CoreSkillSyllabusContainer from "./core-skills/CoreSkillSyllabusContainer";
import ResourceSkillContainer from "./resource-skills/ResourceSkillContainer";
import TeleprompterContainer from "./resource-skills/TeleprompterContainer";

interface SkillDetailProps {
  skill: string;
}

type CoreSkill = keyof typeof SKILL_TINT;

const CORE: Record<string, { key: CoreSkill; title: string; lead: string }> = {
  listening: {
    key: "LISTENING",
    title: "Listening",
    lead: "Eight units, from predicting context to completing notes. Each unit unlocks the next one.",
  },
  reading: {
    key: "READING",
    title: "Reading",
    lead: "Read notices, workplace documents and long texts quickly without missing the details.",
  },
  writing: {
    key: "WRITING",
    title: "Writing",
    lead: "Write Task 1 letters in the right tone and well-organised Task 2 essays.",
  },
  speaking: {
    key: "SPEAKING",
    title: "Speaking",
    lead: "Answer fluently in Part 1, keep going for two minutes on the cue card, and discuss in Part 3.",
  },
};

const RESOURCE: Record<string, { title: string; lead: string; tint: string; accent: string; icon: LucideIcon }> = {
  tenses: { title: "Tenses", lead: "All sixteen tenses and when to use them.", tint: "#fff0d4", accent: "#b86e00", icon: Clock3 },
  vocab: { title: "Vocab & Chunking", lead: "Topic vocabulary and common collocations.", tint: "#fbe1e8", accent: "#bb3354", icon: Shapes },
  idioms: { title: "Idioms", lead: "Everyday expressions and what they mean.", tint: "#dde8fb", accent: "#1f5fcc", icon: MessagesSquare },
  teleprompter: {
    title: "Teleprompter",
    lead: "Build speaking fluency with scrolling text, like a news presenter.",
    tint: "#ece3fb",
    accent: "#784bd1",
    icon: MonitorPlay,
  },
};

const BASIC_KEYS = ["tenses", "vocab", "idioms"];

export default function SkillDetailContainer({ skill }: SkillDetailProps) {
  const key = skill.toLowerCase();
  const core = CORE[key];
  const resource = RESOURCE[key];
  const inBasic = BASIC_KEYS.includes(key);

  if (!core && !resource) {
    return <p className="mx-auto max-w-[1240px] px-5 py-10 text-[16px] text-slate-700">Material not found.</p>;
  }

  const Icon = resource?.icon;

  return (
    <div className="mx-auto max-w-[1320px] px-3 pt-4 sm:px-5 lg:px-8">
      <Link
        href={inBasic ? "/basic" : "/ielts"}
        className="mb-3 ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[14px] text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <ArrowLeft size={15} /> {inBasic ? "Basic to Hero" : "IELTS General Training"}
      </Link>

      <Canvas tint={core ? SKILL_TINT[core.key] : resource.tint} className="grid md:grid-cols-[1.5fr_1fr]">
        <div className="relative z-10 px-7 py-10 sm:px-12 sm:py-14">
          {Icon && (
            <span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-white" style={{ color: resource.accent }}>
              <Icon size={26} aria-hidden="true" />
            </span>
          )}
          <p className="text-[15px] text-slate-600">
            {core ? "IELTS General Training material" : inBasic ? "Foundation material" : "Practice tool"}
          </p>
          <h1 className="mt-2 font-display text-[40px] font-normal leading-[1.05] tracking-[-0.02em] text-slate-900 sm:text-[56px]">
            {core ? core.title : resource.title}
          </h1>
          <p className="mt-4 max-w-[50ch] text-[16px] leading-relaxed text-slate-700">{core ? core.lead : resource.lead}</p>
        </div>
        {core && (
          <div className="relative hidden min-h-[320px] md:block">
            <CharacterFigure
              skill={core.key}
              priority
              sizes="380px"
              className="absolute bottom-0 left-1/2 h-[95%] w-[88%] -translate-x-1/2"
            />
          </div>
        )}
      </Canvas>

      <div className="mx-auto max-w-[1240px] px-2 pt-14 sm:px-0">
        {core && <CoreSkillSyllabusContainer skill={key} />}
        {inBasic && <ResourceSkillContainer skill={key} />}
        {key === "teleprompter" && <TeleprompterContainer />}
      </div>
    </div>
  );
}
