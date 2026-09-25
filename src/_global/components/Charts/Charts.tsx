"use client";

import React, { useRef } from "react";
import { cn } from "@/src/libs/utils";
import { gsap, useGSAP, prefersReducedMotion } from "@/src/_global/motion/gsap";

/*
 * Chart SVG buatan sendiri, bukan pustaka: warna label monday, huruf Figtree,
 * dan animasi masuk GSAP saat chart terlihat di layar. Setiap chart punya
 * role="img" dan ringkasan teks untuk pembaca layar.
 */

/**
 * Jalankan animasi masuk sekali saat chart terlihat. Memakai IntersectionObserver,
 * bukan ScrollTrigger: chart yang sudah terlihat saat pertama dirender (mis. setelah
 * data selesai dimuat) tetap teranimasi tanpa perlu scroll.
 */
function useReveal(scope: React.RefObject<HTMLElement | SVGSVGElement | null>, build: (tl: gsap.core.Timeline) => void) {
  useGSAP(
    () => {
      const element = scope.current;
      if (prefersReducedMotion() || !element) return;
      const tl = gsap.timeline({ paused: true });
      build(tl);
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            tl.play();
            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(element);
      return () => observer.disconnect();
    },
    { scope }
  );
}

const fmt = (value: number) => value.toFixed(1);

// ---------------------------------------------------------------------------
// Radar
// ---------------------------------------------------------------------------

export interface RadarAxis {
  label: string;
  value: number | null;
  color: string;
}

