"use client";

import React, { useMemo } from "react";
import { cn } from "@/src/libs/utils";
import { QuestionNumber, QuestionText } from "./QuestionNumber";

interface ILongEssayProps {
  questionId: number;
  question: string;
  value: string;
  onChange: (value: string) => void;
  /** Target minimal kata (150 untuk Task 1, 250 untuk Task 2). */
  minWords?: number;
}

export function LongEssay({ questionId, question, value, onChange, minWords = 250 }: ILongEssayProps) {
  const wordCount = useMemo(() => (value.trim() ? value.trim().split(/\s+/).length : 0), [value]);
  const met = wordCount >= minWords;
  const inputId = `q-${questionId}-essay`;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <QuestionNumber value={questionId} className="mt-0.5" />
        <label htmlFor={inputId} className="block">
          <QuestionText html={question} className="[&>p:first-child]:mt-0" />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-300 transition-colors duration-150 focus-within:border-primary-500 hover:border-slate-800 focus-within:hover:border-primary-500">
        <textarea
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="block min-h-[380px] w-full resize-y bg-white p-4 text-[16px] leading-relaxed text-slate-800 focus:outline-none"
        />
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2 text-[13px]">
          <span className="text-slate-500">At least {minWords} words</span>
          <span className={cn("tabular font-medium", met ? "text-[#007a47]" : "text-slate-800")} aria-live="polite">
            {wordCount} words
          </span>
        </div>
      </div>
    </div>
  );
}
