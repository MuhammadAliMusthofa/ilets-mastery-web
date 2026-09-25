"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Flag, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody } from "@/src/_global/components/Shell/AppShell";
import { Canvas, Chip } from "@/src/_global/components/Showcase/Showcase";
import { GaugeChart } from "@/src/_global/components/Charts/Charts";
import { PILLAR_LABELS, type LevelKey, type UnitDetail } from "@/src/models/basic";
import { useBasicPlan, useCompleteTask, useLevel, useUnit } from "../hooks/useBasic";
import { CHECKPOINT_PASS, LEVEL_STYLE, PILLAR_STYLE } from "../constants";
import { useQuickCheckGate } from "../hooks/useQuickCheckGate";
import { QuickCheck, type CheckQuestion } from "../components/QuickCheck";

function BackLink() {
  return (
    <Link
      href="/basic"
      className="mb-3 ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[14px] text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    >
      <ArrowLeft size={15} /> Your path
    </Link>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <PageBody>
      <p className="flex items-center gap-2 text-[15px] text-slate-500">
        <Loader2 size={16} className="animate-spin" /> {text}
      </p>
    </PageBody>
  );
}

/** Tugas path yang sedang dikerjakan, dari ?task= atau dicocokkan dari rencana aktif. */
function usePlanTask(taskId: number | null, match: (task: { task_type: string; unit_id: number | null; level_key: string | null }) => boolean) {
  const { data: plan } = useBasicPlan();
  return plan?.tasks.find((task) => (taskId ? task.id === taskId : match(task))) ?? null;
}

