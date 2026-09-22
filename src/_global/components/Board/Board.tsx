"use client";

import React, { createContext, useContext, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/libs/utils";
import {
  STATUS_COLOR,
  SKILL_COLOR,
  SKILL_GUIDE,
  type LabelColor,
  type StatusTone,
} from "@/src/_global/design/tokens";

/*
 * Board ala monday.com: grup berpita warna, tabel dengan garis sel tipis,
 * dan kolom status yang diisi penuh oleh warnanya.
 */

const GroupColor = createContext<string>("#0073ea");

// ---------------------------------------------------------------------------
// Grup
// ---------------------------------------------------------------------------

interface BoardGroupProps {
  title: string;
  color: string;
  /** Teks kecil di samping judul, mis. "4 tes". */
  meta?: string;
  /** Aksi di sisi kanan header grup. */
  actions?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function BoardGroup({
  title,
  color,
  meta,
  actions,
  defaultOpen = true,
  children,
  className,
}: BoardGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <GroupColor.Provider value={color}>
      <section className={cn("mb-10", className)}>
        <div className="mb-2 flex min-h-8 items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            className="flex items-center gap-1.5 rounded-[4px] py-1 pr-2 text-left transition-colors hover:bg-slate-100"
          >
            <ChevronDown
              size={18}
              style={{ color }}
              className={cn("transition-transform duration-150 ease-out", !open && "-rotate-90")}
            />
            <h2 className="font-display text-lg font-medium leading-none" style={{ color }}>
              {title}
            </h2>
          </button>
          {meta && <span className="text-[13px] text-slate-500">{meta}</span>}
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>

        {open && children}
      </section>
    </GroupColor.Provider>
  );
}

// ---------------------------------------------------------------------------
// Tabel
// ---------------------------------------------------------------------------

export function BoardTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          "w-full min-w-[720px] border-separate border-spacing-0 text-sm text-slate-800",
          className
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function BoardHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
}

/** Header kolom. Kolom pertama otomatis membawa pita warna grup. */
export function BoardHeadCell({
  children,
  first,
  align = "center",
  className,
}: {
  children?: React.ReactNode;
  first?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  const color = useContext(GroupColor);

  return (
    <th
      scope="col"
      style={first ? { boxShadow: `inset 6px 0 0 ${color}` } : undefined}
      className={cn(
        "h-9 border-y border-r border-slate-200 bg-white px-3 text-[13px] font-normal text-slate-500",
        first && "rounded-tl-lg border-l-0 pl-5",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

export function BoardBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function BoardRow({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "group/row h-10 bg-white transition-colors duration-150 hover:bg-[#f5f6f8]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function BoardCell({
  children,
  first,
  last,
  align = "center",
  flush,
  className,
}: {
  children?: React.ReactNode;
  first?: boolean;
  /** Baris terakhir grup: sudut kiri-bawah membulat. */
  last?: boolean;
  align?: "left" | "center" | "right";
  /** Tanpa padding — untuk sel status yang diisi penuh warnanya. */
  flush?: boolean;
  className?: string;
}) {
  const color = useContext(GroupColor);

  return (
    <td
      style={first ? { boxShadow: `inset 6px 0 0 ${color}` } : undefined}
      className={cn(
        "h-10 border-b border-r border-slate-200",
        flush ? "p-0" : "px-3",
        first && "pl-5",
        first && last && "rounded-bl-lg",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

/** Pill status: mengisi seluruh sel, seperti kolom Status di monday. */
export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return <FillLabel color={STATUS_COLOR[tone]} className={className}>{children}</FillLabel>;
}

export function FillLabel({
  color,
  children,
  className,
}: {
  color: LabelColor;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-10 w-full items-center justify-center px-2 text-[13px] font-medium leading-none",
        className
      )}
      style={{ backgroundColor: color.bg, color: color.fg }}
    >
      {children}
    </span>
  );
}

/** Label skill ringkas untuk dipakai di luar sel penuh. */
export function SkillTag({ skill, children }: { skill: keyof typeof SKILL_COLOR; children: React.ReactNode }) {
  const color = SKILL_COLOR[skill];
  return (
    <span
      className="inline-flex h-6 items-center rounded-[4px] px-2 text-[12px] font-medium leading-none"
      style={{ backgroundColor: color.bg, color: color.fg }}
    >
      {children}
    </span>
  );
}

/** Avatar karakter kru, seperti kolom People di monday. */
export function GuideAvatar({
  skill,
  size = 28,
  className,
}: {
  skill: keyof typeof SKILL_GUIDE;
  size?: number;
  className?: string;
}) {
  const guide = SKILL_GUIDE[skill];
  const color = SKILL_COLOR[skill];

  return (
    <span
      className={cn("relative inline-block shrink-0 overflow-hidden rounded-full ring-2 ring-white", className)}
      style={{ width: size, height: size, backgroundColor: color.bg }}
      title={guide.name}
    >
      <Image src={guide.src} alt={guide.name} fill sizes={`${size * 2}px`} className="object-cover object-top" />
    </span>
  );
}

export function GuideStack({ skills, size = 28 }: { skills: Array<keyof typeof SKILL_GUIDE>; size?: number }) {
  return (
    <span className="inline-flex items-center -space-x-2">
      {skills.map((skill) => (
        <GuideAvatar key={skill} skill={skill} size={size} />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Battery
// ---------------------------------------------------------------------------

/**
 * Battery bar monday: satu bar tersegmen yang merangkum komposisi status
 * sebuah grup. Segmen kosong tidak digambar.
 */
export function Battery({
  segments,
  label,
  className,
}: {
  segments: Array<{ tone: StatusTone; value: number; label: string }>;
  label: string;
  className?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const visible = segments.filter((segment) => segment.value > 0);

  return (
    <div
      role="img"
      aria-label={`${label}: ${visible.map((s) => `${s.value} ${s.label}`).join(", ") || "empty"}`}
      className={cn("flex h-6 w-full overflow-hidden rounded-[4px] bg-slate-100", className)}
    >
      {total > 0 &&
        visible.map((segment) => (
          <span
            key={segment.tone}
            title={`${segment.label}: ${segment.value}`}
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: STATUS_COLOR[segment.tone].bg,
            }}
          />
        ))}
    </div>
  );
}
