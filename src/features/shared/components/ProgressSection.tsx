"use client";

import { useMemo } from "react";
import { BarChart, GanttChart, GaugeChart, RadarChart, TrendChart, type GanttRow } from "@/src/_global/components/Charts/Charts";
import { BAND_SEGMENTS, LEVEL_SEGMENTS, overallBand, segmentFor } from "@/src/_global/design/levels";
import { PillLink, SectionTitle } from "@/src/_global/components/Showcase/Showcase";
import { SKILL_COLOR } from "@/src/_global/design/tokens";
import { MOCK_ROUTES } from "@/src/features/student-mock-test/constants/routes";
import { SKILLS, SKILL_LABELS, type Skill, type StudentPackageSummary } from "@/src/models/ielts";

/*
 * Progres belajar dari data asli: band terakhir tiap paket yang sudah
 * dikumpulkan. Rencana gantt disusun dari aturan sederhana — skill dengan
 * band terendah dilatih lebih dulu — dan disebut sebagai saran.
 */


interface Submitted {
  pkg: StudentPackageSummary;
  at: string;
  bands: Array<[Skill, number]>;
}

function collect(packages: StudentPackageSummary[]): Submitted[] {
  return packages
    .filter((pkg) => pkg.last_attempt?.status === "SUBMITTED" && pkg.last_attempt.submitted_at)
    .map((pkg) => ({
      pkg,
      at: pkg.last_attempt!.submitted_at!,
      bands: Object.entries(pkg.last_attempt!.band_scores ?? {}).filter(
        (entry): entry is [Skill, number] => typeof entry[1] === "number"
      ),
    }))
    .filter((item) => item.bands.length > 0)
    .sort((a, b) => (a.at > b.at ? 1 : -1));
}

function Tile({ title, note, tint, className, children }: { title: string; note?: string; tint: string; className?: string; children: React.ReactNode }) {
  return (
    <article className={`rounded-4xl p-3 sm:p-4 ${className ?? ""}`} style={{ backgroundColor: tint }}>
      <div className="h-full rounded-3xl bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-[19px] font-normal text-slate-900">{title}</h3>
          {note && <p className="text-[13px] text-slate-500">{note}</p>}
        </div>
        {children}
      </div>
    </article>
  );
}

/** Dua gauge: band IELTS saat ini dan level bahasa Inggris yang diturunkan darinya. */
function GaugeRow({ latest }: { latest: Partial<Record<Skill, number>> }) {
  const scored = Object.values(latest).filter((band): band is number => typeof band === "number");
  const band = overallBand(scored);
  const cefr = segmentFor(BAND_SEGMENTS, band);
  const level = segmentFor(LEVEL_SEGMENTS, band);

  return (
    <div className="grid gap-5 md:grid-cols-2 [&>*]:min-w-0">
      <Tile title="Current IELTS band" note="Average of your latest band per skill" tint="#e1ecff">
        <div className="flex justify-center">
          <GaugeChart
            value={band}
            segments={BAND_SEGMENTS}
            caption={
              band !== null
                ? `CEFR ${cefr?.label ?? "—"} equivalent · ${scored.length} of 4 skills scored`
                : "Take a mock test to fill this gauge"
            }
            label="Current IELTS band"
          />
        </div>
      </Tile>
      <Tile title="English level" note="Estimated from your band until a placement test is available" tint="#d7f5e6">
        <div className="flex justify-center">
          <GaugeChart
            value={band}
            segments={LEVEL_SEGMENTS}
            display={level?.label ?? "—"}
            caption={band !== null ? "Matching Basic to Hero level" : "No data yet"}
            label="Current English level"
          />
        </div>
      </Tile>
    </div>
  );
}

