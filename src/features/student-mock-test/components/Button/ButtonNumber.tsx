"use client";

import React from "react";
import { Flag } from "lucide-react";
import { cn } from "@/src/libs/utils";

export type QuestionStatus = "answered" | "unanswered" | "flagged" | "active";

interface ButtonNumberProps {
  number: number;
  status: QuestionStatus;
  onClick: () => void;
  disabled?: boolean;
}

const STATUS_LABEL: Record<QuestionStatus, string> = {
  answered: "answered",
  unanswered: "blank",
  flagged: "flagged",
  active: "current",
};

/** Nomor soal berwarna status monday: hijau terjawab, oranye ditandai, garis kosong. */
export function ButtonNumber({ number, status, onClick, disabled }: ButtonNumberProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Question ${number}, ${STATUS_LABEL[status]}`}
      aria-current={status === "active" ? "step" : undefined}
      className={cn(
        "relative flex h-10 w-full items-center justify-center rounded-[4px] border text-[14px] font-medium tabular transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        status === "active" && "border-2 border-primary-500 bg-primary-50 text-slate-800",
        status === "answered" && "border-[#00c875] bg-[#00c875] text-slate-800 hover:bg-[#00b369]",
        status === "flagged" && "border-[#fdab3d] bg-[#fdab3d] text-slate-800 hover:bg-[#f09a28]",
        status === "unanswered" && "border-slate-300 bg-white text-slate-700 hover:border-slate-800"
      )}
    >
      {number}
      {status === "flagged" && (
        <Flag size={10} className="absolute right-1 top-1 fill-slate-800 text-slate-800" aria-hidden="true" />
      )}
    </button>
  );
}
