"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpenText,
  CheckCircle2,
  Layers,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import { LEVEL_KEYS, LEVEL_LABELS, PILLAR_LABELS, type LevelKey, type Pillar } from "@/src/models/basic";
import { CHECK_TYPE_LABELS, type AdminLessonSummary, type AdminUnitSummary, type CheckType } from "@/src/models/admin-content";
import { LEVEL_STYLE, PILLAR_STYLE } from "@/src/features/basic/constants";
import {
  useAdminCurriculum,
  useMoveLesson,
  useMoveUnit,
  useRemoveLesson,
  useRemoveUnit,
  useSaveUnit,
  useUpdateLevel,
} from "../hooks/useContentAdmin";
import {
  Badge,
  ConfirmDialog,
  Drawer,
  EmptyState,
  ErrorNotice,
  Field,
  IconAction,
  StatCard,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
  readErrorMessage,
} from "../components/AdminUI";
import { fieldClass, textareaClass } from "../components/fields";
import { cn } from "@/src/libs/utils";

const PILLARS = Object.keys(PILLAR_LABELS) as Pillar[];

const TYPE_SHORT: Record<CheckType, string> = { choice: "Choice", type: "Type", order: "Build", sort: "Sort" };

export function PillarBadge({ pillar }: { pillar: Pillar }) {
  const style = PILLAR_STYLE[pillar];
  const Icon = style.icon;
  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium"
      style={{ backgroundColor: style.tint, color: style.accent }}
    >
      <Icon size={12} aria-hidden="true" />
      {PILLAR_LABELS[pillar]}
    </span>
  );
}

/** Jumlah soal cek cepat per tipe, dengan peringatan bila lesson belum punya soal. */
function CheckSummary({ lesson }: { lesson: AdminLessonSummary }) {
  if (lesson.question_count === 0) {
    return (
      <Badge tone="red">
        <AlertTriangle size={12} /> No questions
      </Badge>
    );
  }
  const types = (Object.keys(lesson.question_types) as CheckType[]).filter((type) => lesson.question_types[type] > 0);
  return (
    <span className="flex flex-wrap items-center gap-1" title={types.map((type) => `${lesson.question_types[type]} ${CHECK_TYPE_LABELS[type]}`).join(", ")}>
      <span className="tabular mr-1 font-medium text-slate-900">{lesson.question_count}</span>
      {types.map((type) => (
        <span key={type} className="tabular rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
          {TYPE_SHORT[type]} {lesson.question_types[type]}
        </span>
      ))}
    </span>
  );
}

type UnitForm = { pillar: Pillar; title: string; description: string };

