"use client";

import React, { useRef } from "react";
import { cn } from "@/src/libs/utils";

/**
 * Enam kotak angka untuk PIN. Satu digit per kotak: mengetik memajukan fokus,
 * Backspace memundurkan, dan menempel kode dari email mengisi semuanya
 * sekaligus. Nilainya tetap satu string supaya validasinya tidak berubah.
 */
export const OTP_LENGTH = 6;

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Dipanggil saat digit terakhir terisi. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_unused, index) => value[index] ?? "");

  const focusAt = (index: number) => {
    const target = inputs.current[Math.min(Math.max(index, 0), OTP_LENGTH - 1)];
    target?.focus();
    target?.select();
  };

  const commit = (next: string, focusIndex: number) => {
    onChange(next);
    focusAt(focusIndex);
    if (next.length === OTP_LENGTH) onComplete?.(next);
  };

  const setDigit = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    // Buang kekosongan di tengah supaya nilainya selalu rapat dari kiri.
    commit(next.join("").replace(/\s/g, ""), digit ? index + 1 : index);
  };

  const handleChange = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) {
      setDigit(index, "");
      return;
    }
    // Beberapa angka sekaligus (autofill OTP atau tempel) diisikan ke depan.
    if (typed.length > 1) {
      const next = (value.slice(0, index) + typed).slice(0, OTP_LENGTH);
      commit(next, next.length);
      return;
    }
    setDigit(index, typed.slice(-1));
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        setDigit(index, "");
        return;
      }
      const next = [...digits];
      next[index - 1] = "";
      commit(next.join(""), index - 1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    const next = (value.slice(0, index) + pasted).slice(0, OTP_LENGTH);
    commit(next, next.length);
  };

  return (
    <div
      role="group"
      aria-label={`${OTP_LENGTH}-digit PIN`}
      data-otp-ring
      className="flex justify-between gap-2 sm:gap-3"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          data-otp-box
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          maxLength={OTP_LENGTH}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          aria-invalid={invalid || undefined}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={cn(
            "tabular size-[52px] shrink-0 rounded-xl border-2 bg-white text-center text-[22px] font-medium text-slate-900 transition-colors",
            "focus:outline-none focus-visible:border-slate-900 focus-visible:ring-4 focus-visible:ring-slate-900/10",
            "disabled:bg-slate-50 disabled:text-slate-400 sm:size-14 sm:text-[24px]",
            digit ? "border-slate-900" : "border-slate-200",
            invalid && "border-[#d83a52] bg-[#fdeef1]"
          )}
        />
      ))}
    </div>
  );
}
