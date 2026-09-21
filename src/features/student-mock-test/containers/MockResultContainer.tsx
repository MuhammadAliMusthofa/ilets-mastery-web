"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle, Loader2, RotateCcw, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import { useAttemptResult } from "../hooks/useExam";
import { MOCK_ROUTES } from "../constants/routes";
import { SKILL_LABELS, type ReviewedQuestion, type Skill } from "@/src/models/ielts";

const SKILL_ACCENT: Record<Skill, string> = {
  LISTENING: "text-blue-600 bg-blue-50",
  READING: "text-emerald-600 bg-emerald-50",
  WRITING: "text-orange-600 bg-orange-50",
  SPEAKING: "text-brand-purple bg-brand-purple/10",
};

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
    return `${words} kata`;
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

type Filter = "all" | "wrong";

export default function MockResultContainer() {
  const router = useRouter();
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
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={20} /> Menghitung nilai…
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 font-medium text-slate-600">Hasil ujian tidak ditemukan.</p>
        <Button variant="outline" onClick={() => router.push(MOCK_ROUTES.list)}>
          Kembali ke daftar tes
        </Button>
      </div>
    );
  }

  const scoredSections = result.sections.filter((section) => section.band !== null);
  const headlineBand =
    result.overall_band ?? (scoredSections.length === 1 ? scoredSections[0].band : null);
  const hasPending = result.sections.some((section) => !section.auto_scored);
  const hasScaled = result.sections.some(
    (section) => section.auto_scored && section.max !== 40
  );
  const wrongCount = autoQuestions.filter((question) => question.is_correct === false).length;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <button
        type="button"
        onClick={() => router.push(MOCK_ROUTES.list)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-purple transition-colors mb-8 bg-white/50 px-4 py-2 rounded-full w-fit backdrop-blur-sm"
      >
        <ArrowLeft size={16} /> Kembali ke Daftar Tes
      </button>

      {/* --- Ringkasan --- */}
      <div className="relative mb-8 p-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-[32px] shadow-xl overflow-hidden">
        <div className="absolute -top-10 right-0 w-72 h-72 bg-brand-cyan/20 rounded-full blur-3xl mix-blend-screen" />
        <div className="relative flex flex-col gap-8 rounded-[31px] border border-white/10 bg-slate-900/50 p-8 text-white backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-cyan">Hasil Ujian</p>
            <h1 className="mb-3 text-3xl font-black tracking-tight sm:text-4xl">{result.package.title}</h1>
            {result.submitted_at && (
              <p className="text-sm text-slate-400">
                Dikumpulkan{" "}
                {new Date(result.submitted_at).toLocaleString("id-ID", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>

          <div className="shrink-0 text-center sm:text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {result.overall_band !== null ? "Overall band" : "Estimasi band"}
            </p>
            <p className="text-7xl font-black tabular-nums leading-none tracking-tight">
              {headlineBand !== null ? formatBand(headlineBand) : "—"}
            </p>
            {result.overall_band === null && hasPending && (
              <p className="mt-2 max-w-[16rem] text-xs text-slate-400">
                Overall band muncul setelah Writing & Speaking dinilai lewat self-assessment.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- Per skill --- */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {result.sections.map((section) => (
          <Card
            key={section.skill}
            className="rounded-[24px] border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm"
          >
            <span
              className={cn(
                "mb-4 inline-block rounded-md px-2.5 py-1 text-[11px] font-black uppercase tracking-wider",
                SKILL_ACCENT[section.skill]
              )}
            >
              {SKILL_LABELS[section.skill]}
            </span>

            {section.auto_scored ? (
              <>
                <p className="text-4xl font-black tabular-nums text-slate-900">
                  {section.band !== null ? formatBand(section.band) : "—"}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {section.raw} / {section.max} benar
                </p>
              </>
            ) : (
              <>
                <p className="text-4xl font-black text-slate-300">—</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Menunggu self-assessment</p>
              </>
            )}
          </Card>
        ))}
      </div>

      {(hasScaled || scoredSections.length > 0) && (
        <p className="mb-10 flex items-start gap-2 text-xs text-slate-500">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            Band adalah estimasi dari tabel konversi General Training, bukan nilai resmi.
            {hasScaled &&
              " Paket ini lebih pendek dari 40 soal, jadi skornya diskalakan ke 40 sebelum dikonversi."}
          </span>
        </p>
      )}

      {/* --- Pembahasan --- */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-800">Pembahasan</h2>
        <div className="flex rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
          {(
            [
              ["all", `Semua (${result.questions.length})`],
              ["wrong", `Salah (${wrongCount})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-bold transition-colors",
                filter === key ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visibleQuestions.map((question) => {
          const status = question.is_correct;
          const partial = status === false && question.awarded > 0;

          return (
            <Card
              key={question.id}
              className="rounded-2xl border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 shrink-0">
                  {status === true && <CheckCircle2 className="text-emerald-500" size={22} />}
                  {status === false && !partial && <XCircle className="text-red-500" size={22} />}
                  {partial && <MinusCircle className="text-amber-500" size={22} />}
                  {status === null && <MinusCircle className="text-slate-300" size={22} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                    <span>
                      {SKILL_LABELS[question.skill]} · Soal {question.number}
                      {question.max_marks > 1 ? `–${question.number + question.max_marks - 1}` : ""}
                    </span>
                    {status !== null && (
                      <span className="tabular-nums">
                        {question.awarded}/{question.max_marks}
                      </span>
                    )}
                  </div>

                  <p
                    className="mb-3 font-semibold text-slate-800"
                    dangerouslySetInnerHTML={{ __html: question.question_text }}
                  />

                  <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Jawabanmu
                      </dt>
                      <dd className={cn("font-medium", status === false ? "text-red-600" : "text-slate-700")}>
                        {describeAnswer(question, question.answer)}
                      </dd>
                    </div>
                    {status !== null && (
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Jawaban benar
                        </dt>
                        <dd className="font-medium text-emerald-700">{describeKey(question)}</dd>
                      </div>
                    )}
                  </dl>

                  {status === null && (
                    <p className="mt-2 text-sm text-slate-500">
                      Dinilai lewat self-assessment dengan rubrik band descriptor.
                    </p>
                  )}

                  {question.explanation && (
                    <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                      {question.explanation}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {visibleQuestions.length === 0 && (
          <p className="py-10 text-center font-medium text-slate-400">
            Tidak ada jawaban yang salah. Mantap.
          </p>
        )}
      </div>

      <div className="mt-10 flex justify-center">
        <Button
          onClick={() => router.push(MOCK_ROUTES.detail(params.testId))}
          className="h-12 rounded-xl bg-slate-900 px-6 font-bold text-white hover:bg-brand-purple"
        >
          Ulangi tes ini <RotateCcw size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
