"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Clock3, Lightbulb, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody } from "@/src/_global/components/Shell/AppShell";
import { Canvas, Chip } from "@/src/_global/components/Showcase/Showcase";
import { STATUS_COLOR } from "@/src/_global/design/tokens";
import { PILLAR_LABELS, taskHref } from "@/src/models/basic";
import { useBasicPlan, useCompleteLesson, useLesson } from "../hooks/useBasic";
import { PILLAR_STYLE } from "../constants";
import { QuickCheck } from "../components/QuickCheck";

export function LessonContainer({ lessonId }: { lessonId: number }) {
  const router = useRouter();
  const { data: lesson, isLoading, isError } = useLesson(lessonId);
  const { data: plan } = useBasicPlan();
  const complete = useCompleteLesson();
  const [score, setScore] = useState<{ correct: number; answered: number; total: number } | null>(null);

  if (isLoading) {
    return (
      <PageBody>
        <p className="flex items-center gap-2 text-[15px] text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Loading lesson…
        </p>
      </PageBody>
    );
  }
  if (isError || !lesson) {
    return (
      <PageBody>
        <p className="mb-4 text-[16px] text-slate-700">This lesson doesn’t exist.</p>
        <Link href="/basic" className="text-[15px] font-medium text-primary-500 hover:underline">
          Back to your path
        </Link>
      </PageBody>
    );
  }

  const style = PILLAR_STYLE[lesson.unit.pillar];
  const Icon = style.icon;
  const { content } = lesson;

  // Setelah selesai, arahkan ke langkah berikutnya di path bila ada, bukan sekadar lesson berikutnya.
  const nextPlanTask = plan?.tasks.find((task) => task.status === "PENDING" && task.lesson_id !== lesson.id) ?? null;
  const planTask = plan?.tasks.find((task) => task.lesson_id === lesson.id);
  const aheadOfPath =
    plan?.mode === "GUIDED" && planTask && plan.next_task && planTask.order > plan.next_task.order && !lesson.completed;

  const handleComplete = async () => {
    await complete.mutateAsync(lesson.id);
  };

  const nextHref = nextPlanTask
    ? taskHref(nextPlanTask)
    : !plan && lesson.next_lesson_id
      ? `/basic/lessons/${lesson.next_lesson_id}`
      : null;
  const nextLabel = nextPlanTask && nextPlanTask.task_type !== "LESSON" ? `Next: ${nextPlanTask.title}` : "Next lesson";

  return (
    <div className="mx-auto max-w-[1320px] px-3 pt-4 sm:px-5 lg:px-8">
      <Link
        href="/basic"
        className="mb-3 ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[14px] text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <ArrowLeft size={15} /> Your path
      </Link>

      <Canvas tint={style.tint} className="px-7 py-10 sm:px-12 sm:py-14">
        <div className="flex flex-wrap items-center gap-2">
          <Chip color={{ bg: "#ffffff", fg: "#323338" }}>{lesson.level.name}</Chip>
          <Chip color={{ bg: "#ffffff", fg: "#323338" }}>
            <Icon size={13} style={{ color: style.accent }} aria-hidden="true" />
            {PILLAR_LABELS[lesson.unit.pillar]} · {lesson.unit.title}
          </Chip>
          {lesson.completed && (
            <Chip color={STATUS_COLOR.done}>
              <Check size={12} strokeWidth={3} /> Completed
            </Chip>
          )}
        </div>
        <h1 className="mt-5 max-w-[24ch] font-display text-[36px] font-normal leading-[1.08] tracking-[-0.02em] text-slate-900 sm:text-[50px]">
          {lesson.title}
        </h1>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px] text-slate-700">
          <span className="flex items-center gap-2">
            <Target size={17} style={{ color: style.accent }} aria-hidden="true" />
            {content.goal}
          </span>
          <span className="tabular flex items-center gap-2">
            <Clock3 size={17} style={{ color: style.accent }} aria-hidden="true" />
            {lesson.estimated_minutes} min
          </span>
        </div>
      </Canvas>

      {aheadOfPath && (
        <p className="mx-auto mt-6 max-w-[780px] rounded-2xl bg-[#fff3e0] px-4 py-3 text-[14px] text-slate-800">
          This lesson is ahead of your path. You can study it now, but your next step is{" "}
          <Link href="/basic" className="font-medium underline">
            {plan?.next_task?.title}
          </Link>
          .
        </p>
      )}

      <article className="mx-auto max-w-[780px] px-2 pt-12 sm:px-0">
        <section aria-labelledby="explain">
          <h2 id="explain" className="font-display text-[26px] font-normal text-slate-900">
            How it works
          </h2>
          <ol className="mt-5 space-y-4">
            {content.explanation.map((point, index) => (
              <li key={index} className="flex gap-4 text-[17px] leading-[1.7] text-slate-800">
                <span
                  className="tabular mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                  style={{ backgroundColor: style.accent }}
                >
                  {index + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="examples" className="mt-12">
          <h2 id="examples" className="font-display text-[26px] font-normal text-slate-900">
            Examples
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {content.examples.map((example) => (
              <li key={example.en} className="rounded-3xl p-5" style={{ backgroundColor: style.tint }}>
                <p className="font-display text-[18px] leading-snug text-slate-900">{example.en}</p>
                {example.note && <p className="mt-2 text-[13px] text-slate-600">{example.note}</p>}
              </li>
            ))}
          </ul>
        </section>

        {content.tip && (
          <div className="mt-10 flex gap-4 rounded-3xl bg-slate-950 p-6 text-white">
            <Lightbulb size={22} className="mt-0.5 shrink-0 text-[#b9e3ff]" aria-hidden="true" />
            <div>
              <p className="font-medium">Tip</p>
              <p className="mt-1 text-[15px] leading-relaxed text-[#dfe2ee]">{content.tip}</p>
            </div>
          </div>
        )}

        <section aria-labelledby="check" className="mt-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2 id="check" className="font-display text-[26px] font-normal text-slate-900">
              Quick check
            </h2>
            {score && (
              <span className="tabular text-[14px] text-slate-600">
                {score.correct} of {score.total} correct
              </span>
            )}
          </div>
          <QuickCheck questions={content.check} onScore={(correct, answered, total) => setScore({ correct, answered, total })} />
        </section>

        <div className="mt-12 rounded-4xl bg-slate-50 p-6 sm:p-8">
          {lesson.completed ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="flex items-center gap-2 text-[16px] text-slate-800">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#00c875] text-white">
                  <Check size={16} strokeWidth={3} />
                </span>
                Lesson complete.
              </p>
              {nextHref ? (
                <Button variant="dark" shape="pill" size="lg" onClick={() => router.push(nextHref)}>
                  {nextLabel} <ArrowRight size={16} />
                </Button>
              ) : (
                <Button variant="dark" shape="pill" size="lg" onClick={() => router.push("/basic")}>
                  Back to your path <ArrowRight size={16} />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-[40ch] text-[15px] text-slate-700">
                {score && score.answered === score.total
                  ? "Nice work. Mark the lesson as complete to move along your path."
                  : "Try the quick check, then mark the lesson as complete."}
              </p>
              <Button variant="dark" shape="pill" size="lg" onClick={handleComplete} disabled={complete.isPending}>
                {complete.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                Mark as complete
              </Button>
            </div>
          )}
          {complete.isError && (
            <p role="alert" className="mt-3 text-[14px] text-[#b12a41]">
              Couldn’t save your progress. Check your connection and try again.
            </p>
          )}
        </div>

        <nav aria-label="Lesson navigation" className="mt-8 flex justify-between gap-3 border-t border-slate-200 pt-6">
          {lesson.previous_lesson_id ? (
            <Link href={`/basic/lessons/${lesson.previous_lesson_id}`} className="inline-flex items-center gap-1.5 text-[15px] text-slate-700 hover:underline">
              <ChevronLeft size={16} /> Previous lesson
            </Link>
          ) : (
            <span />
          )}
          {lesson.next_lesson_id && (
            <Link href={`/basic/lessons/${lesson.next_lesson_id}`} className="inline-flex items-center gap-1.5 text-[15px] text-slate-700 hover:underline">
              Next in the curriculum <ArrowRight size={16} />
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
