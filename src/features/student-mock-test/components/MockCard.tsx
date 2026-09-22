"use client";

import Link from "next/link";
import { Clock3, ListChecks, Trophy } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { GuideStack } from "@/src/_global/components/Board/Board";
import { AppWindow, Canvas, Chip, PillLink } from "@/src/_global/components/Showcase/Showcase";
import { SKILL_COLOR, SKILL_TINT, STATUS_COLOR, type StatusTone } from "@/src/_global/design/tokens";
import { MOCK_ROUTES } from "../constants/routes";
import { SKILL_LABELS, type Skill, type StudentPackageSummary } from "@/src/models/ielts";

const FULL_TINT = "#f1e4fc";

export const mockStatusOf = (pkg: StudentPackageSummary): { tone: StatusTone; label: string } => {
  if (pkg.last_attempt?.status === "IN_PROGRESS") return { tone: "working", label: "In progress" };
  if (pkg.last_attempt?.status === "SUBMITTED") return { tone: "done", label: "Completed" };
  return { tone: "empty", label: "Not started" };
};

const bandsOf = (pkg: StudentPackageSummary) =>
  Object.entries(pkg.last_attempt?.band_scores ?? {}).filter(
    (entry): entry is [Skill, number] => typeof entry[1] === "number"
  );

function Metric({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Clock3;
  label: string;
  value: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 p-3">
      <span
        className="inline-flex h-5 items-center gap-1 rounded-[4px] px-1.5 text-[11px] font-medium leading-none"
        style={{ backgroundColor: color, color: "#323338" }}
      >
        <Icon size={11} aria-hidden="true" />
        {label}
      </span>
      <p className="tabular mt-2 font-display text-[22px] leading-none text-slate-900">{value}</p>
    </div>
  );
}

/**
 * Kartu paket ujian: kanvas pastel berisi "jendela aplikasi" pratinjau,
 * lalu judul, deskripsi, dan tombol pill hitam — pola kartu template monday.
 */
export function MockCard({ pkg, className }: { pkg: StudentPackageSummary; className?: string }) {
  const status = mockStatusOf(pkg);
  const bands = bandsOf(pkg);
  const tint = pkg.package_type === "FULL" ? FULL_TINT : SKILL_TINT[pkg.skills[0] ?? "READING"];
  const kind =
    pkg.package_type === "FULL" ? "Full test · 4 skills" : `${SKILL_LABELS[pkg.skills[0] ?? "READING"]} practice`;

  const action =
    status.tone === "done"
      ? { label: "View results", href: MOCK_ROUTES.result(pkg.id, pkg.last_attempt!.id) }
      : { label: status.tone === "working" ? "Resume" : "Start test", href: MOCK_ROUTES.detail(pkg.id) };

  const bestBand = bands.length > 0 ? Math.max(...bands.map(([, band]) => band)) : null;

  return (
    <Canvas as="article" tint={tint} className={cn("flex flex-col p-4 sm:p-5", className)}>
      <Link
        href={MOCK_ROUTES.detail(pkg.id)}
        className="block rounded-3xl transition-transform duration-300 ease-out hover:-translate-y-1"
        aria-hidden="true"
        tabIndex={-1}
      >
        <AppWindow
          title={kind}
          starred={status.tone === "done"}
          toolbar={<Chip color={STATUS_COLOR[status.tone]}>{status.label}</Chip>}
        >
          <div className="grid grid-cols-3 gap-2.5">
            <Metric icon={Clock3} label="Time" value={<>{pkg.duration_minutes}<span className="text-[13px] text-slate-500"> min</span></>} color="#cce5ff" />
            <Metric icon={ListChecks} label="Questions" value={pkg.total_marks} color="#d7f5e6" />
            <Metric
              icon={Trophy}
              label="Band"
              value={bestBand !== null ? bestBand.toFixed(1) : <span className="text-slate-300">—</span>}
              color="#ffe7c2"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {pkg.skills.map((skill) => {
                const band = bands.find(([key]) => key === skill)?.[1];
                return (
                  <Chip key={skill} color={SKILL_COLOR[skill]}>
                    {SKILL_LABELS[skill]}
                    {band !== undefined && <span className="tabular opacity-90">· {band.toFixed(1)}</span>}
                  </Chip>
                );
              })}
            </div>
            <GuideStack skills={pkg.skills} size={30} />
          </div>
        </AppWindow>
      </Link>

      <div className="flex flex-1 flex-col gap-4 px-2 pb-1 pt-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-[21px] font-normal leading-snug text-slate-900">
            <Link href={MOCK_ROUTES.detail(pkg.id)} className="hover:underline">
              {pkg.title}
            </Link>
          </h3>
          {pkg.description && (
            <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-slate-700">{pkg.description}</p>
          )}
        </div>
        <PillLink href={action.href} className="shrink-0 self-start sm:self-end">
          {action.label}
        </PillLink>
      </div>
    </Canvas>
  );
}

export function MockCardGrid({
  packages,
  emptyText,
  className,
}: {
  packages: StudentPackageSummary[];
  emptyText?: string;
  className?: string;
}) {
  if (packages.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-slate-300 px-6 py-10 text-center text-[15px] text-slate-500">
        {emptyText ?? "No tests yet."}
      </p>
    );
  }

  return (
    <div className={cn("grid gap-6 md:grid-cols-2", className)}>
      {packages.map((pkg) => (
        <MockCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}
