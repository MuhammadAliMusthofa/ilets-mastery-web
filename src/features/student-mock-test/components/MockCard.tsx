"use client";

import Link from "next/link";
import { Clock3, ListChecks, Trophy } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { AppWindow, Canvas, CharacterFigure, CharacterTile, Chip, PillLink } from "@/src/_global/components/Showcase/Showcase";
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

/**
 * Kartu paket ujian. Karakter kru pemandu jadi jangkarnya, jendela putih
 * memperlihatkan isi tesnya baris per baris (skill, dan band bila sudah
 * dikerjakan), lalu judul memimpin dengan huruf display. Seluruh kartu bisa
 * diklik lewat tautan judul yang melebar; tombol aksinya berdiri di atasnya.
 */
export function MockCard({ pkg, className }: { pkg: StudentPackageSummary; className?: string }) {
  const status = mockStatusOf(pkg);
  const bands = bandsOf(pkg);
  const hero = pkg.skills[0] ?? "READING";
  const tint = pkg.package_type === "FULL" ? FULL_TINT : SKILL_TINT[hero];
  const kind = pkg.package_type === "FULL" ? "Full test · 4 skills" : `${SKILL_LABELS[hero]} section`;
  const single = pkg.skills.length === 1;
  const attempted = pkg.last_attempt?.status === "SUBMITTED";

  const action =
    status.tone === "done"
      ? { label: "View results", href: MOCK_ROUTES.result(pkg.id, pkg.last_attempt!.id) }
      : { label: status.tone === "working" ? "Resume" : "Start test", href: MOCK_ROUTES.detail(pkg.id) };

  const bestBand = bands.length > 0 ? Math.max(...bands.map(([, band]) => band)) : null;

  return (
    <Canvas
      as="article"
      tint={tint}
      className={cn("group relative flex flex-col p-4 sm:p-5", className)}
    >
      {/* Pemandu skill utama, seperti di beranda: setengah badan di tepi kanan. */}
      <CharacterFigure
        skill={hero}
        sizes="260px"
        className="absolute -bottom-1 right-1 hidden h-[58%] w-[32%] transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1.5 sm:block"
      />

      <AppWindow
        title={kind}
        toolbar={<Chip color={STATUS_COLOR[status.tone]}>{status.label}</Chip>}
        bodyClassName="p-0"
        className="relative transition-transform duration-300 ease-out motion-safe:group-hover:-translate-y-1 sm:w-[64%]"
      >
        <ul className="divide-y divide-slate-100">
          {pkg.skills.map((skill) => {
            const band = bands.find(([key]) => key === skill)?.[1];
            return (
              <li key={skill} className="flex items-center gap-2.5 px-4 py-2.5">
                <CharacterTile skill={skill} size={26} className="rounded-lg" />
                <span className="min-w-0 flex-1 truncate text-[14px] text-slate-800">{SKILL_LABELS[skill]}</span>
                {band !== undefined ? (
                  <span className="tabular text-[15px] font-medium text-slate-900">{band.toFixed(1)}</span>
                ) : attempted ? (
                  // Writing & Speaking dinilai sendiri oleh siswa, jadi belum ada band di sini.
                  <span className="text-[13px] text-slate-500">self-scored</span>
                ) : (
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: SKILL_COLOR[skill].bg }}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-4 py-3 text-[13px] text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={13} aria-hidden="true" />
            <span className="tabular font-medium text-slate-900">{pkg.duration_minutes}</span> min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks size={13} aria-hidden="true" />
            <span className="tabular font-medium text-slate-900">{pkg.total_marks}</span>
            {single && pkg.skills[0] === "WRITING" ? " tasks" : " questions"}
          </span>
          {bestBand !== null && (
            <span className="ml-auto inline-flex items-center gap-1.5">
              <Trophy size={13} aria-hidden="true" />
              Best <span className="tabular font-medium text-slate-900">{bestBand.toFixed(1)}</span>
            </span>
          )}
        </div>
      </AppWindow>

      <div className="relative mt-6 flex flex-col gap-4 px-1 pb-1 sm:w-[64%]">
        <div className="min-w-0">
          <h3 className="font-display text-[24px] font-normal leading-[1.15] tracking-[-0.01em] text-slate-900">
            {/* Tautan melebar: seluruh kartu jadi satu sasaran klik. */}
            <Link
              href={MOCK_ROUTES.detail(pkg.id)}
              className="rounded-sm after:absolute after:inset-0 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
            >
              {pkg.title}
            </Link>
          </h3>
          {pkg.description && (
            <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-slate-700">{pkg.description}</p>
          )}
        </div>
        <PillLink href={action.href} className="relative z-10 self-start">
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