export function BasicCurriculumAdminContainer() {
  const router = useRouter();
  const [levelKey, setLevelKey] = useState<LevelKey>("BEGINNER");
  const [unitDraft, setUnitDraft] = useState<{ id: number | null; form: UnitForm } | null>(null);
  const [levelDraft, setLevelDraft] = useState<{ name: string; description: string } | null>(null);
  const [confirm, setConfirm] = useState<
    { kind: "unit"; unit: AdminUnitSummary } | { kind: "lesson"; lesson: AdminLessonSummary } | null
  >(null);

  const { data, isLoading, isError } = useAdminCurriculum();
  const saveUnit = useSaveUnit();
  const updateLevel = useUpdateLevel();
  const removeUnit = useRemoveUnit();
  const removeLesson = useRemoveLesson();
  const moveUnit = useMoveUnit();
  const moveLesson = useMoveLesson();

  const level = data?.levels.find((item) => item.key === levelKey);
  const levelStats = useMemo(
    () =>
      Object.fromEntries(
        (data?.levels ?? []).map((item) => [
          item.key,
          { units: item.units.length, lessons: item.units.reduce((sum, unit) => sum + unit.lessons.length, 0) },
        ])
      ) as Record<LevelKey, { units: number; lessons: number }>,
    [data]
  );

  const lessonsWithoutQuestions = useMemo(
    () => (data?.levels ?? []).flatMap((item) => item.units.flatMap((unit) => unit.lessons)).filter((lesson) => lesson.question_count === 0).length,
    [data]
  );

  const moving = moveUnit.isPending || moveLesson.isPending;

  const submitUnit = async () => {
    if (!unitDraft) return;
    try {
      await saveUnit.mutateAsync({ id: unitDraft.id, input: { level_key: levelKey, ...unitDraft.form } });
      setUnitDraft(null);
    } catch {
      // Pesan dirender dari state mutation.
    }
  };

  const submitLevel = async () => {
    if (!levelDraft) return;
    try {
      await updateLevel.mutateAsync({ key: levelKey, input: levelDraft });
      setLevelDraft(null);
    } catch {
      // Pesan dirender dari state mutation.
    }
  };

  const unitValid = unitDraft ? unitDraft.form.title.trim().length >= 2 && unitDraft.form.description.trim().length >= 5 : false;

  return (
    <>
      <PageHeader
        title="Basic English curriculum"
        description="Levels, units and lessons for English Basic to Hero, including each lesson’s quick check questions."
        actions={
          <Button onClick={() => setUnitDraft({ id: null, form: { pillar: "GRAMMAR", title: "", description: "" } })}>
            <Plus size={16} /> New unit
          </Button>
        }
      />
      <PageBody>
        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Loading curriculum…
          </p>
        )}
        {isError && <ErrorNotice>Couldn&apos;t load the curriculum. Reload the page to try again.</ErrorNotice>}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Units" value={data.stats.units} hint={`Across ${data.stats.levels} levels`} icon={Layers} />
              <StatCard label="Lessons" value={data.stats.lessons} icon={BookOpenText} accent="#784bd1" />
              <StatCard
                label="Quick check questions"
                value={data.stats.questions}
                hint={lessonsWithoutQuestions > 0 ? `${lessonsWithoutQuestions} lessons have none` : "Every lesson has questions"}
                icon={ListChecks}
                accent="#00a360"
              />
              <StatCard label="Learners" value={data.stats.learners} hint="Finished at least one lesson" icon={Users} accent="#b86e00" />
            </div>

            {/* Tab level */}
            <div role="tablist" aria-label="Levels" className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200">
              {LEVEL_KEYS.map((key) => {
                const active = key === levelKey;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setLevelKey(key)}
                    className={cn(
                      "-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-[14px] transition-colors",
                      active ? "border-slate-900 font-medium text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: LEVEL_STYLE[key].accent }} aria-hidden="true" />
                    {LEVEL_LABELS[key]}
                    <span className="tabular text-[12px] text-slate-400">{levelStats[key]?.lessons ?? 0}</span>
                  </button>
                );
              })}
            </div>

            {level && (
              <div role="tabpanel" aria-label={level.name} className="pt-6">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-xl p-5" style={{ backgroundColor: LEVEL_STYLE[level.key].tint }}>
                  <div className="min-w-0">
                    <h2 className="text-[18px] font-semibold text-slate-900">{level.name}</h2>
                    <p className="mt-1 max-w-[70ch] text-[14px] text-slate-700">{level.description}</p>
                    <p className="tabular mt-2 text-[13px] text-slate-600">
                      {levelStats[level.key].units} units · {levelStats[level.key].lessons} lessons
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setLevelDraft({ name: level.name, description: level.description })}>
                    <Pencil size={14} /> Edit level
                  </Button>
                </div>

                {level.units.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300">
                    <EmptyState
                      icon={Layers}
                      title="No units in this level"
                      text="A unit groups a few lessons on one topic, such as Parts of speech."
                      action={
                        <Button onClick={() => setUnitDraft({ id: null, form: { pillar: "GRAMMAR", title: "", description: "" } })}>
                          <Plus size={16} /> New unit
                        </Button>
                      }
                    />
                  </div>
                )}

                <ol className="space-y-5">
                  {level.units.map((unit, unitIndex) => (
                    <li key={unit.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <header className="flex flex-wrap items-start gap-3 border-b border-slate-200 px-5 py-4">
                        <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[13px] font-semibold text-white">
                          {unitIndex + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[16px] font-semibold text-slate-900">{unit.title}</h3>
                            <PillarBadge pillar={unit.pillar} />
                          </div>
                          <p className="mt-1 text-[13px] text-slate-500">{unit.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconAction label={`Move ${unit.title} up`} disabled={unitIndex === 0 || moving} onClick={() => moveUnit.mutate({ id: unit.id, direction: "up" })}>
                            <ArrowUp size={15} />
                          </IconAction>
                          <IconAction
                            label={`Move ${unit.title} down`}
                            disabled={unitIndex === level.units.length - 1 || moving}
                            onClick={() => moveUnit.mutate({ id: unit.id, direction: "down" })}
                          >
                            <ArrowDown size={15} />
                          </IconAction>
                          <IconAction
                            label={`Edit ${unit.title}`}
                            onClick={() => setUnitDraft({ id: unit.id, form: { pillar: unit.pillar, title: unit.title, description: unit.description } })}
                          >
                            <Pencil size={15} />
                          </IconAction>
                          <IconAction label={`Delete ${unit.title}`} tone="danger" onClick={() => setConfirm({ kind: "unit", unit })}>
                            <Trash2 size={15} />
                          </IconAction>
                          <Link href={`/admin/basic/lessons/new?unit=${unit.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "ml-2")}>
                            <Plus size={14} /> Lesson
                          </Link>
                        </div>
                      </header>

                      {unit.lessons.length === 0 ? (
                        <p className="px-5 py-6 text-[14px] text-slate-500">No lessons yet. Add the first one to make this unit visible in the learning path.</p>
                      ) : (
                        <Table minWidth={760}>
                          <THead>
                            <Th className="w-[52px]">#</Th>
                            <Th>Lesson</Th>
                            <Th className="w-[80px]">Time</Th>
                            <Th className="w-[230px]">Quick check</Th>
                            <Th className="w-[120px]">Completed by</Th>
                            <Th className="w-[150px]">
                              <span className="sr-only">Actions</span>
                            </Th>
                          </THead>
                          <TBody>
                            {unit.lessons.map((lesson, lessonIndex) => (
                              <Tr key={lesson.id} onClick={() => router.push(`/admin/basic/lessons/${lesson.id}`)}>
                                <Td className="tabular text-slate-400">{lessonIndex + 1}</Td>
                                <Td>
                                  <p className="font-medium text-slate-900">{lesson.title}</p>
                                  <p className="line-clamp-1 text-[13px] text-slate-500">{lesson.summary}</p>
                                </Td>
                                <Td className="tabular text-slate-600">{lesson.estimated_minutes} min</Td>
                                <Td>
                                  <CheckSummary lesson={lesson} />
                                </Td>
                                <Td className="tabular text-slate-600">
                                  {lesson.completions > 0 ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <CheckCircle2 size={14} className="text-[#00a360]" /> {lesson.completions}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </Td>
                                <Td>
                                  <span className="flex justify-end gap-0.5">
                                    <IconAction
                                      label={`Move ${lesson.title} up`}
                                      disabled={lessonIndex === 0 || moving}
                                      onClick={() => moveLesson.mutate({ id: lesson.id, direction: "up" })}
                                    >
                                      <ArrowUp size={15} />
                                    </IconAction>
                                    <IconAction
                                      label={`Move ${lesson.title} down`}
                                      disabled={lessonIndex === unit.lessons.length - 1 || moving}
                                      onClick={() => moveLesson.mutate({ id: lesson.id, direction: "down" })}
                                    >
                                      <ArrowDown size={15} />
                                    </IconAction>
                                    <IconAction label={`Edit ${lesson.title}`} onClick={() => router.push(`/admin/basic/lessons/${lesson.id}`)}>
                                      <Pencil size={15} />
                                    </IconAction>
                                    <IconAction label={`Delete ${lesson.title}`} tone="danger" onClick={() => setConfirm({ kind: "lesson", lesson })}>
                                      <Trash2 size={15} />
                                    </IconAction>
                                  </span>
                                </Td>
                              </Tr>
                            ))}
                          </TBody>
                        </Table>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </PageBody>

      <Drawer
        open={unitDraft !== null}
        onClose={() => setUnitDraft(null)}
        title={unitDraft?.id === null ? "New unit" : "Edit unit"}
        subtitle={`Level: ${LEVEL_LABELS[levelKey]}`}
        width={480}
        footer={
          <>
            <Button variant="ghost" onClick={() => setUnitDraft(null)}>
              Cancel
            </Button>
            <Button onClick={submitUnit} disabled={!unitValid || saveUnit.isPending}>
              {saveUnit.isPending ? "Saving…" : "Save unit"}
            </Button>
          </>
        }
      >
        {unitDraft && (
          <div className="space-y-4">
            <Field label="Title" htmlFor="unit-title" hint="e.g. Parts of speech">
              <input
                id="unit-title"
                value={unitDraft.form.title}
                onChange={(event) => setUnitDraft({ ...unitDraft, form: { ...unitDraft.form, title: event.target.value } })}
                className={fieldClass}
              />
            </Field>
            <fieldset>
              <legend className="mb-1.5 block text-[13px] font-medium text-slate-700">Skill area</legend>
              <div className="grid grid-cols-2 gap-2">
                {PILLARS.map((pillar) => {
                  const active = unitDraft.form.pillar === pillar;
                  const Icon = PILLAR_STYLE[pillar].icon;
                  return (
                    <label
                      key={pillar}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-[14px] transition-colors",
                        active ? "border-slate-900 bg-slate-50 font-medium" : "border-slate-200 hover:border-slate-400"
                      )}
                    >
                      <input
                        type="radio"
                        name="unit-pillar"
                        className="sr-only"
                        checked={active}
                        onChange={() => setUnitDraft({ ...unitDraft, form: { ...unitDraft.form, pillar } })}
                      />
                      <span className="flex size-6 items-center justify-center rounded-md" style={{ backgroundColor: PILLAR_STYLE[pillar].tint, color: PILLAR_STYLE[pillar].accent }}>
                        <Icon size={13} />
                      </span>
                      {PILLAR_LABELS[pillar]}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <Field label="Description" htmlFor="unit-description" hint="One sentence on what students learn in this unit.">
              <textarea
                id="unit-description"
                rows={3}
                value={unitDraft.form.description}
                onChange={(event) => setUnitDraft({ ...unitDraft, form: { ...unitDraft.form, description: event.target.value } })}
                className={textareaClass}
              />
            </Field>
            {unitDraft.id === null && (
              <p className="rounded-lg bg-slate-50 px-4 py-3 text-[13px] text-slate-600">
                The unit is added at the end of {LEVEL_LABELS[levelKey]}. Use the arrows to move it. Students with an existing learning path see new
                lessons after they create a new path.
              </p>
            )}
            {saveUnit.isError && <ErrorNotice>{readErrorMessage(saveUnit.error, "Couldn't save the unit.")}</ErrorNotice>}
          </div>
        )}
      </Drawer>

      <Drawer
        open={levelDraft !== null}
        onClose={() => setLevelDraft(null)}
        title={`Edit ${LEVEL_LABELS[levelKey]}`}
        width={480}
        footer={
          <>
            <Button variant="ghost" onClick={() => setLevelDraft(null)}>
              Cancel
            </Button>
            <Button onClick={submitLevel} disabled={!levelDraft || levelDraft.name.trim().length < 2 || levelDraft.description.trim().length < 5 || updateLevel.isPending}>
              Save level
            </Button>
          </>
        }
      >
        {levelDraft && (
          <div className="space-y-4">
            <Field label="Name" htmlFor="level-name">
              <input id="level-name" value={levelDraft.name} onChange={(event) => setLevelDraft({ ...levelDraft, name: event.target.value })} className={fieldClass} />
            </Field>
            <Field label="Description" htmlFor="level-description" hint="Shown to students on their learning path.">
              <textarea
                id="level-description"
                rows={4}
                value={levelDraft.description}
                onChange={(event) => setLevelDraft({ ...levelDraft, description: event.target.value })}
                className={textareaClass}
              />
            </Field>
            {updateLevel.isError && <ErrorNotice>{readErrorMessage(updateLevel.error, "Couldn't save the level.")}</ErrorNotice>}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.kind === "unit" ? "Delete this unit?" : "Delete this lesson?"}
        message={
          confirm?.kind === "unit" ? (
            <>
              <strong className="text-slate-900">{confirm.unit.title}</strong> and its {confirm.unit.lessons.length} lessons will be deleted, together with
              students’ progress on them and the matching steps in their learning paths.
            </>
          ) : confirm?.kind === "lesson" ? (
            <>
              <strong className="text-slate-900">{confirm.lesson.title}</strong> will be deleted
              {confirm.lesson.completions > 0 ? `, including the progress of ${confirm.lesson.completions} students who finished it` : ""}. It is also removed
              from students’ learning paths.
            </>
          ) : null
        }
        pending={removeUnit.isPending || removeLesson.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return;
          const action = confirm.kind === "unit" ? removeUnit.mutateAsync(confirm.unit.id) : removeLesson.mutateAsync(confirm.lesson.id);
          await action.catch(() => undefined);
          setConfirm(null);
        }}
      />
    </>
  );
}
