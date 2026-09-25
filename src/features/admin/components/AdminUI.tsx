"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Search, X } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { Button } from "@/components/ui/button";

/*
 * Komponen dasar halaman admin: tabel biasa, kartu, badge, drawer detail,
 * dan dialog konfirmasi. Admin adalah alat kerja, jadi semuanya tenang:
 * garis tipis, satu aksen biru, warna hanya untuk status.
 */

// ---------------------------------------------------------------------------
// Utilitas
// ---------------------------------------------------------------------------

/** Pesan dari backend ditampilkan apa adanya; validatornya sudah menyebut apa yang salah. */
export const readErrorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? fallback;
};

/** Teks polos dari HTML soal/passage, untuk ringkasan di tabel. */
export const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

export type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red" | "purple";

const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  blue: "bg-[#e5efff] text-[#1f5fcc]",
  green: "bg-[#dcf7ea] text-[#007a47]",
  amber: "bg-[#fff0d4] text-[#8a5200]",
  red: "bg-[#fdeef1] text-[#b12a41]",
  purple: "bg-[#ece3fb] text-[#5b36a8]",
};

export function Badge({
  tone = "neutral",
  dot,
  children,
  className,
  style,
}: {
  tone?: BadgeTone;
  /** Titik status di depan label. */
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={style}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium",
        BADGE_TONE[tone],
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function StatusBadge({ published, on = "Published", off = "Draft" }: { published: boolean; on?: string; off?: string }) {
  return (
    <Badge tone={published ? "green" : "amber"} dot>
      {published ? on : off}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Kartu
// ---------------------------------------------------------------------------

export function Card({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "#0073ea",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] text-slate-500">{label}</p>
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}1a`, color: accent }}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="tabular mt-2 text-[26px] font-semibold leading-none text-slate-900">{value}</p>
      {hint && <p className="mt-2 text-[12px] text-slate-500">{hint}</p>}
    </div>
  );
}

/** Daftar label–nilai untuk kartu detail. */
export function DetailList({ items }: { items: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <dl className="grid grid-cols-[minmax(110px,auto)_1fr] gap-x-4 gap-y-2.5 text-[14px]">
      {items.map((item) => (
        <React.Fragment key={item.label}>
          <dt className="text-slate-500">{item.label}</dt>
          <dd className="min-w-0 text-slate-900">{item.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Icon size={20} />
        </span>
      )}
      <p className="text-[15px] font-medium text-slate-900">{title}</p>
      {text && <p className="mt-1 max-w-[46ch] text-[14px] text-slate-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorNotice({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#f3c2cb] bg-[#fdeef1] px-4 py-3 text-[14px] text-[#8a1f33]">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// ---------------------------------------------------------------------------
// Tabel
// ---------------------------------------------------------------------------

export function Table({ children, minWidth = 720, className }: { children: React.ReactNode; minWidth?: number; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-[14px] text-slate-800", className)} style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-slate-50">
      <tr className="border-b border-slate-200">{children}</tr>
    </thead>
  );
}

export function Th({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "h-10 whitespace-nowrap px-4 text-[12px] font-medium uppercase tracking-[0.04em] text-slate-500",
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

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function Tr({
  children,
  onClick,
  selected,
  className,
}: {
  children: React.ReactNode;
  /** Baris bisa diklik untuk membuka detail. Tombol di dalam baris harus stopPropagation. */
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors duration-100",
        onClick && "cursor-pointer hover:bg-slate-50",
        selected && "bg-primary-50 hover:bg-primary-50",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function Td({
  children,
  align = "left",
  className,
  colSpan,
}: {
  children?: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-4 py-3 align-middle",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}

/** Kartu pembungkus tabel: judul, jumlah, dan toolbar di atas; tabel di dalam. */
export function TableCard({
  title,
  count,
  toolbar,
  children,
  footer,
  className,
}: {
  title?: React.ReactNode;
  count?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white", className)}>
      {(title || toolbar) && (
        <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
          {title && (
            <h2 className="text-[15px] font-semibold text-slate-900">
              {title}
              {count !== undefined && <span className="tabular ml-2 text-[13px] font-normal text-slate-500">{count}</span>}
            </h2>
          )}
          {toolbar && <div className="flex flex-1 flex-wrap items-center justify-end gap-2">{toolbar}</div>}
        </header>
      )}
      {children}
      {footer && <footer className="border-t border-slate-200 px-4 py-3 text-[13px] text-slate-500">{footer}</footer>}
    </section>
  );
}

/** Tombol ikon kecil untuk aksi baris; berhenti di sini supaya klik tidak membuka detail baris. */
export function IconAction({
  label,
  onClick,
  children,
  tone = "neutral",
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "neutral" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-slate-500 transition-colors disabled:pointer-events-none disabled:opacity-30",
        tone === "neutral" && "hover:bg-slate-100 hover:text-slate-900",
        tone === "danger" && "hover:bg-[#fdeef1] hover:text-[#b12a41]"
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  label = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <label className="relative block w-full sm:w-64">
      <span className="sr-only">{label}</span>
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-[14px] text-slate-800 hover:border-slate-500 focus:border-primary-500 focus:outline-none"
      />
    </label>
  );
}

/** Tab filter berbentuk chip dengan jumlah. */
export function FilterChips<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; count?: number }>;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors",
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cn("tabular text-[12px]", active ? "text-white/70" : "text-slate-400")}>{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[12px] text-[#b12a41]">{error}</p>
      ) : (
        hint && <p className="mt-1 text-[12px] text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-[#00c875]" : "bg-slate-300"
      )}
    >
      <span className={cn("inline-block size-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Overlay: drawer & dialog
// ---------------------------------------------------------------------------

const useOverlay = (open: boolean, onClose: () => void) => {
  const panelRef = useRef<HTMLDivElement>(null);
  // onClose biasanya arrow inline yang berubah tiap render. Disimpan di ref
  // supaya efek di bawah hanya jalan saat panel dibuka/ditutup — kalau ikut
  // berubah, fokus direbut kembali ke panel dan ketikan hilang.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);

  return panelRef;
};

/** Panel detail dari kanan: melihat, mengedit, atau membuat data tanpa meninggalkan tabel. */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  const panelRef = useOverlay(open, onClose);
  const titleId = useId();

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-slate-950/30" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl outline-none"
        style={{ maxWidth: width }}
      >
        <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[17px] font-semibold text-slate-900">
              {title}
            </h2>
            {subtitle && <div className="mt-1 text-[13px] text-slate-500">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panelRef = useOverlay(open, onCancel);
  const titleId = useId();

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onCancel} aria-hidden="true" />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-[420px] rounded-xl bg-white p-5 shadow-2xl outline-none"
      >
        <h2 id={titleId} className="text-[16px] font-semibold text-slate-900">
          {title}
        </h2>
        <div className="mt-2 text-[14px] leading-relaxed text-slate-600">{message}</div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
