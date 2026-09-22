"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { buttonVariants } from "@/components/ui/button";
import { SKILL_COLOR, SKILL_GUIDE, type LabelColor } from "@/src/_global/design/tokens";

/*
 * Komponen sisi siswa, meminjam bahasa halaman marketing monday.com:
 * kanvas pastel bersudut besar, "jendela aplikasi" putih di dalamnya,
 * tombol pill hitam, tab pill di atas lintasan abu-abu, dan karakter kru.
 * Tabel board tetap milik admin.
 */

type Skill = keyof typeof SKILL_GUIDE;

// ---------------------------------------------------------------------------
// Tautan berbentuk tombol pill
// ---------------------------------------------------------------------------

export function PillLink({
  href,
  variant = "dark",
  size = "default",
  arrow = true,
  className,
  children,
}: {
  href: string;
  variant?: "dark" | "outline" | "default";
  size?: "sm" | "default" | "lg";
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size, shape: "pill" }), "group/pill", className)}>
      {children}
      {arrow && <ArrowRight size={16} className="transition-transform duration-200 group-hover/pill:translate-x-0.5" />}
    </Link>
  );
}

/** Tautan teks bergaris bawah dengan panah, seperti "Get Started →" di monday. */
export function ArrowLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group/arrow inline-flex items-center gap-1.5 border-b border-slate-800 pb-0.5 text-[15px] font-medium text-slate-800 hover:border-primary-500 hover:text-primary-500",
        className
      )}
    >
      {children}
      <ArrowRight size={16} className="transition-transform duration-200 group-hover/arrow:translate-x-0.5" />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Tab pill
// ---------------------------------------------------------------------------

export interface PillTab<T extends string> {
  id: T;
  label: string;
  /** Titik warna di depan label. */
  dot?: string;
  count?: number;
}

export function PillTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  className,
}: {
  tabs: PillTab<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-slate-100 p-1.5", className)}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-[15px] transition-colors duration-200",
              active ? "bg-[#b9e3ff] font-medium text-slate-900" : "text-slate-700 hover:bg-white/70"
            )}
          >
            {tab.dot && <span className="size-2.5 rounded-full" style={{ backgroundColor: tab.dot }} aria-hidden="true" />}
            {tab.label}
            {tab.count !== undefined && <span className="tabular text-[13px] text-slate-500">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanvas & jendela aplikasi
// ---------------------------------------------------------------------------

/** Panel pastel bersudut 32px — wadah utama sebuah cerita di halaman. */
export function Canvas({
  tint,
  className,
  children,
  as: Tag = "section",
  ...rest
}: {
  tint: string;
  className?: string;
  children: React.ReactNode;
  as?: "section" | "div" | "article";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn("relative overflow-hidden rounded-4xl", className)} style={{ backgroundColor: tint }} {...rest}>
      {children}
    </Tag>
  );
}

/** Jendela putih di dalam kanvas, lengkap dengan bilah judul bergaya aplikasi. */
export function AppWindow({
  title,
  starred,
  toolbar,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  starred?: boolean;
  toolbar?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgb(24_27_52/0.06),0_8px_24px_-12px_rgb(24_27_52/0.18)]", className)}>
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
        <span className="truncate font-display text-[16px] text-slate-800">{title}</span>
        {starred !== undefined && (
          <Star size={15} className={starred ? "fill-[#fdab3d] text-[#fdab3d]" : "text-slate-400"} aria-hidden="true" />
        )}
        {toolbar && <div className="ml-auto flex items-center gap-1.5">{toolbar}</div>}
      </div>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Label kecil
// ---------------------------------------------------------------------------

/** Chip berwarna penuh, seperti label "Stuck" / "Engineering" di pratinjau monday. */
export function Chip({ color, children, className }: { color: LabelColor; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[12px] font-medium leading-none", className)}
      style={{ backgroundColor: color.bg, color: color.fg }}
    >
      {children}
    </span>
  );
}

/** Chip lembut: teks tinta di atas warna muda, dengan titik warna. */
export function SoftChip({ dot, children, className }: { dot: string; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[13px] text-slate-700",
        className
      )}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: dot }} aria-hidden="true" />
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Karakter kru
// ---------------------------------------------------------------------------

/** Ilustrasi karakter penuh yang "duduk" di tepi bawah kanvas. */
export function CharacterFigure({
  skill,
  className,
  priority,
  sizes = "320px",
}: {
  skill: Skill;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const guide = SKILL_GUIDE[skill];
  return (
    <div
      className={cn(
        // Tepi kiri-kanan dipudarkan: beberapa ilustrasi berupa potongan persegi.
        "pointer-events-none relative select-none [mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]",
        className
      )}
    >
      <Image src={guide.src} alt="" fill priority={priority} sizes={sizes} className="object-contain object-bottom" />
    </div>
  );
}

/** Avatar karakter persegi membulat, seperti ikon use case di mega menu monday. */
export function CharacterTile({ skill, size = 44, className }: { skill: Skill; size?: number; className?: string }) {
  const guide = SKILL_GUIDE[skill];
  return (
    <span
      className={cn("relative inline-block shrink-0 overflow-hidden rounded-xl", className)}
      style={{ width: size, height: size, backgroundColor: SKILL_COLOR[skill].bg }}
      aria-hidden="true"
    >
      <Image src={guide.src} alt="" fill sizes={`${size * 2}px`} className="object-cover object-top" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Judul bagian
// ---------------------------------------------------------------------------

export function SectionTitle({
  title,
  description,
  action,
  className,
  id,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 id={id} className="font-display text-[26px] font-normal leading-tight text-slate-900 sm:text-[30px]">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Meter band 0–9: bar tipis dengan penanda target. */
export function BandMeter({ band, target, color = "#0073ea" }: { band: number | null; target?: number | null; color?: string }) {
  const pct = band !== null ? Math.min(100, (band / 9) * 100) : 0;
  return (
    <div className="relative h-1.5 w-full rounded-full bg-slate-100">
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      {target ? (
        <span
          className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-slate-900"
          style={{ left: `${Math.min(100, (target / 9) * 100)}%` }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
