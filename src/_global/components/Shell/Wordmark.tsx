import Link from "next/link";
import { cn } from "@/src/libs/utils";

/**
 * Tanda IELTS Vibe: empat bar setinggi berbeda dalam warna keempat skill,
 * dibaca sebagai meter suara — sebuah "vibe". Digambar sebagai geometri,
 * bukan ilustrasi.
 */
export function VibeMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect x="1" y="8" width="4" height="10" rx="2" fill="#ff7a45" />
      <rect x="6.5" y="3" width="4" height="15" rx="2" fill="#bb3354" />
      <rect x="12" y="6" width="4" height="12" rx="2" fill="#1f5fcc" />
      <rect x="17.5" y="10" width="4" height="8" rx="2" fill="#784bd1" />
    </svg>
  );
}

export function Wordmark({ href, suffix }: { href: string; suffix?: string }) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[4px] px-1 py-1 text-slate-800 transition-colors hover:bg-[#dcdfec]"
    >
      <VibeMark />
      <span className="font-display text-[17px] leading-none">
        <span className="font-semibold">IELTS</span> <span className="font-normal">vibe</span>
      </span>
      {suffix && (
        <span className="ml-1 rounded-[4px] bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium leading-none text-white">
          {suffix}
        </span>
      )}
    </Link>
  );
}
