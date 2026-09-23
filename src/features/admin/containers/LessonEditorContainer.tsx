"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import { LEVEL_LABELS, type CheckQuestion, type LessonContent } from "@/src/models/basic";
import { CHECK_TYPE_LABELS, type AdminCurriculum, type AdminLesson, type CheckType } from "@/src/models/admin-content";
import { QuickCheck } from "@/src/features/basic/components/QuickCheck";
import { useAdminCurriculum, useAdminLesson, useRemoveLesson, useSaveLesson } from "../hooks/useContentAdmin";
import { Card, ConfirmDialog, Drawer, ErrorNotice, Field, readErrorMessage } from "../components/AdminUI";
import {
  CHECK_TYPES,
  CHECK_TYPE_HINT,
  CheckQuestionEditor,
  blankQuestion,
  cleanQuestion,
  questionProblems,
} from "../components/CheckQuestionEditor";
import { PillarBadge } from "./BasicCurriculumAdminContainer";
import { fieldClass, textareaClass } from "../components/fields";

const MAX_QUESTIONS = 10;

type Draft = {
  unit_id: number;
  title: string;
  summary: string;
  estimated_minutes: number;
  goal: string;
  explanation: string[];
  examples: Array<{ en: string; note: string }>;
  tip: string;
  check: Array<{ key: string; question: CheckQuestion }>;
};

let keySeed = 0;
const nextKey = () => `q${++keySeed}`;

const toDraft = (lesson: AdminLesson | null, unitId: number): Draft =>
  lesson
    ? {
        unit_id: lesson.unit_id,
        title: lesson.title,
        summary: lesson.summary,
        estimated_minutes: lesson.estimated_minutes,
        goal: lesson.content.goal,
        explanation: lesson.content.explanation.length ? lesson.content.explanation : [""],
        examples: lesson.content.examples.map((example) => ({ en: example.en, note: example.note ?? "" })),
        tip: lesson.content.tip ?? "",
        // Soal lama tanpa "type" adalah pilihan ganda.
        check: lesson.content.check.map((question) => ({
          key: nextKey(),
          question: { ...question, type: (question as { type?: CheckType }).type ?? "choice" } as CheckQuestion,
        })),
      }
    : {
        unit_id: unitId,
        title: "",
        summary: "",
        estimated_minutes: 20,
        goal: "",
        explanation: [""],
        examples: [{ en: "", note: "" }],
        tip: "",
        check: [{ key: nextKey(), question: blankQuestion("choice") }],
      };

/** Isi yang dikirim ke backend: spasi dirapikan, paragraf/contoh kosong dibuang. */
const toPayload = (draft: Draft) => {
  const content: LessonContent = {
    goal: draft.goal.trim(),
    explanation: draft.explanation.map((paragraph) => paragraph.trim()).filter(Boolean),
    examples: draft.examples
      .filter((example) => example.en.trim() || example.note.trim())
      .map((example) => ({ en: example.en.trim(), ...(example.note.trim() ? { note: example.note.trim() } : {}) })),
    tip: draft.tip.trim() || null,
    check: draft.check.map((entry) => cleanQuestion(entry.question)),
  };
  return {
    unit_id: draft.unit_id,
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    estimated_minutes: draft.estimated_minutes,
    content,
  };
};

const lessonProblems = (draft: Draft) => {
  const problems: string[] = [];
  if (draft.title.trim().length < 2) problems.push("Add a lesson title.");
  if (!draft.unit_id) problems.push("Choose a unit.");
  if (draft.summary.trim().length < 5) problems.push("Write a one-line summary.");
  if (!(draft.estimated_minutes >= 5 && draft.estimated_minutes <= 120)) problems.push("Study time must be 5–120 minutes.");
  if (!draft.goal.trim()) problems.push("Write the lesson goal.");
  if (!draft.explanation.some((paragraph) => paragraph.trim())) problems.push("Add at least one explanation paragraph.");
  if (draft.examples.some((example) => !example.en.trim() && example.note.trim())) problems.push("Every example needs an English sentence.");
  if (draft.check.length === 0) problems.push("Add at least one quick check question.");
  return problems;
};