function Recap({ unit }: { unit: UnitDetail }) {
  const style = PILLAR_STYLE[unit.pillar];
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {unit.lessons.map((lesson) => (
        <article key={lesson.id} className="flex flex-col rounded-3xl p-5" style={{ backgroundColor: style.tint }}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-[18px] font-normal leading-snug text-slate-900">{lesson.title}</h3>
            {lesson.completed && (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#00c875] text-white" aria-label="Completed">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
          </div>
          <p className="mt-2 text-[14px] text-slate-700">{lesson.content.goal}</p>
          <ul className="mt-3 space-y-1.5 text-[14px] leading-relaxed text-slate-800">
            {lesson.content.explanation.slice(0, 2).map((point) => (
              <li key={point} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: style.accent }} />
                {point}
              </li>
            ))}
          </ul>
          <Link href={`/basic/lessons/${lesson.id}`} className="mt-auto pt-4 text-[14px] font-medium text-slate-900 hover:underline">
            Open lesson
          </Link>
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review unit
// ---------------------------------------------------------------------------

export function UnitReviewContainer({ unitId, taskId }: { unitId: number; taskId: number | null }) {
  const router = useRouter();
  const { data: unit, isLoading, isError } = useUnit(unitId);
  const task = usePlanTask(taskId, (item) => item.task_type === "UNIT_REVIEW" && item.unit_id === unitId);
  const completeTask = useCompleteTask();

  const questions: CheckQuestion[] = useMemo(
    () => (unit?.lessons ?? []).flatMap((lesson) => lesson.content.check.map((q) => ({ ...q, source: lesson.title }))),
    [unit]
  );
  // Review hanya bisa diselesaikan setelah nilai minimalnya tercapai.
  const gate = useQuickCheckGate(questions.length);

  if (isLoading) return <Loading text="Loading review…" />;
  if (isError || !unit) {
    return (
      <PageBody>
        <p className="text-[16px] text-slate-700">This unit doesn’t exist.</p>
      </PageBody>
    );
  }

  const style = PILLAR_STYLE[unit.pillar];
  const done = task?.status === "DONE";

  return (
    <div className="mx-auto max-w-[1320px] px-3 pt-4 sm:px-5 lg:px-8">
      <BackLink />
      <Canvas tint={style.tint} className="px-7 py-10 sm:px-12 sm:py-12">
        <div className="flex flex-wrap gap-2">
          <Chip color={{ bg: "#ffffff", fg: "#323338" }}>
            <RotateCcw size={13} aria-hidden="true" /> Unit review
          </Chip>
          <Chip color={{ bg: "#ffffff", fg: "#323338" }}>
            {unit.level.name} · {PILLAR_LABELS[unit.pillar]}
          </Chip>
        </div>
        <h1 className="mt-5 font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[46px]">
          Review: {unit.title}
        </h1>
        <p className="mt-3 max-w-[56ch] text-[16px] text-slate-700">
          Read the key points again, then answer every question from this unit.
        </p>
      </Canvas>

      <PageBody className="space-y-12 px-2 sm:px-0">
        <section aria-labelledby="recap">
          <h2 id="recap" className="mb-4 font-display text-[24px] font-normal text-slate-900">
            Key points
          </h2>
          <Recap unit={unit} />
        </section>

        <section aria-labelledby="practice" className="mx-auto max-w-[780px]">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="practice" className="font-display text-[24px] font-normal text-slate-900">
                Practice
              </h2>
              <p className="mt-1 text-[14px] text-slate-600">
                Get <span className="tabular font-medium text-slate-900">{gate.needed}</span> of{" "}
                <span className="tabular">{questions.length}</span> right ({gate.percent}%) to finish this review.
              </p>
            </div>
            {gate.score && (
              <span className="tabular text-[14px] text-slate-600">
                {gate.score.correct} of {questions.length} correct
              </span>
            )}
          </div>
          <QuickCheck key={gate.attempt} questions={questions} onScore={gate.onScore} />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-4xl bg-slate-50 p-6">
            <p className="max-w-[46ch] text-[15px] text-slate-700">
              {done
                ? "This review is done."
                : gate.passed
                  ? "You passed. Finish the review to continue your path."
                  : gate.failed
                    ? `You got ${gate.score?.correct} of ${questions.length}. Look at the key points again, then try once more — ${gate.needed} correct finishes this review.`
                    : `Answer every question. ${gate.needed} of ${questions.length} correct finishes this review.`}
            </p>
            {task && !done ? (
              <div className="flex flex-wrap items-center gap-2">
                {gate.failed && (
                  <Button variant="outline" shape="pill" size="lg" onClick={gate.retry}>
                    <RotateCcw size={16} /> Try again
                  </Button>
                )}
                <Button
                  variant="dark"
                  shape="pill"
                  size="lg"
                  disabled={!gate.passed || completeTask.isPending}
                  onClick={async () => {
                    await completeTask.mutateAsync(task.id);
                    router.push("/basic");
                  }}
                >
                  {completeTask.isPending && <Loader2 size={16} className="animate-spin" />}
                  Finish review <ArrowRight size={16} />
                </Button>
              </div>
            ) : (
              <Button variant="dark" shape="pill" size="lg" onClick={() => router.push("/basic")}>
                Back to your path <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </section>
      </PageBody>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Checkpoint level
// ---------------------------------------------------------------------------

export function CheckpointContainer({ levelKey, taskId }: { levelKey: LevelKey; taskId: number | null }) {
  const router = useRouter();
  const { data: level, isLoading, isError } = useLevel(levelKey);
  const task = usePlanTask(taskId, (item) => item.task_type === "LEVEL_CHECKPOINT" && item.level_key === levelKey);
  const completeTask = useCompleteTask();
  const [score, setScore] = useState<{ correct: number; answered: number; total: number } | null>(null);
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [attempt, setAttempt] = useState(0);

  // Satu soal dari setiap lesson di level ini. Indeks digeser per lesson supaya satu
  // checkpoint berisi campuran pilihan ganda, ketik, susun kalimat, dan kelompokkan;
  // "Try again" menggeser lagi sehingga soalnya berganti.
  const pool = useMemo(
    () =>
      (level?.units ?? [])
        .flatMap((unit) => unit.lessons)
        .map((lesson, lessonIndex) => ({
          question: {
            ...lesson.content.check[(attempt + lessonIndex) % lesson.content.check.length],
            source: lesson.title,
          },
          lessonId: lesson.id,
        })),
    [level, attempt]
  );

  if (isLoading) return <Loading text="Loading checkpoint…" />;
  if (isError || !level) {
    return (
      <PageBody>
        <p className="text-[16px] text-slate-700">This level doesn’t exist.</p>
      </PageBody>
    );
  }

  const style = LEVEL_STYLE[level.key];
  const finished = score !== null && score.answered === score.total;
  const ratio = finished ? score.correct / score.total : 0;
  const passed = finished && ratio >= CHECKPOINT_PASS;
  const done = task?.status === "DONE";
  const toRevisit = pool.filter((_, index) => wrong.has(index));

  return (
    <div className="mx-auto max-w-[1320px] px-3 pt-4 sm:px-5 lg:px-8">
      <BackLink />
      <Canvas tint={style.tint} className="px-7 py-10 sm:px-12 sm:py-12">
        <Chip color={{ bg: "#ffffff", fg: "#323338" }}>
          <Flag size={13} aria-hidden="true" /> Level checkpoint
        </Chip>
        <h1 className="mt-5 font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[46px]">
          {level.name} checkpoint
        </h1>
        <p className="mt-3 max-w-[56ch] text-[16px] text-slate-700">
          {pool.length} questions, one from every lesson in this level. Score {Math.round(CHECKPOINT_PASS * 100)}% or more
          to complete the level.
        </p>
      </Canvas>

      <PageBody className="mx-auto max-w-[820px] space-y-10 px-2 sm:px-0">
        <QuickCheck
          key={attempt}
          questions={pool.map((item) => item.question)}
          onScore={(correct, answered, total) => setScore({ correct, answered, total })}
          onAnswer={(index, correct) =>
            setWrong((current) => {
              const next = new Set(current);
              if (correct) next.delete(index);
              else next.add(index);
              return next;
            })
          }
        />

        {finished && (
          <section aria-live="polite" className="grid gap-5 rounded-4xl bg-slate-50 p-6 sm:grid-cols-[260px_1fr] sm:p-8">
            <GaugeChart
              value={Math.round(ratio * 100)}
              max={100}
              display={`${Math.round(ratio * 100)}%`}
              caption={`${score.correct} of ${score.total} correct`}
              label="Checkpoint score"
              segments={[
                { from: 0, to: CHECKPOINT_PASS * 100, color: "#fdab3d", label: "Keep going" },
                { from: CHECKPOINT_PASS * 100, to: 100, color: "#00c875", label: "Pass" },
              ]}
            />
            <div className="flex flex-col justify-center">
              <h2 className="font-display text-[26px] font-normal text-slate-900">
                {passed ? `${level.name} complete!` : "Almost there"}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                {passed
                  ? "You’ve shown you can use this level’s grammar, vocabulary and conversation skills."
                  : "Revisit the lessons below, then try the checkpoint again with fresh questions."}
              </p>
              {toRevisit.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {toRevisit.map((item) => (
                    <li key={item.lessonId}>
                      <Link
                        href={`/basic/lessons/${item.lessonId}`}
                        className="inline-flex h-8 items-center rounded-full bg-white px-3 text-[13px] text-slate-800 hover:bg-slate-100"
                      >
                        {item.question.source}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                {passed && task && !done && (
                  <Button
                    variant="dark"
                    shape="pill"
                    size="lg"
                    disabled={completeTask.isPending}
                    onClick={async () => {
                      await completeTask.mutateAsync(task.id);
                      router.push("/basic");
                    }}
                  >
                    {completeTask.isPending && <Loader2 size={16} className="animate-spin" />}
                    Complete level <ArrowRight size={16} />
                  </Button>
                )}
                {!passed && (
                  <Button
                    variant="dark"
                    shape="pill"
                    size="lg"
                    onClick={() => {
                      setAttempt((value) => value + 1);
                      setScore(null);
                      setWrong(new Set());
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <RotateCcw size={16} /> Try again
                  </Button>
                )}
                {(done || !task || !passed) && (
                  <Button variant="outline" shape="pill" size="lg" onClick={() => router.push("/basic")}>
                    Back to your path
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}
      </PageBody>
    </div>
  );
}
