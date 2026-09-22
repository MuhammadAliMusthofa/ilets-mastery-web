"use client";

import Link from "next/link";
import { ArrowRight, Check, Route } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { ArrowLink } from "@/src/_global/components/Showcase/Showcase";
import { formatDay, localToday, taskHref } from "@/src/models/basic";
import { useBasicPlan } from "../hooks/useBasic";

/**
 * To-do Basic di beranda: tugas hari ini untuk path terjadwal, atau tiga
 * langkah berikutnya untuk path tanpa jadwal. Tidak tampil bila belum ada path.
 */
export function BasicTodayCard() {
  const { data: plan } = useBasicPlan();
  if (!plan || !plan.next_task) return null;

  const today = localToday();
  const scheduled = plan.mode === "SCHEDULED";
  const todays = plan.tasks.filter((task) => task.scheduled_date === today);
  const items = scheduled && todays.length > 0 ? todays : plan.tasks.filter((task) => task.status === "PENDING").slice(0, 3);
  const minutes = items.reduce((sum, task) => sum + task.estimated_minutes, 0);

  return (
    <section aria-labelledby="basic-today" className="rounded-4xl bg-[#d7f5e6] p-3 sm:p-4">
      <div className="rounded-3xl bg-white p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-[13px] text-slate-500">
              <Route size={14} aria-hidden="true" /> English Basic to Hero · {plan.stats.percent}% complete
            </p>
            <h2 id="basic-today" className="mt-1 font-display text-[24px] font-normal text-slate-900">
              {scheduled && todays.length > 0 ? `Today’s plan · ${minutes} min` : "Your next steps"}
            </h2>
          </div>
          <ArrowLink href="/basic">Open my path</ArrowLink>
        </div>
        <ul className="grid gap-2 md:grid-cols-3">
          {items.map((task) => {
            const done = task.status === "DONE";
            return (
              <li key={task.id}>
                <Link
                  href={taskHref(task)}
                  className={cn(
                    "flex h-full items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                    done ? "border-transparent bg-slate-50" : "border-slate-200 hover:border-slate-400"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full",
                      done ? "bg-[#00c875] text-white" : "border-2 border-slate-300"
                    )}
                    aria-hidden="true"
                  >
                    {done && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[15px]", done ? "text-slate-500 line-through" : "text-slate-900")}>
                      {task.title}
                    </span>
                    <span className="tabular block text-[12px] text-slate-500">
                      {task.estimated_minutes} min
                      {task.scheduled_date && task.scheduled_date !== today && ` · ${formatDay(task.scheduled_date)}`}
                    </span>
                  </span>
                  <ArrowRight size={15} className="text-slate-400" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