// ---------------------------------------------------------------------------
// Container: memuat data lalu menyerahkan ke editor
// ---------------------------------------------------------------------------

export function LessonEditorContainer({ lessonId, unitId }: { lessonId: number | null; unitId?: number }) {
  const lesson = useAdminLesson(lessonId);
  const curriculum = useAdminCurriculum();

  if ((lessonId !== null && lesson.isLoading) || curriculum.isLoading) {
    return (
      <PageBody>
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Loading lesson…
        </p>
      </PageBody>
    );
  }

  if (lesson.isError || curriculum.isError || !curriculum.data) {
    return (
      <PageBody>
        <ErrorNotice>Couldn&apos;t load this lesson. It may have been deleted.</ErrorNotice>
        <Link href="/admin/basic" className="mt-4 inline-flex items-center gap-1.5 text-[14px] text-primary-500 hover:underline">
          <ArrowLeft size={14} /> Back to curriculum
        </Link>
      </PageBody>
    );
  }

  const fallbackUnit = unitId ?? curriculum.data.levels[0]?.units[0]?.id ?? 0;
  return (
    <LessonEditor
      key={lesson.data ? `${lesson.data.id}-${lesson.data.order}` : "new"}
      lesson={lesson.data ?? null}
      curriculum={curriculum.data}
      initialUnitId={fallbackUnit}
    />
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

function SectionNav({ problems }: { problems: { basics: number; content: number; check: number } }) {
  const items = [
    { href: "#basics", label: "Basics", issues: problems.basics },
    { href: "#content", label: "Lesson content", issues: problems.content },
    { href: "#quick-check", label: "Quick check", issues: problems.check },
  ];
  return (
    <nav aria-label="Lesson sections" className="space-y-0.5">
      {items.map((item) => (
        <a key={item.href} href={item.href} className="flex items-center justify-between rounded-md px-2 py-1.5 text-[14px] text-slate-700 hover:bg-slate-100">
          {item.label}
          {item.issues > 0 ? (
            <span className="tabular rounded-full bg-[#fdeef1] px-1.5 text-[12px] font-medium text-[#b12a41]">{item.issues}</span>
          ) : (
            <CheckCircle2 size={15} className="text-[#00a360]" aria-label="Complete" />
          )}
        </a>
      ))}
    </nav>
  );
}

function LessonEditor({
  lesson,
  curriculum,
  initialUnitId,
}: {
  lesson: AdminLesson | null;
  curriculum: AdminCurriculum;
  initialUnitId: number;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(lesson, initialUnitId));
  const [baseline, setBaseline] = useState(() => JSON.stringify(toPayload(toDraft(lesson, initialUnitId))));
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const saveLesson = useSaveLesson();
  const removeLesson = useRemoveLesson();
  const topRef = useRef<HTMLDivElement>(null);

  const patch = (changes: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...changes }));
  const payload = useMemo(() => toPayload(draft), [draft]);
  const dirty = JSON.stringify(payload) !== baseline;

  const units = curriculum.levels.flatMap((level) => level.units.map((unit) => ({ ...unit, level })));
  const unit = units.find((item) => item.id === draft.unit_id);

  const basicsProblems = lessonProblems(draft).filter((problem) => !/goal|explanation|example|quick check/i.test(problem));
  const contentProblems = lessonProblems(draft).filter((problem) => /goal|explanation|example/i.test(problem));
  const perQuestion = draft.check.map((entry) => questionProblems(entry.question));
  const checkIssues = perQuestion.filter((problems) => problems.length > 0).length + (draft.check.length === 0 ? 1 : 0);
  const totalIssues = basicsProblems.length + contentProblems.length + checkIssues;

  // Peringatan bila meninggalkan halaman dengan perubahan yang belum disimpan.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async () => {
    setShowErrors(true);
    if (totalIssues > 0) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    try {
      const saved = await saveLesson.mutateAsync({ id: lesson?.id ?? null, input: payload });
      setBaseline(JSON.stringify(payload));
      setSavedAt(new Date());
      if (!lesson) router.replace(`/admin/basic/lessons/${saved.id}`);
    } catch {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const setQuestion = (index: number, question: CheckQuestion) =>
    patch({ check: draft.check.map((entry, i) => (i === index ? { ...entry, question } : entry)) });

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const next = [...draft.check];
    const target = index + direction;
    [next[index], next[target]] = [next[target], next[index]];
    patch({ check: next });
  };

  const typeCounts = CHECK_TYPES.map((type) => ({ type, count: draft.check.filter((entry) => entry.question.type === type).length }));

  return (
    <>
      <div ref={topRef} className="scroll-mt-24 px-6 pt-4 lg:px-8">
        <Link href="/admin/basic" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900">
          <ArrowLeft size={14} /> Basic English curriculum
        </Link>
      </div>
      <PageHeader
        title={lesson ? draft.title || "Untitled lesson" : "New lesson"}
        description={unit ? `${LEVEL_LABELS[unit.level.key]} · ${unit.title}` : "Choose a unit for this lesson."}
        actions={
          <>
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye size={16} /> Preview quiz
            </Button>
            <Button onClick={save} disabled={saveLesson.isPending || (!dirty && !!lesson)}>
              {saveLesson.isPending ? "Saving…" : lesson ? "Save changes" : "Create lesson"}
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-6">
            {saveLesson.isError && <ErrorNotice>{readErrorMessage(saveLesson.error, "Couldn't save the lesson.")}</ErrorNotice>}
            {showErrors && totalIssues > 0 && (
              <ErrorNotice>
                {totalIssues === 1 ? "One thing needs fixing" : `${totalIssues} things need fixing`} before saving. They are marked in red below.
              </ErrorNotice>
            )}

            {/* Dasar */}
            <div id="basics" className="scroll-mt-24">
              <Card title="Basics" description="What students see in the learning path.">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_140px]">
                  <Field label="Lesson title" htmlFor="lesson-title" error={showErrors && draft.title.trim().length < 2 ? "Add a lesson title." : null}>
                    <input id="lesson-title" value={draft.title} onChange={(event) => patch({ title: event.target.value })} className={fieldClass} />
                  </Field>
                  <Field label="Study time" htmlFor="lesson-minutes" hint="Minutes" error={showErrors && !(draft.estimated_minutes >= 5 && draft.estimated_minutes <= 120) ? "5–120" : null}>
                    <input
                      id="lesson-minutes"
                      type="number"
                      min={5}
                      max={120}
                      value={draft.estimated_minutes}
                      onChange={(event) => patch({ estimated_minutes: Number(event.target.value) })}
                      className={fieldClass}
                    />
                  </Field>
                </div>
                <Field label="Unit" htmlFor="lesson-unit" className="mt-4">
                  <select id="lesson-unit" value={draft.unit_id} onChange={(event) => patch({ unit_id: Number(event.target.value) })} className={fieldClass}>
                    {curriculum.levels.map((level) => (
                      <optgroup key={level.key} label={level.name}>
                        {level.units.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Summary"
                  htmlFor="lesson-summary"
                  className="mt-4"
                  hint="One line under the title in the learning path."
                  error={showErrors && draft.summary.trim().length < 5 ? "Write a one-line summary." : null}
                >
                  <input id="lesson-summary" value={draft.summary} onChange={(event) => patch({ summary: event.target.value })} className={fieldClass} />
                </Field>
              </Card>
            </div>

            {/* Isi */}
            <div id="content" className="scroll-mt-24">
              <Card title="Lesson content" description="Goal, explanation and examples, in the order students read them.">
                <Field label="Goal" htmlFor="lesson-goal" hint="Starts with a verb, e.g. Tell nouns and pronouns apart." error={showErrors && !draft.goal.trim() ? "Write the lesson goal." : null}>
                  <input id="lesson-goal" value={draft.goal} onChange={(event) => patch({ goal: event.target.value })} className={fieldClass} />
                </Field>

                <fieldset className="mt-5">
                  <legend className="mb-1.5 text-[13px] font-medium text-slate-700">Explanation</legend>
                  <div className="space-y-2">
                    {draft.explanation.map((paragraph, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="tabular mt-2.5 w-5 shrink-0 text-right text-[12px] text-slate-400">{index + 1}</span>
                        <textarea
                          aria-label={`Explanation paragraph ${index + 1}`}
                          rows={3}
                          value={paragraph}
                          onChange={(event) => patch({ explanation: draft.explanation.map((item, i) => (i === index ? event.target.value : item)) })}
                          className={textareaClass}
                        />
                        <button
                          type="button"
                          aria-label={`Remove paragraph ${index + 1}`}
                          disabled={draft.explanation.length <= 1}
                          onClick={() => patch({ explanation: draft.explanation.filter((_item, i) => i !== index) })}
                          className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-[#fdeef1] hover:text-[#b12a41] disabled:opacity-30"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {showErrors && !draft.explanation.some((paragraph) => paragraph.trim()) && (
                    <p className="mt-1 text-[12px] text-[#b12a41]">Add at least one explanation paragraph.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => patch({ explanation: [...draft.explanation, ""] })}
                    disabled={draft.explanation.length >= 12}
                    className="mt-2 inline-flex h-8 items-center gap-1 rounded-md px-2 text-[13px] font-medium text-primary-500 hover:bg-primary-50"
                  >
                    <Plus size={14} /> Add paragraph
                  </button>
                </fieldset>

                <fieldset className="mt-5">
                  <legend className="mb-1.5 text-[13px] font-medium text-slate-700">Examples</legend>
                  {draft.examples.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_40px] gap-2 bg-slate-50 px-3 py-2 text-[12px] font-medium uppercase tracking-[0.04em] text-slate-500 sm:grid">
                        <span>English sentence</span>
                        <span>Note (optional)</span>
                        <span />
                      </div>
                      <div className="divide-y divide-slate-100">
                        {draft.examples.map((example, index) => (
                          <div key={index} className="grid gap-2 p-2 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_40px]">
                            <input
                              aria-label={`Example ${index + 1} sentence`}
                              value={example.en}
                              onChange={(event) => patch({ examples: draft.examples.map((item, i) => (i === index ? { ...item, en: event.target.value } : item)) })}
                              className={fieldClass}
                              placeholder="The cat is sleeping."
                            />
                            <input
                              aria-label={`Example ${index + 1} note`}
                              value={example.note}
                              onChange={(event) => patch({ examples: draft.examples.map((item, i) => (i === index ? { ...item, note: event.target.value } : item)) })}
                              className={fieldClass}
                              placeholder="cat = noun"
                            />
                            <button
                              type="button"
                              aria-label={`Remove example ${index + 1}`}
                              onClick={() => patch({ examples: draft.examples.filter((_item, i) => i !== index) })}
                              className="flex size-10 items-center justify-center rounded-md text-slate-400 hover:bg-[#fdeef1] hover:text-[#b12a41]"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => patch({ examples: [...draft.examples, { en: "", note: "" }] })}
                    disabled={draft.examples.length >= 16}
                    className="mt-2 inline-flex h-8 items-center gap-1 rounded-md px-2 text-[13px] font-medium text-primary-500 hover:bg-primary-50"
                  >
                    <Plus size={14} /> Add example
                  </button>
                </fieldset>

                <Field label="Tip (optional)" htmlFor="lesson-tip" className="mt-5" hint="A memory trick or common mistake, shown in a highlighted box.">
                  <textarea id="lesson-tip" rows={2} value={draft.tip} onChange={(event) => patch({ tip: event.target.value })} className={textareaClass} />
                </Field>
              </Card>
            </div>

            {/* Kuis */}
            <div id="quick-check" className="scroll-mt-24">
              <Card
                title="Quick check"
                description={`${draft.check.length} of ${MAX_QUESTIONS} questions. Mix the types so students both recognise and produce the language.`}
                bodyClassName="space-y-4 bg-slate-50/60"
              >
                {draft.check.length === 0 && (
                  <p className={cn("text-[14px]", showErrors ? "text-[#b12a41]" : "text-slate-500")}>Add at least one question.</p>
                )}
                {draft.check.map((entry, index) => (
                  <CheckQuestionEditor
                    key={entry.key}
                    id={entry.key}
                    index={index}
                    total={draft.check.length}
                    value={entry.question}
                    problems={showErrors ? perQuestion[index] : []}
                    onChange={(question) => setQuestion(index, question)}
                    onMove={(direction) => moveQuestion(index, direction)}
                    onRemove={() => patch({ check: draft.check.filter((_item, i) => i !== index) })}
                  />
                ))}

                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
                  <p className="mb-3 text-[13px] font-medium text-slate-700">Add a question</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CHECK_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        disabled={draft.check.length >= MAX_QUESTIONS}
                        onClick={() => patch({ check: [...draft.check, { key: nextKey(), question: blankQuestion(type) }] })}
                        className="flex items-start gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-left transition-colors hover:border-slate-900 disabled:opacity-40"
                      >
                        <Plus size={15} className="mt-0.5 shrink-0 text-primary-500" />
                        <span>
                          <span className="block text-[14px] font-medium text-slate-900">{CHECK_TYPE_LABELS[type]}</span>
                          <span className="block text-[12px] text-slate-500">{CHECK_TYPE_HINT[type]}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Ringkasan */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-slate-500">Status</p>
              <p className="mt-1.5 flex items-center gap-2 text-[14px] font-medium text-slate-900">
                <span className={cn("size-2 rounded-full", dirty ? "bg-[#fdab3d]" : "bg-[#00c875]")} aria-hidden="true" />
                {dirty ? (lesson ? "Unsaved changes" : "Not created yet") : savedAt ? `Saved at ${savedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "All changes saved"}
              </p>
              {unit && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-slate-600">
                  <PillarBadge pillar={unit.pillar} />
                  <span>{unit.level.name}</span>
                </div>
              )}
              {lesson && (
                <p className="mt-3 text-[13px] text-slate-600">
                  Finished by <span className="tabular font-medium text-slate-900">{lesson.completions}</span> {lesson.completions === 1 ? "student" : "students"}
                </p>
              )}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <SectionNav
                  problems={{
                    basics: showErrors ? basicsProblems.length : 0,
                    content: showErrors ? contentProblems.length : 0,
                    check: showErrors ? checkIssues : 0,
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-slate-500">Question mix</p>
              <ul className="mt-2 space-y-1.5">
                {typeCounts.map(({ type, count }) => (
                  <li key={type} className="flex items-center justify-between text-[14px]">
                    <span className={count ? "text-slate-800" : "text-slate-400"}>{CHECK_TYPE_LABELS[type]}</span>
                    <span className="tabular font-medium text-slate-900">{count}</span>
                  </li>
                ))}
              </ul>
            </div>

            {lesson && (
              <Button variant="ghost" className="w-full justify-start text-[#b12a41] hover:bg-[#fdeef1]" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={16} /> Delete lesson
              </Button>
            )}
          </aside>
        </div>
      </PageBody>

      <Drawer
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Quiz preview"
        subtitle="What students see at the end of this lesson. Answers here are not saved."
        width={640}
      >
        {payload.content.check.length === 0 ? (
          <p className="text-[14px] text-slate-500">Add a question to preview the quiz.</p>
        ) : (
          <QuickCheck key={JSON.stringify(payload.content.check)} questions={payload.content.check} />
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this lesson?"
        message={
          <>
            <strong className="text-slate-900">{lesson?.title}</strong> will be deleted
            {lesson && lesson.completions > 0 ? `, including the progress of ${lesson.completions} students who finished it` : ""}. It is also removed from
            students’ learning paths.
          </>
        }
        pending={removeLesson.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (!lesson) return;
          try {
            await removeLesson.mutateAsync(lesson.id);
            setBaseline(JSON.stringify(payload));
            router.push("/admin/basic");
          } catch {
            setConfirmDelete(false);
          }
        }}
      />
    </>
  );
}
