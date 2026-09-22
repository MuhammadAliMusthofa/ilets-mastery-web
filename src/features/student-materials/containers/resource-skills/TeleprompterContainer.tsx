"use client";

import React, { useState } from "react";
import { Clock, Mic2, Play } from "lucide-react";
import { PillTabs, SectionTitle } from "@/src/_global/components/Showcase/Showcase";
import { DUMMY_SCRIPTS, SCRIPT_TOPICS, TeleprompterScript } from "../../constants/teleprompter";
import TeleprompterModal from "../../components/Dialog/TeleprompterModal";

const DIFFICULTY: Record<string, { label: string; bg: string }> = {
  Easy: { label: "Easy", bg: "#d7f5e6" },
  Medium: { label: "Medium", bg: "#fff0d4" },
  Hard: { label: "Hard", bg: "#fbe1e8" },
};

export default function TeleprompterLauncher() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedScript, setSelectedScript] = useState<TeleprompterScript | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredScripts = DUMMY_SCRIPTS.filter((script) => (activeFilter === "All" ? true : script.topic === activeFilter));

  const handleOpenTeleprompter = (script: TeleprompterScript) => {
    setSelectedScript(script);
    setIsModalOpen(true);
  };

  return (
    <section aria-labelledby="scripts">
      <SectionTitle
        id="scripts"
        title="Choose a script"
        description="Read aloud as the text scrolls. Adjust the speed and font size however you like."
        action={
          <PillTabs<string>
            label="Filter by topic"
            value={activeFilter}
            onChange={setActiveFilter}
            tabs={SCRIPT_TOPICS.map((topic) => ({ id: topic, label: topic }))}
          />
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        {filteredScripts.map((script) => {
          const difficulty = DIFFICULTY[script.difficulty] ?? { label: script.difficulty, bg: "#ecedf5" };
          return (
            <button
              key={script.id}
              type="button"
              onClick={() => handleOpenTeleprompter(script)}
              className="group/script flex min-h-[200px] flex-col rounded-4xl bg-slate-50 p-7 text-left transition-colors duration-200 hover:bg-[#ece3fb]"
            >
              <span className="flex w-full items-center gap-2">
                <span className="inline-flex h-6 items-center rounded-full bg-white px-2.5 text-[12px] font-medium text-slate-700">
                  {script.topic}
                </span>
                <span
                  className="inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-medium text-slate-800"
                  style={{ backgroundColor: difficulty.bg }}
                >
                  {difficulty.label}
                </span>
                <span className="ml-auto flex size-10 items-center justify-center rounded-full bg-slate-950 text-white transition-transform duration-300 group-hover/script:scale-105">
                  <Play size={15} className="ml-0.5 fill-current" aria-hidden="true" />
                </span>
              </span>
              <span className="mt-auto pt-8 font-display text-[23px] leading-snug text-slate-900">{script.title}</span>
              <span className="mt-3 flex items-center gap-4 text-[14px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock size={15} aria-hidden="true" /> {script.estimatedTime}
                </span>
                <span className="tabular flex items-center gap-1.5">
                  <Mic2 size={15} aria-hidden="true" /> {script.content.split(" ").length} words
                </span>
              </span>
            </button>
          );
        })}

        {filteredScripts.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed border-slate-300 py-12 text-center text-[15px] text-slate-500">
            No scripts for this topic yet.
          </p>
        )}
      </div>

      <TeleprompterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} script={selectedScript} />
    </section>
  );
}
