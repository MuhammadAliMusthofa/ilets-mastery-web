"use client";

import { ArrowUpRight } from "lucide-react";
import { SectionTitle } from "@/src/_global/components/Showcase/Showcase";

const DUMMY_TOPICS = [
  { id: 1, title: "Business & Work", count: "24 words", tint: "#dde8fb" },
  { id: 2, title: "Travel & Holidays", count: "18 words", tint: "#ffe6d9" },
  { id: 3, title: "Education & Learning", count: "32 words", tint: "#d7f5e6" },
  { id: 4, title: "Environment & Nature", count: "15 words", tint: "#ece3fb" },
];

export default function ResourceSkillContainer({ skill }: { skill: string }) {
  return (
    <section aria-labelledby="topics">
      <SectionTitle id="topics" title="Collections by topic" description={`Pick a topic to start studying ${skill}.`} />
      <div className="grid gap-5 sm:grid-cols-2">
        {DUMMY_TOPICS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className="group/topic flex min-h-[180px] flex-col rounded-4xl p-7 text-left transition-transform duration-300 ease-out hover:-translate-y-1"
            style={{ backgroundColor: topic.tint }}
          >
            <span className="flex w-full items-start justify-between">
              <span className="tabular text-[14px] text-slate-600">{topic.count}</span>
              <span className="flex size-9 items-center justify-center rounded-full bg-white text-slate-800 transition-transform duration-300 group-hover/topic:rotate-45">
                <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </span>
            <span className="mt-auto pt-8 font-display text-[26px] leading-tight text-slate-900">{topic.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
