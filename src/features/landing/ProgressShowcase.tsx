"use client";

import { BarChart, GanttChart, GaugeChart, RadarChart, TrendChart } from "@/src/_global/components/Charts/Charts";
import { BAND_SEGMENTS, LEVEL_SEGMENTS } from "@/src/_global/design/levels";
import { SKILL_COLOR } from "@/src/_global/design/tokens";

/*
 * Bento chart di landing: memperlihatkan seperti apa progres ditampilkan di
 * dalam aplikasi. Angkanya contoh, dan hal itu disebut terang-terangan.
 */

const RADAR = [
  { label: "Listening", value: 6.5, color: SKILL_COLOR.LISTENING.bg },
  { label: "Reading", value: 6, color: SKILL_COLOR.READING.bg },
  { label: "Writing", value: 5.5, color: SKILL_COLOR.WRITING.bg },
  { label: "Speaking", value: 6, color: SKILL_COLOR.SPEAKING.bg },
];

const TREND = [
  { label: "Mock 1", value: 5 },
  { label: "Mock 2", value: 5.5 },
  { label: "Mock 3", value: 5.5 },
  { label: "Mock 4", value: 6 },
  { label: "Mock 5", value: 6.5 },
];

const BARS = [
  { label: "Listening", value: 6.5, color: SKILL_COLOR.LISTENING.bg },
  { label: "Reading", value: 6, color: SKILL_COLOR.READING.bg },
  { label: "Writing", value: 5.5, color: SKILL_COLOR.WRITING.bg },
  { label: "Speaking", value: 6, color: SKILL_COLOR.SPEAKING.bg },
];

const PLAN = [
  { label: "Tense foundations", start: 0, length: 2, color: "#00c875", done: 1 },
  { label: "Listening S1–S2", start: 1, length: 3, color: SKILL_COLOR.LISTENING.bg, done: 0.8 },
  { label: "Reading GT", start: 2, length: 3, color: SKILL_COLOR.READING.bg, done: 0.4 },
  { label: "Letter writing", start: 3, length: 2, color: SKILL_COLOR.WRITING.bg, done: 0.1 },
  { label: "Speaking cue card", start: 4, length: 3, color: SKILL_COLOR.SPEAKING.bg },
  { label: "Full mock test", start: 6, length: 2, color: "#323338" },
];

function Tile({ title, note, tint, className, children }: { title: string; note: string; tint: string; className?: string; children: React.ReactNode }) {
  return (
    <article data-reveal className={`rounded-4xl p-3 sm:p-4 ${className ?? ""}`} style={{ backgroundColor: tint }}>
      <div className="h-full rounded-3xl bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-[19px] font-normal text-slate-900">{title}</h3>
          <p className="text-[13px] text-slate-500">{note}</p>
        </div>
        {children}
      </div>
    </article>
  );
}

export function ProgressShowcase() {
  return (
    <div className="grid gap-5 lg:grid-cols-12 [&>*]:min-w-0">
      <Tile title="Current IELTS band" note="CEFR B2 equivalent" tint="#fff0d4" className="lg:col-span-6">
        <div className="flex justify-center">
          <GaugeChart value={6} segments={BAND_SEGMENTS} caption="Average of the latest band per skill" label="Sample current IELTS band" />
        </div>
      </Tile>
      <Tile title="English level" note="Basic to Hero track" tint="#fbe1e8" className="lg:col-span-6">
        <div className="flex justify-center">
          <GaugeChart
            value={6}
            segments={LEVEL_SEGMENTS}
            display="Intermediate"
            caption="Estimated from your band"
            label="Sample English level"
          />
        </div>
      </Tile>
      <Tile title="Skill map" note="Dashed line: target 7.0" tint="#e1ecff" className="lg:col-span-5">
        <div className="flex justify-center">
          <RadarChart axes={RADAR} target={7} label="Sample band map per skill" />
        </div>
      </Tile>
      <Tile title="Band trend across mock tests" note="Overall, 5 mock tests" tint="#f1e4fc" className="lg:col-span-7">
        <TrendChart points={TREND} target={7} label="Sample overall band trend" />
        <div className="mt-6 border-t border-slate-100 pt-5">
          <BarChart bars={BARS} target={7} height={150} label="Sample latest band per skill" />
        </div>
      </Tile>
      <Tile title="8-week study plan" note="Solid part: already done" tint="#d7f5e6" className="lg:col-span-12">
        <GanttChart rows={PLAN} weeks={8} today={3.4} label="Sample eight-week study plan" />
      </Tile>
    </div>
  );
}
