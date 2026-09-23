"use client";

import { Quote } from "lucide-react";
import { useQuoteOfDay } from "../hooks/useQuoteOfDay";
import { Reveal } from "@/src/_global/motion/Reveal";

/**
 * Kutipan motivasi harian di beranda siswa. Dipilih backend dari kutipan
 * aktif yang dikelola admin; tidak tampil bila belum ada kutipan aktif.
 */
export function QuoteOfDayCard() {
  const { data: quote } = useQuoteOfDay();
  if (!quote) return null;

  return (
    <Reveal>
      <figure aria-label="Quote of the day" className="relative overflow-hidden rounded-4xl bg-[#b9e3ff] px-6 py-8 sm:px-12 sm:py-12">
        <Quote
          size={160}
          strokeWidth={1.25}
          className="pointer-events-none absolute -right-6 -top-8 text-white/60 sm:right-6"
          aria-hidden="true"
        />
        <p className="relative text-[13px] font-medium uppercase tracking-[0.1em] text-[#181b34]/60">Quote of the day</p>
        <blockquote className="relative mt-4 max-w-[34ch] font-display text-[26px] font-normal leading-[1.2] tracking-[-0.01em] text-[#181b34] sm:text-[36px]">
          “{quote.text}”
        </blockquote>
        <figcaption className="relative mt-6 flex items-center gap-3 text-[15px] text-[#181b34]">
          <span className="h-px w-8 bg-[#181b34]/40" aria-hidden="true" />
          <span className="font-medium">{quote.author}</span>
          {quote.source && <span className="text-[#181b34]/60">· {quote.source}</span>}
        </figcaption>
      </figure>
    </Reveal>
  );
}
