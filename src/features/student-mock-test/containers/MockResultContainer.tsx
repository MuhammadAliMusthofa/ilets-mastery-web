"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowRight, Info, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import { PageBody } from "@/src/_global/components/Shell/AppShell";
import {
  BandMeter,
  Canvas,
  CharacterFigure,
  CharacterTile,
  Chip,
  PillTabs,
  SectionTitle,
} from "@/src/_global/components/Showcase/Showcase";
import { SKILL_COLOR, SKILL_TINT, STATUS_COLOR, type LabelColor } from "@/src/_global/design/tokens";
import { useAttemptResult } from "../hooks/useExam";
import { MOCK_ROUTES } from "../constants/routes";
import { SKILL_LABELS, type ReviewedQuestion } from "@/src/models/ielts";

const formatBand = (band: number) => band.toFixed(1);

/** Jawaban siswa dalam bentuk yang bisa dibaca, sesuai tipe soal. */
const describeAnswer = (question: ReviewedQuestion, values: string[]): string => {
  const filled = values.filter((value) => value && value.trim() !== "");
  if (filled.length === 0) {
    return "—";
  }
  if (question.question_type === "MULTIPLE_CHOICE" || question.question_type === "MULTIPLE_CHOICE_COMPLEX") {
    return filled
      .map((id) => {
        const option = question.options.find((item) => item.id === id);
        return option ? `${id}. ${option.text}` : id;
      })
      .join(", ");
  }
  if (question.question_type === "LONG_ESSAY") {
    const words = filled[0].trim().split(/\s+/).length;
    return `${words} words`;
  }
  return filled.join(" · ");
};

const describeKey = (question: ReviewedQuestion): string => {
  if (question.question_type === "MULTIPLE_CHOICE" || question.question_type === "MULTIPLE_CHOICE_COMPLEX") {
    return describeAnswer(question, question.accepted_answers[0] ?? []);
  }
  if (question.question_type === "TRUE_FALSE_NOT_GIVEN") {
    return (question.accepted_answers[0] ?? []).map((value) => value.replace("_", " ")).join(" / ");
  }
  return question.accepted_answers.map((variants) => variants.join(" / ")).join(" · ");
};

const verdictOf = (question: ReviewedQuestion): { label: string; color: LabelColor } => {
  if (question.is_correct === null) return { label: "Self-assessment", color: STATUS_COLOR.empty };
  if (question.is_correct) return { label: "Correct", color: STATUS_COLOR.done };
  if (question.awarded > 0) return { label: "Partial", color: STATUS_COLOR.partial };
  return { label: "Wrong", color: STATUS_COLOR.stuck };
};

type Filter = "all" | "wrong";

