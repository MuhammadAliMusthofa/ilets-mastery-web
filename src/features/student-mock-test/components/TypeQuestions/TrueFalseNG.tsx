"use client";

import React from "react";
import { cn } from "@/src/libs/utils";
import { QuestionNumber, QuestionText } from "./QuestionNumber";

interface ITrueFalseNGProps {
  questionId: number;
  question: string;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  /** IELTS memakai TRUE/FALSE/NOT GIVEN atau YES/NO/NOT GIVEN. */
  variant?: "TFNG" | "YNNG";
}

export function TrueFalseNG({ questionId, question, selectedValue, onSelect, variant = "TFNG" }: ITrueFalseNGProps) {
  const options = variant === "TFNG" ? ["TRUE", "FALSE", "NOT GIVEN"] : ["YES", "NO", "NOT GIVEN"];

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <QuestionNumber value={questionId} className="mt-0.5" />
        <QuestionText html={question} className="[&>p:first-child]:mt-0" />
      </div>

      <fieldset className="sm:pl-9">
        <legend className="sr-only">Choose an answer for question {questionId}</legend>
        <div className="inline-flex w-full overflow-hidden rounded-[4px] border border-slate-300 sm:w-auto">
          {options.map((opt, index) => {
            const isSelected = selectedValue === opt;
            return (
              <label
                key={opt}
                className={cn(
                  "flex h-10 flex-1 cursor-pointer items-center justify-center px-5 text-[14px] font-medium transition-colors duration-150 has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-primary-500 sm:flex-none",
                  index > 0 && "border-l border-slate-300",
                  isSelected ? "bg-primary-500 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <input
                  type="radio"
                  name={`question-${questionId}`}
                  value={opt}
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => onSelect(opt)}
                />
                {opt}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
