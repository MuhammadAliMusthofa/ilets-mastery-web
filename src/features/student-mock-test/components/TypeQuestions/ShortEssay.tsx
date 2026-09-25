"use client";

import React from "react";
import { cn } from "@/src/libs/utils";
import { QuestionNumber, QuestionText } from "./QuestionNumber";

interface IShortEssayProps {
  questionId: number;
  question: string;
  value: string[];
  onChange: (value: string, index: number) => void;
  column?: number;
}

/**
 * Isian singkat. Tiap kotak diberi nomor soal aslinya (mis. 9–14) sekaligus
 * penanda urutan (1)…(n) yang dipakai di teks soal.
 */
export function ShortEssay({ questionId, question, value, onChange, column = 1 }: IShortEssayProps) {
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <QuestionNumber value={column > 1 ? `${questionId}–${questionId + column - 1}` : questionId} className="mt-0.5" />
        <QuestionText html={question} className="[&>p:first-child]:mt-0" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:pl-9">
        {Array.from({ length: column }).map((_, index) => {
          const inputId = `q-${questionId}-blank-${index}`;
          const filled = !!value[index]?.trim();

          return (
            <div key={index} className="flex items-center gap-3">
              <label htmlFor={inputId} className="flex w-[88px] shrink-0 items-center gap-1.5 text-[13px] text-slate-500">
                <QuestionNumber value={questionId + index} className={cn(!filled && "bg-slate-500")} />
                {column > 1 && <span className="tabular">({index + 1})</span>}
              </label>
              <input
                id={inputId}
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={value[index] || ""}
                onChange={(event) => onChange(event.target.value, index)}
                className="h-10 w-full rounded-[4px] border border-slate-300 bg-white px-3 text-[15px] text-slate-800 transition-colors duration-150 hover:border-slate-800 focus:border-primary-500 focus:outline-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
