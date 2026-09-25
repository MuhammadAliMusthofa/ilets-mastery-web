"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { Chip, SectionTitle } from "@/src/_global/components/Showcase/Showcase";
import { SKILL_COLOR, STATUS_COLOR } from "@/src/_global/design/tokens";

// --- DUMMY DATA ---
const DUMMY_UNITS = [
  { id: 1, title: "Getting ready to start", status: "completed" },
  { id: 2, title: "Following a conversation / Identifying main ideas", status: "ongoing" },
  { id: 3, title: "Detail and specific information", status: "locked" },
  { id: 4, title: "Identifying attitudes and opinions", status: "locked" },
  { id: 5, title: "Academic contexts", status: "locked" },
  { id: 6, title: "Matching and classifying", status: "locked" },
  { id: 7, title: "Completing notes and summaries", status: "locked" },
  { id: 8, title: "Advanced practice", status: "locked" },
];

interface SkillDetailProps {
  skill: string;
}

/** Daftar unit sebagai jalur: selesai, sedang dipelajari (disorot gelap), lalu terkunci. */
export default function CoreSkillSyllabusContainer({ skill }: SkillDetailProps) {
  const units = skill === "speaking" ? DUMMY_UNITS.slice(0, 4) : DUMMY_UNITS;
  const done = units.filter((unit) => unit.status === "completed").length;
  const accent = SKILL_COLOR[skill.toUpperCase() as keyof typeof SKILL_COLOR]?.bg ?? "#0073ea";

  return (
    <section aria-labelledby="units">
      <SectionTitle
        id="units"
        title="Unit path"
        description="Complete the units in order. Each one unlocks when you finish the one before."
        action={
          <div className="w-full max-w-[260px]">
            <p className="tabular mb-2 text-[14px] text-slate-700">
              {done} of {units.length} units complete
            </p>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full" style={{ width: `${(done / units.length) * 100}%`, backgroundColor: accent }} />
            </div>
          </div>
        }
      />

      <ol className="space-y-3">
        {units.map((unit) => {
          const completed = unit.status === "completed";
          const ongoing = unit.status === "ongoing";
          const locked = unit.status === "locked";
          const href = `/student/materials/${skill}/${unit.id}`;

          return (
            <li
              key={unit.id}
              className={cn(
                "flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6",
                ongoing && "bg-slate-950 text-white",
                completed && "border border-slate-200",
                locked && "bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "tabular flex size-12 shrink-0 items-center justify-center rounded-2xl font-display text-[18px]",
                  completed && "bg-[#00c875] text-slate-900",
                  ongoing && "bg-[#b9e3ff] text-slate-900",
                  locked && "bg-slate-200 text-slate-500"
                )}
                aria-hidden="true"
              >
                {completed ? <Check size={20} strokeWidth={2.5} /> : locked ? <Lock size={18} /> : unit.id}
              </span>

              <div className="min-w-0 flex-1">
                <p className={cn("text-[13px]", ongoing ? "text-[#c3c6d4]" : "text-slate-500")}>Unit {unit.id}</p>
                <h3
                  className={cn(
                    "font-display text-[19px] font-normal leading-snug",
                    locked ? "text-slate-500" : ongoing ? "text-white" : "text-slate-900"
                  )}
                >
                  {unit.title}
                </h3>
              </div>

              {completed && (
                <div className="flex items-center gap-3">
                  <Chip color={STATUS_COLOR.done}>Completed</Chip>
                  <Link href={href} className="text-[14px] font-medium text-slate-800 hover:underline">
                    Review
                  </Link>
                </div>
              )}
              {ongoing && (
                <Link
                  href={href}
                  className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-[#b9e3ff] px-6 text-[15px] font-medium text-slate-900 transition-colors hover:bg-white sm:self-auto"
                >
                  Continue <ArrowRight size={16} />
                </Link>
              )}
              {locked && <span className="text-[14px] text-slate-500">Locked</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
