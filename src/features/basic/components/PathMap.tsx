"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Flag, Lock, RotateCcw } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { Chip } from "@/src/_global/components/Showcase/Showcase";
import {
  LEVEL_KEYS,
  LEVEL_LABELS,
  PILLAR_LABELS,
  formatDay,
  taskHref,
  type LevelKey,
  type Plan,
  type PlanTask,
} from "@/src/models/basic";
import { LEVEL_STYLE, PILLAR_STYLE } from "../constants";

type NodeState = "done" | "current" | "available" | "locked" | "overdue";

const stateOf = (task: PlanTask, plan: Plan, today: string): NodeState => {
  if (task.status === "DONE") return "done";
  if (plan.next_task?.id === task.id) return "current";
  // Mode Guided: langkah setelah langkah aktif masih terkunci.
  if (plan.mode === "GUIDED" && plan.next_task && task.order > plan.next_task.order) return "locked";
  if (task.scheduled_date && task.scheduled_date < today) return "overdue";
  return "available";
};

// Offset horizontal zig-zag (dalam px) untuk tiap simpul, seperti jalur berkelok.
const OFFSETS = [0, 56, 96, 56, 0, -56, -96, -56];

function PathNode({ task, state, index }: { task: PlanTask; state: NodeState; index: number }) {
  const pillar = task.pillar ? PILLAR_STYLE[task.pillar] : null;
  const Icon =
    task.task_type === "LEVEL_CHECKPOINT" ? Flag : task.task_type === "UNIT_REVIEW" ? RotateCcw : pillar?.icon ?? Check;
  const big = task.task_type === "LEVEL_CHECKPOINT";
  const locked = state === "locked";

  const circle = (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full transition-transform duration-200",
        big ? "size-[72px]" : "size-16",
        state === "done" && "bg-[#00c875] text-white",
        state === "current" && "bg-slate-950 text-white ring-8 ring-[#b9e3ff]",
        state === "available" && "border-2 border-slate-200 bg-white",
        state === "overdue" && "border-2 border-[#fdab3d] bg-white",
        locked && "bg-slate-100 text-slate-400",
        !locked && "group-hover/node:scale-105"
      )}
      style={state === "available" || state === "overdue" ? { color: pillar?.accent ?? "#323338" } : undefined}
      aria-hidden="true"
    >
      {state === "done" ? <Check size={26} strokeWidth={3} /> : locked ? <Lock size={20} /> : <Icon size={big ? 28 : 24} />}
    </span>
  );

  const label = (
    <span className="min-w-0">
      <span className={cn("block text-[15px] font-medium", locked ? "text-slate-400" : "text-slate-900")}>{task.title}</span>
      <span className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-slate-500">
        {task.task_type === "LESSON" && task.pillar && <span>{PILLAR_LABELS[task.pillar]}</span>}
        {task.task_type === "UNIT_REVIEW" && <span>Unit review</span>}
        {task.task_type === "LEVEL_CHECKPOINT" && <span>Level checkpoint</span>}
        <span className="tabular">· {task.estimated_minutes} min</span>
        {task.scheduled_date && <span className="tabular">· {formatDay(task.scheduled_date)}</span>}
        {state === "current" && (
          <Chip color={{ bg: "#b9e3ff", fg: "#323338" }} className="h-5 text-[11px]">
            Up next
          </Chip>
        )}
        {state === "overdue" && (
          <Chip color={{ bg: "#fdab3d", fg: "#323338" }} className="h-5 text-[11px]">
            Overdue
          </Chip>
        )}
      </span>
    </span>
  );

  const offset = OFFSETS[index % OFFSETS.length];
  const body = (
    <span
      className="flex max-w-full items-center gap-4 pr-[calc(96px*var(--zig,1))]"
      style={{ transform: `translateX(calc(${offset}px * var(--zig, 1)))` }}
    >
      {circle}
      {label}
    </span>
  );

  if (locked) {
    return (
      <li className="py-2.5" aria-label={`${task.title}, locked`}>
        {body}
      </li>
    );
  }
  return (
    <li className="py-2.5">
      <Link href={taskHref(task)} className="group/node block max-w-full rounded-full outline-offset-4">
        {body}
      </Link>
    </li>
  );
}

