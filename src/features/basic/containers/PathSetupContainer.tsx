"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Loader2, Route, TriangleAlert } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { Button } from "@/components/ui/button";
import { Canvas, Chip } from "@/src/_global/components/Showcase/Showcase";
import { GanttChart, type GanttRow } from "@/src/_global/components/Charts/Charts";
import {
  DURATION_OPTIONS,
  LEVEL_KEYS,
  LEVEL_LABELS,
  MIN_STUDY_DAYS,
  formatDay,
  localToday,
  type LevelKey,
  type PlanInput,
  type PlanMode,
  type PlanPreview,
} from "@/src/models/basic";
import { useBasicPlan, useCreatePlan, useCurriculum, usePlanPreview } from "../hooks/useBasic";
import { LEVEL_STYLE, WEEKDAYS } from "../constants";

type Step = "mode" | "level" | "schedule" | "review";

const readError = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Something went wrong. Please try again.";

// ---------------------------------------------------------------------------
// Potongan kecil
// ---------------------------------------------------------------------------

function StepDots({ steps, current }: { steps: Array<{ id: Step; label: string }>; current: Step }) {
  const index = steps.findIndex((step) => step.id === current);
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Setup steps">
      {steps.map((step, stepIndex) => {
        const done = stepIndex < index;
        const active = stepIndex === index;
        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-9 items-center gap-2 rounded-full px-4 text-[14px]",
                active && "bg-slate-950 text-white",
                done && "bg-[#d7f5e6] text-slate-900",
                !active && !done && "bg-slate-100 text-slate-500"
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check size={14} strokeWidth={3} /> : <span className="tabular">{stepIndex + 1}</span>}
              {step.label}
            </span>
            {stepIndex < steps.length - 1 && <span className="h-px w-5 bg-slate-300" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

function ChoiceCard({
  selected,
  onSelect,
  tint,
  children,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  tint: string;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "relative flex h-full flex-col rounded-4xl p-6 text-left transition-all duration-200 sm:p-8",
        selected ? "ring-4 ring-slate-950 ring-offset-4" : "hover:-translate-y-0.5"
      )}
      style={{ backgroundColor: tint }}
    >
      <span
        className={cn(
          "absolute right-6 top-6 flex size-7 items-center justify-center rounded-full border-2",
          selected ? "border-slate-950 bg-slate-950 text-white" : "border-slate-400 bg-white/70"
        )}
        aria-hidden="true"
      >
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

/** Pratinjau mini jalur zig-zag untuk kartu mode Guided. */
function MiniPath() {
  const nodes = [0, 1, 2, 3, 4];
  return (
    <div className="relative mt-6 h-[150px] rounded-3xl bg-white/70 p-4" aria-hidden="true">
      {nodes.map((node) => (
        <span
          key={node}
          className={cn(
            "absolute flex size-10 items-center justify-center rounded-full text-white",
            node < 2 ? "bg-[#00c875]" : node === 2 ? "bg-slate-950 ring-4 ring-[#b9e3ff]" : "bg-slate-200"
          )}
          style={{ left: `${10 + node * 19}%`, top: node % 2 ? "58%" : "14%" }}
        >
          {node < 2 && <Check size={16} strokeWidth={3} />}
        </span>
      ))}
    </div>
  );
}

/** Pratinjau mini kalender untuk kartu mode Scheduled. */
function MiniCalendar() {
  const filled = new Set([0, 1, 2, 3, 4, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18]);
  return (
    <div className="mt-6 grid grid-cols-7 gap-1.5 rounded-3xl bg-white/70 p-4" aria-hidden="true">
      {Array.from({ length: 21 }, (_, day) => (
        <span
          key={day}
          className={cn(
            "h-7 rounded-lg",
            filled.has(day) ? (day < 5 ? "bg-[#00c875]" : "bg-[#579bfc]") : "bg-slate-100"
          )}
        />
      ))}
    </div>
  );
}

const INTENSITY: Record<string, { label: string; tone: string }> = {
  LIGHT: { label: "Light", tone: "#d7f5e6" },
  STEADY: { label: "Steady", tone: "#dde8fb" },
  INTENSIVE: { label: "Intensive", tone: "#fdeef1" },
};

function Summary({ preview }: { preview: PlanPreview }) {
  const { summary } = preview;
  const reviews = preview.tasks.filter((task) => task.task_type === "UNIT_REVIEW").length;
  const checkpoints = preview.tasks.filter((task) => task.task_type === "LEVEL_CHECKPOINT").length;
  const hours = Math.round((summary.total_minutes / 60) * 10) / 10;

  const stats: Array<[string, React.ReactNode]> = [
    ["Lessons", summary.total_lessons],
    ["Unit reviews", reviews],
    ["Level checkpoints", checkpoints],
    ["Total study time", `${hours} h`],
  ];
  if (preview.mode === "SCHEDULED") {
    stats.push(
      ["Study days", summary.study_day_count],
      ["Per study day", `~${summary.average_minutes_per_day} min`],
      ["Finishes on", summary.end_date ? formatDay(summary.end_date, { day: "numeric", month: "short", year: "numeric" }) : "—"]
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-2xl bg-white p-4">
          <dt className="text-[13px] text-slate-600">{label}</dt>
          <dd className="tabular mt-1 font-display text-[24px] leading-none text-slate-900">{value}</dd>
        </div>
      ))}
      {summary.intensity && (
        <div className="rounded-2xl p-4" style={{ backgroundColor: INTENSITY[summary.intensity].tone }}>
          <dt className="text-[13px] text-slate-600">Pace</dt>
          <dd className="mt-1 font-display text-[24px] leading-none text-slate-900">{INTENSITY[summary.intensity].label}</dd>
        </div>
      )}
    </dl>
  );
}

/** Timeline per level dalam minggu, dari hasil pratinjau. */
function PreviewGantt({ preview }: { preview: PlanPreview }) {
  if (preview.mode !== "SCHEDULED" || !preview.start_date) return null;
  const start = new Date(`${preview.start_date}T00:00:00`).getTime();
  const weekOf = (date: string) => (new Date(`${date}T00:00:00`).getTime() - start) / (7 * 86_400_000);
  const weeks = Math.max(1, Math.ceil(weekOf(preview.end_date ?? preview.start_date) + 1 / 7));

  const rows: GanttRow[] = LEVEL_KEYS.flatMap((key) => {
    const dates = preview.tasks
      .filter((task) => task.level_key === key && task.scheduled_date)
      .map((task) => task.scheduled_date as string);
    if (dates.length === 0) return [];
    const first = weekOf(dates[0]);
    const last = weekOf(dates[dates.length - 1]) + 1 / 7;
    return [{ label: LEVEL_LABELS[key], start: first, length: Math.max(last - first, 0.3), color: LEVEL_STYLE[key].accent }];
  });

  return <GanttChart rows={rows} weeks={weeks} label="Your path by level, week by week" />;
}

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

export function PathSetupContainer() {
  const router = useRouter();
  const { data: curriculum } = useCurriculum();
  const { data: existingPlan } = useBasicPlan();
  const preview = usePlanPreview();
  const createPlan = useCreatePlan();

  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<PlanMode | null>(null);
  const [level, setLevel] = useState<LevelKey>("BEGINNER");
  const [weeks, setWeeks] = useState<number>(4);
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState<string>(() => localToday());

  const steps = useMemo(
    () =>
      [
        { id: "mode" as const, label: "Path style" },
        { id: "level" as const, label: "Starting level" },
        ...(mode === "SCHEDULED" ? [{ id: "schedule" as const, label: "Schedule" }] : []),
        { id: "review" as const, label: "Review" },
      ],
    [mode]
  );

  const input: PlanInput | null = useMemo(() => {
    if (!mode) return null;
    return mode === "GUIDED"
      ? { mode, start_level: level }
      : { mode, start_level: level, start_date: startDate, duration_weeks: weeks, study_days: days };
  }, [mode, level, startDate, weeks, days]);

  const scheduleValid = days.length >= MIN_STUDY_DAYS && startDate >= localToday();

  // Pratinjau diperbarui otomatis di langkah jadwal & tinjauan.
  const { mutate: requestPreview } = preview;
  useEffect(() => {
    if (!input || (step !== "schedule" && step !== "review")) return;
    if (input.mode === "SCHEDULED" && !scheduleValid) return;
    const timer = window.setTimeout(() => requestPreview(input), 250);
    return () => window.clearTimeout(timer);
  }, [input, step, scheduleValid, requestPreview]);

  const go = (direction: 1 | -1) => {
    const index = steps.findIndex((item) => item.id === step);
    const next = steps[index + direction];
    if (next) setStep(next.id);
  };

  const lessonsFrom = (key: LevelKey) =>
    (curriculum ?? [])
      .filter((item) => LEVEL_KEYS.indexOf(item.key) >= LEVEL_KEYS.indexOf(key))
      .reduce((sum, item) => sum + item.units.reduce((acc, unit) => acc + unit.lessons.length, 0), 0);

  const canContinue =
    (step === "mode" && mode !== null) || step === "level" || (step === "schedule" && scheduleValid);

  const handleCreate = async () => {
    if (!input) return;
    try {
      await createPlan.mutateAsync(input);
      router.push("/basic");
    } catch {
      // Pesan dirender dari state mutation.
    }
  };

  const toggleDay = (value: number) =>
    setDays((current) => (current.includes(value) ? current.filter((day) => day !== value) : [...current, value]));

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-6 lg:px-8">
      <Link
        href="/basic"
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[14px] text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <ArrowLeft size={15} /> Basic to Hero
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[44px]">
            Build your learning path
          </h1>
          <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-slate-600">
            Two questions, and we generate a structured path through every foundation lesson.
          </p>
        </div>
        <StepDots steps={steps} current={step} />
      </div>

      {existingPlan && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl bg-[#fff3e0] px-4 py-3 text-[14px] text-slate-800">
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-[#b86e00]" />
          You already have a learning path. Creating a new one replaces it; lessons you have finished stay finished.
        </p>
      )}

      <div className="mt-10">
        {step === "mode" && (
          <div role="radiogroup" aria-label="Path style" className="grid gap-5 md:grid-cols-2">
            <ChoiceCard
              selected={mode === "GUIDED"}
              onSelect={() => setMode("GUIDED")}
              tint="#d7f5e6"
              label="Full foundations path, no schedule"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#007a47]">
                <Route size={22} aria-hidden="true" />
              </span>
              <span className="mt-5 block font-display text-[26px] leading-tight text-slate-900">Full foundations path</span>
              <span className="mt-2 flex flex-wrap gap-2">
                <Chip color={{ bg: "#ffffff", fg: "#323338" }}>No schedule</Chip>
                <Chip color={{ bg: "#ffffff", fg: "#323338" }}>Your own pace</Chip>
              </span>
              <span className="mt-4 block max-w-[46ch] text-[15px] leading-relaxed text-slate-700">
                Work through every lesson in order. No deadlines — the next step unlocks as soon as you finish the one before.
              </span>
              <MiniPath />
            </ChoiceCard>

            <ChoiceCard
              selected={mode === "SCHEDULED"}
              onSelect={() => setMode("SCHEDULED")}
              tint="#dde8fb"
              label="Scheduled path with a timeline of at least one month"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#1f5fcc]">
                <CalendarDays size={22} aria-hidden="true" />
              </span>
              <span className="mt-5 block font-display text-[26px] leading-tight text-slate-900">Scheduled path</span>
              <span className="mt-2 flex flex-wrap gap-2">
                <Chip color={{ bg: "#ffffff", fg: "#323338" }}>Timeline from 1 month</Chip>
                <Chip color={{ bg: "#ffffff", fg: "#323338" }}>Daily to-do</Chip>
              </span>
              <span className="mt-4 block max-w-[46ch] text-[15px] leading-relaxed text-slate-700">
                Pick a timeline and your study days. Every lesson, review and checkpoint gets a date, spread evenly across
                your calendar.
              </span>
              <MiniCalendar />
            </ChoiceCard>
          </div>
        )}

        {step === "level" && (
          <div>
            <div role="radiogroup" aria-label="Starting level" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {LEVEL_KEYS.map((key, index) => (
                <ChoiceCard
                  key={key}
                  selected={level === key}
                  onSelect={() => setLevel(key)}
                  tint={LEVEL_STYLE[key].tint}
                  label={`Start at ${LEVEL_LABELS[key]}`}
                >
                  <span className="tabular font-display text-[15px] text-slate-600">Level 0{index + 1}</span>
                  <span className="mt-1 block font-display text-[24px] text-slate-900">{LEVEL_LABELS[key]}</span>
                  <span className="mt-3 block text-[14px] leading-relaxed text-slate-700">{LEVEL_STYLE[key].blurb}</span>
                  <span className="tabular mt-auto block pt-6 text-[13px] text-slate-600">
                    {curriculum ? `${lessonsFrom(key)} lessons from here` : " "}
                  </span>
                </ChoiceCard>
              ))}
            </div>
            <p className="mt-5 text-[14px] text-slate-600">
              Not sure? Start at Beginner. Lessons you already know only take a few minutes, and every level ends with a
              checkpoint.
            </p>
          </div>
        )}

        {step === "schedule" && (
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <Canvas tint="#f6f7fb" className="space-y-8 p-6 sm:p-8">
              <fieldset>
                <legend className="font-display text-[20px] text-slate-900">Timeline</legend>
                <p className="mt-1 text-[14px] text-slate-600">One month is the minimum for a structured path.</p>
                <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Timeline">
                  {DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.weeks}
                      type="button"
                      role="radio"
                      aria-checked={weeks === option.weeks}
                      onClick={() => setWeeks(option.weeks)}
                      className={cn(
                        "h-12 rounded-full px-6 text-[15px] transition-colors",
                        weeks === option.weeks ? "bg-slate-950 text-white" : "bg-white text-slate-800 hover:bg-slate-100"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-display text-[20px] text-slate-900">Study days</legend>
                <p className="mt-1 text-[14px] text-slate-600">Choose at least {MIN_STUDY_DAYS} days a week.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const on = days.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleDay(day.value)}
                        className={cn(
                          "size-12 rounded-full text-[14px] font-medium transition-colors",
                          on ? "bg-[#579bfc] text-white" : "bg-white text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        {day.short}
                      </button>
                    );
                  })}
                </div>
                {days.length < MIN_STUDY_DAYS && (
                  <p role="alert" className="mt-3 text-[14px] text-[#b12a41]">
                    Pick {MIN_STUDY_DAYS - days.length} more day{MIN_STUDY_DAYS - days.length > 1 ? "s" : ""}.
                  </p>
                )}
              </fieldset>

              <div>
                <label htmlFor="start-date" className="font-display text-[20px] text-slate-900">
                  Start date
                </label>
                <input
                  id="start-date"
                  type="date"
                  min={localToday()}
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-3 block h-12 rounded-2xl border border-slate-300 bg-white px-4 text-[15px] focus:border-primary-500 focus:outline-none"
                />
              </div>
            </Canvas>

            <Canvas tint="#dde8fb" className="p-6 sm:p-8" aria-live="polite">
              <p className="font-display text-[20px] text-slate-900">What this looks like</p>
              {preview.isPending && (
                <p className="mt-4 flex items-center gap-2 text-[14px] text-slate-600">
                  <Loader2 size={16} className="animate-spin" /> Calculating…
                </p>
              )}
              {preview.data && preview.data.mode === "SCHEDULED" && (
                <div className="mt-5 space-y-4">
                  <p className="font-display text-[44px] leading-none text-slate-900">
                    ~{preview.data.summary.average_minutes_per_day}
                    <span className="text-[18px] text-slate-600"> min per study day</span>
                  </p>
                  <p className="text-[15px] text-slate-700">
                    {preview.data.summary.study_day_count} study days, finishing{" "}
                    {preview.data.summary.end_date &&
                      formatDay(preview.data.summary.end_date, { weekday: "long", day: "numeric", month: "long" })}
                    .
                  </p>
                  {preview.data.summary.intensity === "INTENSIVE" && (
                    <p className="flex items-start gap-2 rounded-2xl bg-white px-4 py-3 text-[14px] text-slate-800">
                      <TriangleAlert size={16} className="mt-0.5 shrink-0 text-[#b86e00]" />
                      That is an intensive pace. Add study days or choose a longer timeline to make it more sustainable.
                    </p>
                  )}
                </div>
              )}
              {preview.isError && <p className="mt-4 text-[14px] text-[#b12a41]">{readError(preview.error)}</p>}
            </Canvas>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-5">
            {preview.isPending && !preview.data && (
              <p className="flex items-center gap-2 text-[15px] text-slate-600">
                <Loader2 size={16} className="animate-spin" /> Generating your path…
              </p>
            )}
            {preview.isError && <p className="text-[15px] text-[#b12a41]">{readError(preview.error)}</p>}
            {preview.data && (
              <>
                <Canvas tint={preview.data.mode === "SCHEDULED" ? "#dde8fb" : "#d7f5e6"} className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip color={{ bg: "#ffffff", fg: "#323338" }}>
                      {preview.data.mode === "SCHEDULED" ? "Scheduled path" : "Full foundations path"}
                    </Chip>
                    <Chip color={{ bg: "#ffffff", fg: "#323338" }}>From {LEVEL_LABELS[preview.data.start_level]}</Chip>
                  </div>
                  <h2 className="mt-4 font-display text-[28px] font-normal text-slate-900">Your path at a glance</h2>
                  <div className="mt-6">
                    <Summary preview={preview.data} />
                  </div>
                </Canvas>

                {preview.data.mode === "SCHEDULED" && (
                  <div className="rounded-4xl border border-slate-200 p-5 sm:p-7">
                    <h3 className="mb-5 font-display text-[20px] font-normal text-slate-900">Timeline by level</h3>
                    <PreviewGantt preview={preview.data} />
                  </div>
                )}

                <div className="rounded-4xl border border-slate-200 p-5 sm:p-7">
                  <h3 className="mb-4 font-display text-[20px] font-normal text-slate-900">First steps</h3>
                  <ol className="space-y-2">
                    {preview.data.tasks.slice(0, 6).map((task) => (
                      <li key={task.order} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-[15px]">
                        <span className="tabular w-6 text-slate-500">{task.order}</span>
                        <span className="flex-1 text-slate-900">{task.title}</span>
                        {task.scheduled_date && (
                          <span className="tabular text-[13px] text-slate-600">{formatDay(task.scheduled_date)}</span>
                        )}
                        <span className="tabular text-[13px] text-slate-500">{task.estimated_minutes} min</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}
            {createPlan.isError && (
              <p role="alert" className="text-[15px] text-[#b12a41]">
                {readError(createPlan.error)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
        <Button variant="ghost" shape="pill" onClick={() => go(-1)} disabled={step === "mode"}>
          <ArrowLeft size={16} /> Back
        </Button>
        {step !== "review" ? (
          <Button variant="dark" shape="pill" size="lg" onClick={() => go(1)} disabled={!canContinue}>
            Continue <ArrowRight size={16} />
          </Button>
        ) : (
          <Button variant="dark" shape="pill" size="lg" onClick={handleCreate} disabled={!preview.data || createPlan.isPending}>
            {createPlan.isPending && <Loader2 size={16} className="animate-spin" />}
            Create my path <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