export function RadarChart({
  axes,
  max = 9,
  target,
  size = 320,
  className,
  label,
}: {
  axes: RadarAxis[];
  max?: number;
  target?: number | null;
  size?: number;
  className?: string;
  label: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const c = size / 2;
  const r = size / 2 - 46;
  const angle = (i: number) => (Math.PI * 2 * i) / axes.length - Math.PI / 2;
  const point = (i: number, v: number) => [c + Math.cos(angle(i)) * (r * v) / max, c + Math.sin(angle(i)) * (r * v) / max];
  const polygon = (values: number[]) => values.map((v, i) => point(i, v).join(",")).join(" ");

  const values = axes.map((axis) => axis.value ?? 0);

  useReveal(ref, (tl) => {
    tl.from(".radar-ring", { scale: 0, transformOrigin: `${c}px ${c}px`, duration: 0.6, stagger: 0.06, ease: "power2.out" })
      .from(".radar-shape", { scale: 0, transformOrigin: `${c}px ${c}px`, duration: 0.9, ease: "back.out(1.4)" }, "-=0.2")
      .from(".radar-dot", { scale: 0, transformOrigin: "center", transformBox: "fill-box", duration: 0.4, stagger: 0.08 }, "-=0.4")
      .from(".radar-label", { opacity: 0, y: 6, duration: 0.4, stagger: 0.06 }, "-=0.5");
  });

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${label}: ${axes.map((a) => `${a.label} ${a.value !== null ? fmt(a.value) : "no data"}`).join(", ")}`}
      className={cn("h-auto w-full max-w-[380px] overflow-visible", className)}
    >
      {[3, 5, 7, 9].map((ring) => (
        <polygon
          key={ring}
          className="radar-ring"
          points={polygon(axes.map(() => ring))}
          fill={ring === 9 ? "#f6f7fb" : "none"}
          stroke="#d0d4e4"
          strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, max);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#d0d4e4" strokeWidth={1} />;
      })}

      {target ? (
        <polygon
          className="radar-ring"
          points={polygon(axes.map(() => target))}
          fill="none"
          stroke="#323338"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      ) : null}

      <polygon
        className="radar-shape"
        points={polygon(values)}
        fill="rgb(0 115 234 / 0.18)"
        stroke="#0073ea"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {axes.map((axis, i) => {
        const [x, y] = point(i, values[i]);
        return (
          <circle key={axis.label} className="radar-dot" cx={x} cy={y} r={6} fill={axis.color} stroke="#ffffff" strokeWidth={2.5} />
        );
      })}

      {axes.map((axis, i) => {
        const [x, y] = point(i, max + 1.6);
        return (
          <g key={axis.label} className="radar-label">
            <text x={x} y={y - 4} textAnchor="middle" className="fill-slate-800 text-[13px] font-medium">
              {axis.label}
            </text>
            <text x={x} y={y + 13} textAnchor="middle" className="tabular fill-slate-500 text-[12px]">
              {axis.value !== null ? fmt(axis.value) : "—"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Bar
// ---------------------------------------------------------------------------

export interface BarDatum {
  label: string;
  value: number;
  color: string;
  /** Teks kecil di bawah label, mis. tanggal. */
  sub?: string;
}

export function BarChart({
  bars,
  max = 9,
  target,
  height = 240,
  className,
  label,
}: {
  bars: BarDatum[];
  max?: number;
  target?: number | null;
  height?: number;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useReveal(ref, (tl) => {
    tl.from(".bar-fill", { scaleY: 0, transformOrigin: "bottom", duration: 0.9, stagger: 0.08, ease: "power3.out" }).from(
      ".bar-value",
      { opacity: 0, y: 8, duration: 0.4, stagger: 0.08 },
      "-=0.6"
    );
  });

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${label}: ${bars.map((b) => `${b.label} ${fmt(b.value)}`).join(", ")}`}
      className={cn("w-full", className)}
    >
      <div className={cn("relative flex items-end gap-3 border-b border-slate-200 sm:gap-5", target && "pr-[72px]")} style={{ height }}>
        {[3, 6, 9].map((line) => (
          <span
            key={line}
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-100"
            style={{ bottom: `${(line / max) * 100}%` }}
            aria-hidden="true"
          >
            <span className="tabular absolute -top-2.5 right-full mr-2 text-[11px] text-slate-400">{line}</span>
          </span>
        ))}
        {target ? (
          <span
            className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-slate-900"
            style={{ bottom: `${(target / max) * 100}%` }}
            aria-hidden="true"
          >
            <span className="absolute right-0 top-0 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-white">
              Target {fmt(target)}
            </span>
          </span>
        ) : null}

        {bars.map((bar) => (
          <div key={bar.label + (bar.sub ?? "")} className="relative flex h-full flex-1 flex-col justify-end">
            <span
              className="bar-fill block rounded-t-xl"
              style={{ height: `${(bar.value / max) * 100}%`, backgroundColor: bar.color }}
            />
          </div>
        ))}
      </div>
      <div className={cn("mt-2 flex gap-3 sm:gap-5", target && "pr-[72px]")} aria-hidden="true">
        {bars.map((bar) => (
          <div key={bar.label + (bar.sub ?? "")} className="min-w-0 flex-1 text-center">
            {/* Nilai di bawah batang, bukan di atasnya: tidak pernah tertimpa garis target. */}
            <p className="bar-value tabular font-display text-[15px] leading-tight text-slate-900">{fmt(bar.value)}</p>
            <p className="truncate text-[12px] text-slate-700">{bar.label}</p>
            {bar.sub && <p className="truncate text-[11px] text-slate-500">{bar.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gantt
// ---------------------------------------------------------------------------

export interface GanttRow {
  label: string;
  /** Minggu mulai (0-based) dan panjangnya dalam minggu. */
  start: number;
  length: number;
  color: string;
  /** Porsi selesai 0–1, digambar sebagai bagian yang lebih pekat. */
  done?: number;
  group?: string;
}

export function GanttChart({
  rows,
  weeks,
  today,
  className,
  label,
}: {
  rows: GanttRow[];
  weeks: number;
  /** Posisi hari ini dalam satuan minggu (boleh pecahan). */
  today?: number;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useReveal(ref, (tl) => {
    tl.from(".gantt-row", { opacity: 0, x: -12, duration: 0.4, stagger: 0.05 })
      .from(".gantt-bar", { scaleX: 0, transformOrigin: "left", duration: 0.8, stagger: 0.07, ease: "power3.out" }, "-=0.3")
      .from(".gantt-today", { scaleY: 0, transformOrigin: "top", duration: 0.5 }, "-=0.2");
  });

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${label}: ${rows.map((r) => `${r.label} week ${r.start + 1} to ${r.start + r.length}`).join("; ")}`}
      className={cn("w-full overflow-x-auto", className)}
    >
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[140px_1fr] items-end gap-3 pb-2 sm:grid-cols-[180px_1fr]" aria-hidden="true">
          <span />
          <div className="grid" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}>
            {Array.from({ length: weeks }, (_, i) => (
              <span key={i} className="tabular text-center text-[11px] text-slate-500">
                W{i + 1}
              </span>
            ))}
          </div>
        </div>

        <div className="relative space-y-2" aria-hidden="true">
          {rows.map((row, index) => (
            <div key={row.label + index} className="gantt-row grid grid-cols-[140px_1fr] items-center gap-3 sm:grid-cols-[180px_1fr]">
              <span className="truncate text-[13px] text-slate-800">{row.label}</span>
              <div
                className="relative h-9 rounded-lg bg-slate-50"
                style={{
                  backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(${100 / weeks}% - 1px), #ecedf5 calc(${100 / weeks}% - 1px), #ecedf5 ${100 / weeks}%)`,
                }}
              >
                <span
                  className="gantt-bar absolute inset-y-1.5 overflow-hidden rounded-full"
                  style={{
                    left: `${(row.start / weeks) * 100}%`,
                    width: `${(row.length / weeks) * 100}%`,
                    backgroundColor: `color-mix(in srgb, ${row.color} 35%, white)`,
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${(row.done ?? 0) * 100}%`, backgroundColor: row.color }}
                  />
                </span>
              </div>
            </div>
          ))}

          {today !== undefined && (
            <span
              className="gantt-today pointer-events-none absolute -top-1 bottom-0 grid grid-cols-[140px_1fr] gap-3 sm:grid-cols-[180px_1fr]"
              style={{ left: 0, right: 0 }}
            >
              <span />
              <span className="relative">
                <span
                  className="absolute inset-y-0 w-0.5 rounded-full bg-slate-900"
                  style={{ left: `${(today / weeks) * 100}%` }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-white">
                    Today
                  </span>
                </span>
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tren (garis)
// ---------------------------------------------------------------------------

export function TrendChart({
  points,
  max = 9,
  min = 3,
  target,
  height = 200,
  className,
  label,
}: {
  points: Array<{ label: string; value: number }>;
  max?: number;
  min?: number;
  target?: number | null;
  height?: number;
  className?: string;
  label: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const width = 520;
  const pad = { x: 28, y: 18 };
  const x = (i: number) => pad.x + (i * (width - pad.x * 2)) / Math.max(points.length - 1, 1);
  const y = (v: number) => pad.y + ((max - v) * (height - pad.y * 2)) / (max - min);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${height - pad.y} L${x(0)},${height - pad.y} Z`;

  useReveal(ref, (tl) => {
    const path = ref.current?.querySelector<SVGPathElement>(".trend-line");
    const length = path?.getTotalLength() ?? 0;
    tl.fromTo(".trend-line", { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" })
      .from(".trend-area", { opacity: 0, duration: 0.8 }, "-=0.8")
      .from(".trend-dot", { scale: 0, transformOrigin: "center", transformBox: "fill-box", stagger: 0.1, duration: 0.35 }, "-=1");
  });

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height + 22}`}
      role="img"
      aria-label={`${label}: ${points.map((p) => `${p.label} ${fmt(p.value)}`).join(", ")}`}
      className={cn("h-auto w-full overflow-visible", className)}
    >
      <defs>
        <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0073ea" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0073ea" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[4, 6, 8].map((v) => (
        <g key={v}>
          <line x1={pad.x} x2={width - pad.x} y1={y(v)} y2={y(v)} stroke="#ecedf5" />
          <text x={4} y={y(v) + 4} className="tabular fill-slate-400 text-[11px]">
            {v}
          </text>
        </g>
      ))}
      {target ? (
        <line x1={pad.x} x2={width - pad.x} y1={y(target)} y2={y(target)} stroke="#323338" strokeWidth={1.5} strokeDasharray="5 5" />
      ) : null}
      <path className="trend-area" d={area} fill="url(#trend-fill)" />
      <path className="trend-line" d={line} fill="none" stroke="#0073ea" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle className="trend-dot" cx={x(i)} cy={y(p.value)} r={5.5} fill="#ffffff" stroke="#0073ea" strokeWidth={3} />
          <text x={x(i)} y={height + 16} textAnchor="middle" className="fill-slate-500 text-[11px]">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Gauge
// ---------------------------------------------------------------------------

export interface GaugeSegment {
  from: number;
  to: number;
  color: string;
  label: string;
}

/**
 * Gauge setengah lingkaran: pita berwarna per rentang, jarum menunjuk nilai
 * saat ini. Jarum berayun masuk dan angka menghitung naik saat terlihat.
 */
export function GaugeChart({
  value,
  min = 0,
  max = 9,
  segments,
  display,
  caption,
  label,
  className,
}: {
  value: number | null;
  min?: number;
  max?: number;
  segments: GaugeSegment[];
  /** Teks besar di tengah; bawaan: nilai satu desimal. */
  display?: string;
  caption?: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const numberRef = useRef<SVGTextElement>(null);
  const width = 320;
  const cx = width / 2;
  const cy = 170;
  const r = 128;
  const stroke = 26;

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const angleOf = (v: number) => 180 - ((clamp(v) - min) / (max - min)) * 180;
  const polar = (radius: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy - radius * Math.sin(rad)];
  };
  const arc = (from: number, to: number) => {
    // Celah kecil antarsegmen supaya pita terbaca sebagai rentang terpisah.
    const a1 = angleOf(from) - 0.8;
    const a2 = angleOf(to) + 0.8;
    const [x1, y1] = polar(r, a1);
    const [x2, y2] = polar(r, a2);
    return `M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`;
  };

  const rotation = value !== null ? ((clamp(value) - min) / (max - min)) * 180 : 0;
  const active = value !== null ? segments.find((s) => value >= s.from && value <= s.to) : undefined;
  const text = display ?? (value !== null ? value.toFixed(1) : "—");

  useReveal(ref, (tl) => {
    if (value === null) {
      tl.from(".gauge-seg", { opacity: 0, duration: 0.5, stagger: 0.08 });
      return;
    }
    const counter = { v: min };
    tl.from(".gauge-seg", { opacity: 0, duration: 0.4, stagger: 0.07 })
      .fromTo(
        ".gauge-needle",
        { rotation: 0, svgOrigin: `${cx} ${cy}` },
        { rotation, svgOrigin: `${cx} ${cy}`, duration: 1.6, ease: "elastic.out(1, 0.55)" },
        "-=0.2"
      )
      .to(
        counter,
        {
          v: value,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            if (numberRef.current && display === undefined) numberRef.current.textContent = counter.v.toFixed(1);
          },
        },
        "<"
      );
  });

  const [needleX, needleY] = polar(r - stroke / 2 - 14, 180);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} 250`}
      role="img"
      aria-label={`${label}: ${value !== null ? `${text}${active ? `, range ${active.label}` : ""}` : "no data yet"}`}
      className={cn("h-auto w-full max-w-[340px] overflow-visible", className)}
    >
      {segments.map((segment) => (
        <path
          key={segment.label}
          className="gauge-seg"
          d={arc(segment.from, segment.to)}
          fill="none"
          stroke={segment.color}
          strokeWidth={stroke}
          opacity={value === null || segment === active ? 1 : 0.35}
        />
      ))}

      {segments.map((segment) => {
        const [x, y] = polar(r + stroke / 2 + 10, angleOf((segment.from + segment.to) / 2));
        // Label di sisi kiri rata kanan, sisi kanan rata kiri, supaya tidak menabrak pita.
        const anchor = x < cx - 12 ? "end" : x > cx + 12 ? "start" : "middle";
        return (
          <text
            key={segment.label}
            x={x}
            y={y + 4}
            textAnchor={anchor}
            className={cn("text-[11px]", segment === active ? "fill-slate-900 font-semibold" : "fill-slate-500")}
          >
            {segment.label}
          </text>
        );
      })}

      {value !== null && (
        <g className="gauge-needle" transform={`rotate(${rotation} ${cx} ${cy})`}>
          <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#181b34" strokeWidth={5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={11} fill="#181b34" />
          <circle cx={cx} cy={cy} r={4} fill="#ffffff" />
        </g>
      )}

      <text
        ref={numberRef}
        x={cx}
        y={cy + 50}
        textAnchor="middle"
        className={cn("tabular font-display", display ? "text-[24px]" : "text-[40px]", value === null ? "fill-slate-400" : "fill-slate-900")}
      >
        {text}
      </text>
      {caption && (
        <text x={cx} y={cy + 74} textAnchor="middle" className="fill-slate-500 text-[12px]">
          {caption}
        </text>
      )}
    </svg>
  );
}
