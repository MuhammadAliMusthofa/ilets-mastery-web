"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarClock, Check, Loader2, Play, RefreshCw, Route, X } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import { Canvas, Chip, PillLink, SectionTitle } from "@/src/_global/components/Showcase/Showcase";
import { GaugeChart } from "@/src/_global/components/Charts/Charts";
import { ModuleSwitcher } from "@/src/features/shared/components/ModuleSwitcher";
import {
  LEVEL_KEYS,
  LEVEL_LABELS,
  PILLAR_LABELS,
  addDaysLocal,
  formatDay,
  localToday,
  taskHref,
  type Plan,
  type PlanTask,
} from "@/src/models/basic";
import { useArchivePlan, useBasicPlan, useCurriculum, useReschedulePlan } from "../hooks/useBasic";
import { LEVEL_STYLE, PILLAR_STYLE } from "../constants";
import { PathMap } from "../components/PathMap";

// ---------------------------------------------------------------------------
// Belum punya path
// ---------------------------------------------------------------------------

function NoPlanIntro() {
  const { data: curriculum } = useCurriculum();
  const levels = curriculum ?? [];
  const unitCount = levels.reduce((sum, level) => sum + level.units.length, 0);
  const lessonCount = levels.reduce(
    (sum, level) => sum + level.units.reduce((acc, unit) => acc + unit.lessons.length, 0),
    0
  );

  return (
    <>
      <PageHeader
        title="English Basic to Hero"
        description="A structured path through the foundations of English, from Beginner to Advanced."
      >
        <ModuleSwitcher />
      </PageHeader>
      <PageBody className="space-y-16">
        <Canvas tint="#d7f5e6" className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-[32px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[42px]">
              Start your learning path
            </h2>
            <p className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-slate-700">
              Choose a self-paced path through every lesson, or a scheduled one that fits your calendar. Either way you
              get a clear order: lessons, unit reviews and a checkpoint at the end of each level.
            </p>
            <PillLink href="/basic/path/setup" size="lg" className="mt-8">
              Start
            </PillLink>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {[
              ["Levels", levels.length || "—"],
              ["Units", unitCount || "—"],
              ["Lessons", lessonCount || "—"],
              ["Skills", "4 pillars"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl bg-white p-5">
                <dt className="text-[13px] text-slate-600">{label}</dt>
                <dd className="tabular mt-1 font-display text-[30px] leading-none text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </Canvas>

        <section aria-labelledby="ladder">
          <SectionTitle
            id="ladder"
            title={unitCount ? `${levels.length} levels, ${unitCount} units` : "The curriculum"}
            description="It starts with parts of speech, then every level covers grammar, vocabulary, conversation and pronunciation."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(curriculum ?? []).map((level, index) => (
              <article key={level.key} className="rounded-4xl p-6" style={{ backgroundColor: LEVEL_STYLE[level.key].tint }}>
                <p className="tabular text-[14px] text-slate-600">Level 0{index + 1}</p>
                <h3 className="font-display text-[24px] font-normal text-slate-900">{level.name}</h3>
                <ul className="mt-4 space-y-2">
                  {level.units.map((unit) => {
                    const Icon = PILLAR_STYLE[unit.pillar].icon;
                    return (
                      <li key={unit.id} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-[14px] text-slate-800">
                        <Icon size={16} style={{ color: PILLAR_STYLE[unit.pillar].accent }} aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">{unit.title}</span>
                        <span className="tabular text-[12px] text-slate-500">{unit.lessons.length}</span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </PageBody>
    </>
  );
}

// ---------------------------------------------------------------------------
// Punya path
// ---------------------------------------------------------------------------

function TaskRow({ task, today }: { task: PlanTask; today: string }) {
  const done = task.status === "DONE";
  const overdue = !done && task.scheduled_date !== null && task.scheduled_date < today;
  return (
    <li>
      <Link
        href={taskHref(task)}
        className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 transition-colors hover:bg-slate-50"
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            done ? "bg-[#00c875] text-white" : "border-2 border-slate-300"
          )}
          aria-hidden="true"
        >
          {done && <Check size={15} strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-[15px]", done ? "text-slate-500 line-through" : "text-slate-900")}>
            {task.title}
          </span>
          <span className="tabular block text-[12px] text-slate-500">
            {task.pillar ? PILLAR_LABELS[task.pillar] : task.task_type === "LEVEL_CHECKPOINT" ? "Checkpoint" : "Review"} ·{" "}
            {task.estimated_minutes} min
            {overdue && task.scheduled_date && ` · was due ${formatDay(task.scheduled_date)}`}
          </span>
        </span>
        {overdue && (
          <Chip color={{ bg: "#fdab3d", fg: "#323338" }} className="h-5 text-[11px]">
            Overdue
          </Chip>
        )}
        <ArrowRight size={16} className="text-slate-400" aria-hidden="true" />
      </Link>
    </li>
  );
}

/** Tujuh hari mulai Senin minggu ini, dengan jumlah tugas & menit per hari. */
function WeekStrip({ plan, today }: { plan: Plan; today: string }) {
  const weekday = new Date(`${today}T00:00:00`).getDay();
  const monday = addDaysLocal(today, -((weekday + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => addDaysLocal(monday, i));

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const tasks = plan.tasks.filter((task) => task.scheduled_date === day);
        const minutes = tasks.reduce((sum, task) => sum + task.estimated_minutes, 0);
        const allDone = tasks.length > 0 && tasks.every((task) => task.status === "DONE");
        const isToday = day === today;
        return (
          <div
            key={day}
            className={cn(
              "flex min-h-[104px] flex-col rounded-2xl p-2.5 sm:p-3",
              isToday ? "bg-slate-950 text-white" : tasks.length ? "bg-white" : "bg-white/50"
            )}
          >
            <span className={cn("text-[12px]", isToday ? "text-[#c3c6d4]" : "text-slate-500")}>
              {formatDay(day, { weekday: "short" })}
            </span>
            <span className="tabular font-display text-[20px] leading-tight">{formatDay(day, { day: "numeric" })}</span>
            <span className="mt-auto">
              {tasks.length > 0 ? (
                <span className="flex items-center gap-1 text-[12px]">
                  {allDone && <Check size={12} strokeWidth={3} className={isToday ? "text-[#00c875]" : "text-[#007a47]"} />}
                  <span className="tabular">{minutes}m</span>
                </span>
              ) : (
                <span className={cn("text-[12px]", isToday ? "text-[#c3c6d4]" : "text-slate-400")}>Rest</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ChangePathDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const archive = useArchivePlan();
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 p-4">
      <div role="alertdialog" aria-modal="true" aria-labelledby="change-title" className="w-full max-w-md rounded-3xl bg-white p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 id="change-title" className="font-display text-[22px] font-normal text-slate-900">
            Change your path?
          </h2>
          <button type="button" onClick={onClose} aria-label="Cancel" className="flex size-8 items-center justify-center rounded-full hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
          You’ll set up a new path from scratch. Lessons you have already finished stay finished and count in the new path.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" shape="pill" onClick={onClose}>
            Keep this path
          </Button>
          <Button
            variant="dark"
            shape="pill"
            disabled={archive.isPending}
            onClick={async () => {
              await archive.mutateAsync();
              router.push("/basic/path/setup");
            }}
          >
            {archive.isPending && <Loader2 size={16} className="animate-spin" />}
            Set up a new path
          </Button>
        </div>
      </div>
    </div>
  );
}

function PlanView({ plan }: { plan: Plan }) {
  const today = useMemo(() => localToday(), []);
  const reschedule = useReschedulePlan();
  const [changing, setChanging] = useState(false);
  const scheduled = plan.mode === "SCHEDULED";

  const todayTasks = plan.tasks.filter((task) => task.scheduled_date === today);
  const overdue = plan.tasks.filter((task) => task.status === "PENDING" && task.scheduled_date !== null && task.scheduled_date < today);
  const upNext = plan.tasks.filter((task) => task.status === "PENDING").slice(0, 4);
  const lessons = plan.tasks.filter((task) => task.task_type === "LESSON");
  const lessonsDone = lessons.filter((task) => task.status === "DONE").length;
  const currentLevel = plan.next_task?.level_key ?? LEVEL_KEYS[LEVEL_KEYS.length - 1];
  const finished = plan.next_task === null;

  return (
    <>
      <div className="mx-auto max-w-[1320px] px-3 pt-3 sm:px-5 lg:px-8 lg:pt-6">
        <section className="relative overflow-hidden rounded-4xl bg-slate-950 text-white">
          <div className="grid gap-8 px-7 py-10 sm:px-12 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:py-14">
            <div>
              <div className="flex flex-wrap gap-2">
                <Chip color={{ bg: "#292f4c", fg: "#ffffff" }}>
                  {scheduled ? <CalendarClock size={13} aria-hidden="true" /> : <Route size={13} aria-hidden="true" />}
                  {scheduled ? "Scheduled path" : "Full foundations path"}
                </Chip>
                {scheduled && plan.end_date && (
                  <Chip color={{ bg: "#292f4c", fg: "#ffffff" }}>
                    Ends {formatDay(plan.end_date, { day: "numeric", month: "short", year: "numeric" })}
                  </Chip>
                )}
              </div>
              <h1 className="mt-5 font-display text-[36px] font-normal leading-[1.08] tracking-[-0.02em] sm:text-[50px]">
                {finished ? "Path complete. Well done!" : "Your learning path"}
              </h1>
              <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-[#c3c6d4]">
                {finished
                  ? "You’ve finished every lesson, review and checkpoint. Keep your English sharp with IELTS practice."
                  : `${lessonsDone} of ${lessons.length} lessons done · currently in ${LEVEL_LABELS[currentLevel]}.`}
              </p>
              {plan.next_task && (
                <Link
                  href={taskHref(plan.next_task)}
                  className="mt-8 inline-flex h-12 max-w-full items-center gap-2 rounded-full bg-[#b9e3ff] px-7 text-[15px] font-medium text-slate-900 transition-colors hover:bg-white"
                >
                  <Play size={16} className="shrink-0 fill-current" />
                  <span className="truncate">Continue: {plan.next_task.title}</span>
                </Link>
              )}
            </div>
            <div className="rounded-3xl bg-white p-4 text-slate-900">
              <div className="flex justify-center">
                <GaugeChart
                  value={plan.stats.percent}
                  max={100}
                  display={`${plan.stats.percent}%`}
                  caption={`${plan.stats.done_tasks} of ${plan.stats.total_tasks} steps`}
                  label="Path progress"
                  segments={LEVEL_KEYS.map((key, index) => ({
                    from: index * 25,
                    to: (index + 1) * 25,
                    color: LEVEL_STYLE[key].accent,
                    label: LEVEL_LABELS[key],
                  }))}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <PageBody className="space-y-14 pt-12">
        {scheduled ? (
          <section aria-labelledby="today" className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <Canvas tint="#dde8fb" className="p-5 sm:p-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 id="today" className="font-display text-[24px] font-normal text-slate-900">
                  Today · {formatDay(today, { weekday: "long", day: "numeric", month: "long" })}
                </h2>
                <span className="tabular text-[13px] text-slate-600">
                  {todayTasks.reduce((sum, task) => sum + task.estimated_minutes, 0)} min
                </span>
              </div>
              {todayTasks.length > 0 ? (
                <ul className="space-y-2">
                  {todayTasks.map((task) => (
                    <TaskRow key={task.id} task={task} today={today} />
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl bg-white px-4 py-5 text-[15px] text-slate-700">
                  No study planned for today. {upNext[0] ? "Want to get ahead? Start the next step below." : ""}
                </p>
              )}

              {overdue.length > 0 && (
                <div className="mt-5 rounded-2xl bg-[#fff3e0] p-4">
                  <p className="text-[14px] text-slate-800">
                    <span className="font-semibold">{overdue.length}</span> step{overdue.length > 1 ? "s are" : " is"} overdue.
                    Reschedule to spread them over your remaining study days.
                  </p>
                  <Button
                    variant="dark"
                    shape="pill"
                    size="sm"
                    className="mt-3"
                    disabled={reschedule.isPending}
                    onClick={() => reschedule.mutate()}
                  >
                    {reschedule.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    Reschedule from today
                  </Button>
                </div>
              )}
            </Canvas>

            <Canvas tint="#f6f7fb" className="p-5 sm:p-7">
              <h2 className="mb-4 font-display text-[24px] font-normal text-slate-900">This week</h2>
              <WeekStrip plan={plan} today={today} />
              {overdue.length === 0 && upNext.length > 0 && (
                <>
                  <h3 className="mb-2 mt-6 text-[14px] font-medium text-slate-700">Up next</h3>
                  <ul className="space-y-2">
                    {upNext.slice(0, 2).map((task) => (
                      <TaskRow key={task.id} task={task} today={today} />
                    ))}
                  </ul>
                </>
              )}
            </Canvas>
          </section>
        ) : (
          !finished && (
            <Canvas tint="#d7f5e6" as="section" aria-labelledby="next-steps" className="p-5 sm:p-7">
              <h2 id="next-steps" className="mb-4 font-display text-[24px] font-normal text-slate-900">
                Next steps
              </h2>
              <ul className="grid gap-2 md:grid-cols-2">
                {upNext.map((task) => (
                  <TaskRow key={task.id} task={task} today={today} />
                ))}
              </ul>
            </Canvas>
          )
        )}

        <section aria-labelledby="path-map">
          <SectionTitle
            id="path-map"
            title="Your path"
            description={
              scheduled
                ? "Every step has a date. You can work ahead at any time."
                : "Finish each step to unlock the next one."
            }
            action={
              <button
                type="button"
                onClick={() => setChanging(true)}
                className={cn(buttonVariants({ variant: "outline", shape: "pill", size: "sm" }))}
              >
                Change path
              </button>
            }
          />
          <PathMap plan={plan} today={today} />
        </section>
      </PageBody>

      {changing && <ChangePathDialog onClose={() => setChanging(false)} />}
    </>
  );
}

export function BasicPathContainer() {
  const { data: plan, isLoading, isError } = useBasicPlan();

  if (isLoading) {
    return (
      <PageBody>
        <p className="flex items-center gap-2 text-[15px] text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Loading your path…
        </p>
      </PageBody>
    );
  }
  if (isError) {
    return (
      <PageBody>
        <p className="text-[15px] text-[#b12a41]">Couldn’t load your learning path. Reload the page to try again.</p>
      </PageBody>
    );
  }
  return plan ? <PlanView plan={plan} /> : <NoPlanIntro />;
}