export function ProgressSection({ packages }: { packages: StudentPackageSummary[] }) {
  const submitted = useMemo(() => collect(packages), [packages]);

  // Band terbaru per skill (paket terakhir yang memuat skill itu).
  const latest = useMemo(() => {
    const map: Partial<Record<Skill, number>> = {};
    submitted.forEach((item) => item.bands.forEach(([skill, band]) => (map[skill] = band)));
    return map;
  }, [submitted]);

  const plan = useMemo<GanttRow[]>(() => {
    // Skill tanpa nilai dianggap paling perlu dilatih.
    const order = [...SKILLS].sort((a, b) => (latest[a] ?? 0) - (latest[b] ?? 0));
    const rows: GanttRow[] = order.map((skill, index) => ({
      label: `${SKILL_LABELS[skill]}${latest[skill] !== undefined ? ` · ${latest[skill]!.toFixed(1)}` : ""}`,
      start: index * 1.5,
      length: 3,
      color: SKILL_COLOR[skill].bg,
    }));
    rows.push({ label: "Full mock test", start: 6.5, length: 1.5, color: "#323338" });
    return rows;
  }, [latest]);

  const header = (
    <SectionTitle
      id="progress"
      title="Learning progress"
      description="Calculated from the mock tests you've submitted. Listening and Reading bands are estimates."
    />
  );

  if (submitted.length === 0) {
    return (
      <section aria-labelledby="progress">
        {header}
        <GaugeRow latest={{}} />
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
          <Tile title="Skill map" tint="#e1ecff">
            <div className="flex justify-center opacity-60">
              <RadarChart
                axes={SKILLS.map((skill) => ({ label: SKILL_LABELS[skill], value: null, color: SKILL_COLOR[skill].bg }))}
                label="Empty skill map"
              />
            </div>
          </Tile>
          <div className="flex flex-col justify-center rounded-4xl bg-slate-50 p-8 sm:p-10">
            <p className="font-display text-[26px] leading-tight text-slate-900">Nothing to chart yet</p>
            <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-slate-700">
              Take one mock test. Once you submit it, your skill map, band trend and suggested practice order will
              appear here.
            </p>
            <PillLink href={MOCK_ROUTES.list} className="mt-7 self-start">
              Choose a mock test
            </PillLink>
          </div>
        </div>
      </section>
    );
  }

  const trend = submitted.map((item, index) => ({
    label: `Test ${index + 1}`,
    value: overallBand(item.bands.map(([, band]) => band)) ?? 0,
  }));

  const bars = submitted.flatMap((item) =>
    item.bands.map(([skill, band]) => ({
      label: SKILL_LABELS[skill],
      sub: new Date(item.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      value: band,
      color: SKILL_COLOR[skill].bg,
    }))
  );

  return (
    <section aria-labelledby="progress">
      {header}
      <GaugeRow latest={latest} />
      <div className="mt-5 grid gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <Tile title="Skill map" note="Latest band per skill" tint="#e1ecff" className="lg:col-span-5">
          <div className="flex justify-center">
            <RadarChart
              axes={SKILLS.map((skill) => ({ label: SKILL_LABELS[skill], value: latest[skill] ?? null, color: SKILL_COLOR[skill].bg }))}
              label="Band map per skill"
            />
          </div>
        </Tile>

        <Tile
          title={trend.length > 1 ? "Band trend" : "Band per test"}
          note={`${submitted.length} test${submitted.length === 1 ? "" : "s"} submitted`}
          tint="#f1e4fc"
          className="lg:col-span-7"
        >
          {trend.length > 1 && <TrendChart points={trend} label="Band trend from test to test" />}
          <div className={trend.length > 1 ? "mt-6 border-t border-slate-100 pt-5" : ""}>
            <BarChart bars={bars.slice(-8)} height={trend.length > 1 ? 150 : 220} label="Band per skill per test" />
          </div>
        </Tile>

        <Tile
          title="Suggested 8-week practice order"
          note="Lowest-band skills come first"
          tint="#d7f5e6"
          className="lg:col-span-12"
        >
          <GanttChart rows={plan} weeks={8} today={0.3} label="Suggested eight-week practice order" />
        </Tile>
      </div>
    </section>
  );
}
