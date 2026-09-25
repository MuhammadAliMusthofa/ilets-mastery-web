"use client";

import { Loader2 } from "lucide-react";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import {
  ArrowLink,
  Canvas,
  CharacterTile,
  PillLink,
  SectionTitle,
} from "@/src/_global/components/Showcase/Showcase";
import { ModuleSwitcher } from "../components/ModuleSwitcher";
import { SkillCards } from "../components/SkillCards";
import { SKILL_STORY } from "../constants/skills";
import { useExamPackages } from "@/src/features/student-mock-test/hooks/useExam";
import { MockCardGrid } from "@/src/features/student-mock-test/components/MockCard";
import { MOCK_ROUTES } from "@/src/features/student-mock-test/constants/routes";

// ---------------------------------------------------------------------------
// IELTS General Training
// ---------------------------------------------------------------------------

const EXAM_DURATION: Record<string, string> = {
  LISTENING: "30 min",
  READING: "60 min",
  WRITING: "60 min",
  SPEAKING: "11–14 min",
};

/** Alur hari ujian: empat simpul berurutan, tersambung garis, seperti alur otomasi monday. */
function ExamFlow() {
  return (
    <Canvas tint="#f6f7fb" className="px-6 py-10 sm:px-10">
      <ol className="relative grid gap-6 md:grid-cols-4 md:gap-4">
        <span className="absolute left-[27px] top-6 hidden h-px w-[calc(100%-54px)] bg-slate-300 md:block" aria-hidden="true" />
        {SKILL_STORY.map((item, index) => (
          <li key={item.skill} className="relative flex gap-4 md:flex-col md:gap-0">
            <CharacterTile skill={item.skill} size={54} className="rounded-2xl ring-4 ring-[#f6f7fb]" />
            <div className="md:mt-4 md:pr-4">
              <p className="text-[13px] text-slate-500">Step {index + 1}</p>
              <p className="font-display text-[20px] text-slate-900">{item.label}</p>
              <p className="tabular mt-1 text-[14px] text-slate-700">{EXAM_DURATION[item.skill]}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{item.focus}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-8 border-t border-slate-200 pt-5 text-[14px] text-slate-600">
        Listening, Reading and Writing are taken back to back. Speaking is usually scheduled on the same day or
        up to a week later.
      </p>
    </Canvas>
  );
}

export function IeltsOverviewContainer() {
  const { data: packages, isLoading } = useExamPackages();

  return (
    <>
      <PageHeader
        title="English for IELTS General Training"
        description="Strategy lessons, skill practice and full test simulations in the General Training format."
        actions={<PillLink href={MOCK_ROUTES.list} size="lg">Start a mock test</PillLink>}
      >
        <ModuleSwitcher />
      </PageHeader>
      <PageBody className="space-y-20">
        <section aria-labelledby="ielts-skills">
          <SectionTitle id="ielts-skills" title="Pick a skill, meet its guide" />
          <SkillCards />
        </section>

        <section aria-labelledby="ielts-flow">
          <SectionTitle
            id="ielts-flow"
            title="What test day looks like"
            description="Every full mock test here uses the same order and timing."
          />
          <ExamFlow />
        </section>

        <section aria-labelledby="ielts-mock">
          <SectionTitle
            id="ielts-mock"
            title="Mock test"
            action={<ArrowLink href={MOCK_ROUTES.list}>All mock tests</ArrowLink>}
          />
          {isLoading && (
            <p className="flex items-center gap-2 text-[15px] text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Loading tests…
            </p>
          )}
          {packages && <MockCardGrid packages={packages.slice(0, 4)} emptyText="No tests have been published yet." />}
        </section>
      </PageBody>
    </>
  );
}