/**
 * Peta path: satu bagian per level, dikelompokkan per unit, simpul berkelok.
 * Hanya level yang sedang berjalan yang terbuka; level lain bisa dibuka manual.
 */
export function PathMap({ plan, today }: { plan: Plan; today: string }) {
  const currentLevel = plan.next_task?.level_key ?? null;
  const [open, setOpen] = useState<Set<LevelKey>>(() => new Set(currentLevel ? [currentLevel] : LEVEL_KEYS));
  const toggle = (key: LevelKey) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const byLevel = LEVEL_KEYS.map((key) => ({
    key,
    tasks: plan.tasks.filter((task) => task.level_key === key),
  })).filter((group) => group.tasks.length > 0);

  return (
    <div className="space-y-10">
      {byLevel.map((group) => {
        const done = group.tasks.filter((task) => task.status === "DONE").length;
        const style = LEVEL_STYLE[group.key as LevelKey];
        let nodeIndex = 0;

        // Susun ulang per unit, menjaga urutan; checkpoint (tanpa unit) di akhir.
        const units: Array<{ unitId: number | null; title: string | null; pillar: PlanTask["pillar"]; tasks: PlanTask[] }> = [];
        group.tasks.forEach((task) => {
          const last = units[units.length - 1];
          if (last && last.unitId === task.unit_id) last.tasks.push(task);
          else units.push({ unitId: task.unit_id, title: task.unit_title, pillar: task.pillar, tasks: [task] });
        });

        return (
          <section key={group.key} aria-labelledby={`level-${group.key}`} className="overflow-hidden rounded-4xl" style={{ backgroundColor: style.tint }}>
            <header className={cn("flex flex-wrap items-end justify-between gap-4 px-6 pt-7 sm:px-9", open.has(group.key) ? "pb-4" : "pb-7")}>
              <div className="flex items-end gap-4">
                <button
                  type="button"
                  onClick={() => toggle(group.key)}
                  aria-expanded={open.has(group.key)}
                  aria-controls={`level-steps-${group.key}`}
                  aria-label={`${open.has(group.key) ? "Hide" : "Show"} ${LEVEL_LABELS[group.key]} steps`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 transition-colors hover:bg-slate-100"
                >
                  <ChevronDown size={18} className={cn("transition-transform duration-200", !open.has(group.key) && "-rotate-90")} />
                </button>
                <div>
                <p className="tabular text-[14px] text-slate-600">Level 0{LEVEL_KEYS.indexOf(group.key) + 1}</p>
                <h2 id={`level-${group.key}`} className="font-display text-[30px] font-normal leading-tight text-slate-900">
                  {LEVEL_LABELS[group.key]}
                </h2>
                </div>
              </div>
              <div className="w-full max-w-[240px]">
                <p className="tabular mb-1.5 text-[13px] text-slate-700">
                  {done} of {group.tasks.length} steps done
                </p>
                <div className="h-2 rounded-full bg-white/80">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${(done / group.tasks.length) * 100}%`, backgroundColor: style.accent }}
                  />
                </div>
              </div>
            </header>

            <div id={`level-steps-${group.key}`} hidden={!open.has(group.key)} className="m-3 space-y-3 sm:m-4">
              {units.map((unit, unitIdx) => (
                <div key={`${unit.unitId ?? "checkpoint"}-${unitIdx}`} className="rounded-3xl bg-white px-5 py-5 sm:px-8">
                  {unit.title && unit.pillar && (
                    <p className="mb-2 flex items-center gap-2 text-[13px] text-slate-500">
                      <span className="size-2 rounded-full" style={{ backgroundColor: PILLAR_STYLE[unit.pillar].accent }} />
                      {PILLAR_LABELS[unit.pillar]} · <span className="font-medium text-slate-800">{unit.title}</span>
                    </p>
                  )}
                  <ol className="pl-2 [--zig:0.25] sm:pl-24 sm:[--zig:1]">
                    {unit.tasks.map((task) => (
                      <PathNode key={task.id} task={task} state={stateOf(task, plan, today)} index={nodeIndex++} />
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