export default function MockResultContainer() {
  const params = useParams<{ testId: string }>();
  const searchParams = useSearchParams();
  const attemptId = Number(searchParams.get("attempt"));
  const { data: result, isLoading, isError } = useAttemptResult(attemptId);
  const [filter, setFilter] = useState<Filter>("all");

  const autoQuestions = useMemo(
    () => (result?.questions ?? []).filter((question) => question.is_correct !== null),
    [result]
  );

  const visibleQuestions = useMemo(() => {
    const list = result?.questions ?? [];
    return filter === "wrong" ? list.filter((question) => question.is_correct === false) : list;
  }, [result, filter]);

  if (isLoading) {
    return (
      <PageBody>
        <p className="flex items-center gap-2 text-[15px] text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Calculating your score…
        </p>
      </PageBody>
    );
  }

  if (isError || !result) {
    return (
      <PageBody>
        <p className="mb-5 text-[16px] text-slate-700">We couldn't find this result.</p>
        <Link href={MOCK_ROUTES.list} className="text-[15px] font-medium text-primary-500 hover:underline">
          Back to all tests
        </Link>
      </PageBody>
    );
  }

  const scoredSections = result.sections.filter((section) => section.band !== null);
  const headlineBand = result.overall_band ?? (scoredSections.length === 1 ? scoredSections[0].band : null);
  const hasPending = result.sections.some((section) => !section.auto_scored);
  const hasScaled = result.sections.some((section) => section.auto_scored && section.max !== 40);
  const wrongCount = autoQuestions.filter((question) => question.is_correct === false).length;
  const correctCount = autoQuestions.filter((question) => question.is_correct === true).length;
  const leadSkill = result.sections[0]?.skill ?? "READING";

  return (
    <>
      {/* Hero gelap: band sebagai angka terbesar di halaman. */}
      <div className="mx-auto max-w-[1320px] px-3 pt-3 sm:px-5 lg:px-8 lg:pt-6">
        <section className="relative overflow-hidden rounded-4xl bg-slate-950 text-white">
          <div className="grid lg:grid-cols-[1.2fr_1fr]">
            <div className="relative z-10 px-7 py-12 sm:px-12 lg:py-16 lg:pl-14">
              <p className="text-[15px] text-[#c3c6d4]">
                Test result
                {result.submitted_at &&
                  ` · ${new Date(result.submitted_at).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}`}
              </p>
              <h1 className="mt-3 max-w-[20ch] font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] sm:text-[46px]">
                {result.package.title}
              </h1>

              <div className="mt-8 flex items-end gap-5">
                {headlineBand !== null ? (
                  <p className="tabular font-display text-[96px] leading-[0.85] tracking-[-0.03em] sm:text-[120px]">
                    {formatBand(headlineBand)}
                  </p>
                ) : (
                  <p className="font-display text-[40px] leading-none text-[#c3c6d4] sm:text-[52px]">Pending</p>
                )}
                <div className="pb-2">
                  <p className="text-[15px] text-white">{result.overall_band !== null ? "Overall band" : "Estimated band"}</p>
                  {autoQuestions.length > 0 && (
                    <p className="tabular text-[14px] text-[#c3c6d4]">
                      {correctCount} of {autoQuestions.length} auto-marked questions correct
                    </p>
                  )}
                </div>
              </div>
              {result.overall_band === null && hasPending && (
                <p className="mt-4 max-w-[44ch] text-[14px] text-[#c3c6d4]">
                  Your overall band appears once Writing & Speaking are scored through self-assessment.
                </p>
              )}

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href={MOCK_ROUTES.detail(params.testId)}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#b9e3ff] px-7 text-[15px] font-medium text-slate-900 transition-colors hover:bg-white"
                >
                  <RotateCcw size={16} /> Retake this test
                </Link>
                <Link
                  href={MOCK_ROUTES.list}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-7 text-[15px] font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  All mock tests <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="relative hidden min-h-[360px] lg:block">
              <CharacterFigure
                skill={leadSkill}
                priority
                sizes="420px"
                className="absolute bottom-0 left-1/2 h-[90%] w-[80%] -translate-x-1/2"
              />
            </div>
          </div>
        </section>
      </div>

      <PageBody className="space-y-20 pt-12">
        {/* Band per skill */}
        <section aria-label="Band by skill">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {result.sections.map((section) => (
              <Canvas key={section.skill} as="article" tint={SKILL_TINT[section.skill]} className="p-6">
                <div className="flex items-center gap-3">
                  <CharacterTile skill={section.skill} size={44} />
                  <h2 className="font-display text-[20px] font-normal text-slate-900">{SKILL_LABELS[section.skill]}</h2>
                </div>
                {section.auto_scored ? (
                  <>
                    <p className="tabular mt-6 font-display text-[48px] leading-none text-slate-900">
                      {section.band !== null ? formatBand(section.band) : "—"}
                    </p>
                    <p className="tabular mt-2 text-[14px] text-slate-700">
                      {section.raw} / {section.max} correct
                    </p>
                    <div className="mt-4">
                      <BandMeter band={section.band} color={SKILL_COLOR[section.skill].bg} />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-6 font-display text-[28px] leading-none text-slate-500">Not scored yet</p>
                    <p className="mt-2 text-[14px] text-slate-700">Awaiting self-assessment</p>
                  </>
                )}
              </Canvas>
            ))}
          </div>

          {(hasScaled || scoredSections.length > 0) && (
            <p className="mt-5 flex items-start gap-2 text-[14px] text-slate-600">
              <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                Bands are estimates from the General Training conversion table, not official scores.
                {hasScaled && " This package has fewer than 40 questions, so the score is scaled to 40 before conversion."}
              </span>
            </p>
          )}
        </section>

        {/* Pembahasan */}
        <section aria-labelledby="pembahasan">
          <SectionTitle
            id="pembahasan"
            title="Answer review"
            description="Compare your answers with the key, then read the explanation."
            action={
              <PillTabs<Filter>
                label="Filter review"
                value={filter}
                onChange={setFilter}
                tabs={[
                  { id: "all", label: "All", count: result.questions.length },
                  { id: "wrong", label: "Wrong", count: wrongCount, dot: STATUS_COLOR.stuck.bg },
                ]}
              />
            }
          />

          <ol className="space-y-4">
            {visibleQuestions.map((question) => {
              const verdict = verdictOf(question);
              const wrong = question.is_correct === false;

              return (
                <li key={question.id} className="rounded-3xl border border-slate-200 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tabular inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-950 px-2.5 text-[13px] font-medium text-white">
                      {question.number}
                      {question.max_marks > 1 ? `–${question.number + question.max_marks - 1}` : ""}
                    </span>
                    <Chip color={SKILL_COLOR[question.skill]}>{SKILL_LABELS[question.skill]}</Chip>
                    <Chip color={verdict.color}>{verdict.label}</Chip>
                    {question.is_correct !== null && (
                      <span className="tabular ml-auto text-[13px] text-slate-600">
                        {question.awarded}/{question.max_marks} points
                      </span>
                    )}
                  </div>

                  <div
                    className="mt-4 text-[16px] leading-relaxed text-slate-900 [&_p]:my-1"
                    dangerouslySetInnerHTML={{ __html: question.question_text }}
                  />

                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className={cn("rounded-2xl px-4 py-3", wrong ? "bg-[#fdeef1]" : "bg-slate-50")}>
                      <dt className="text-[13px] text-slate-600">Your answer</dt>
                      <dd className="mt-0.5 text-[15px] font-medium text-slate-900">{describeAnswer(question, question.answer)}</dd>
                    </div>
                    {question.is_correct !== null ? (
                      <div className="rounded-2xl bg-[#dcf7ea] px-4 py-3">
                        <dt className="text-[13px] text-slate-600">Correct answer</dt>
                        <dd className="mt-0.5 text-[15px] font-medium text-slate-900">{describeKey(question)}</dd>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <dt className="text-[13px] text-slate-600">Scoring</dt>
                        <dd className="mt-0.5 text-[15px] text-slate-800">Self-assessment with the band descriptor rubric</dd>
                      </div>
                    )}
                  </dl>

                  {question.explanation && (
                    <p className="mt-4 border-l-2 border-slate-300 pl-4 text-[15px] leading-relaxed text-slate-700">
                      {question.explanation}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>

          {visibleQuestions.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center">
              <p className="font-display text-[22px] text-slate-900">No wrong answers.</p>
              <p className="mt-1 text-[15px] text-slate-600">You got every auto-marked question right.</p>
              <Button variant="outline" shape="pill" className="mt-5" onClick={() => setFilter("all")}>
                Show all
              </Button>
            </div>
          )}
        </section>
      </PageBody>
    </>
  );
}
