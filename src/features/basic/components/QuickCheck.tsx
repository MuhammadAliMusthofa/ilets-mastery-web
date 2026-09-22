"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/src/libs/utils";
import type { LessonContent } from "@/src/models/basic";

export type CheckQuestion = LessonContent["check"][number] & { source?: string };

/**
 * Kuis cek cepat: satu jawaban per soal, umpan balik langsung, dan alasan
 * jawaban benar. Memanggil `onScore` setiap kali jumlah jawaban berubah.
 */
export function QuickCheck({
  questions,
  onScore,
  onAnswer,
  className,
}: {
  questions: CheckQuestion[];
  onScore?: (correct: number, answered: number, total: number) => void;
  onAnswer?: (questionIndex: number, correct: boolean) => void;
  className?: string;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const choose = (questionIndex: number, optionIndex: number) => {
    if (answers[questionIndex] !== undefined) return;
    const next = { ...answers, [questionIndex]: optionIndex };
    setAnswers(next);
    const answered = Object.keys(next).length;
    const correct = Object.entries(next).filter(([q, o]) => questions[Number(q)].answer === o).length;
    onScore?.(correct, answered, questions.length);
    onAnswer?.(questionIndex, questions[questionIndex].answer === optionIndex);
  };

  return (
    <ol className={cn("space-y-5", className)}>
      {questions.map((question, questionIndex) => {
        const picked = answers[questionIndex];
        const revealed = picked !== undefined;
        return (
          <li key={questionIndex} className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <fieldset>
              <legend className="flex gap-3 text-[16px] font-medium text-slate-900">
                <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[13px] text-white">
                  {questionIndex + 1}
                </span>
                <span className="pt-0.5">{question.question}</span>
              </legend>
              {question.source && <p className="mt-1 pl-10 text-[13px] text-slate-500">From: {question.source}</p>}

              <div className="mt-4 grid gap-2 sm:pl-10">
                {question.options.map((option, optionIndex) => {
                  const isPicked = picked === optionIndex;
                  const isRight = optionIndex === question.answer;
                  return (
                    <label
                      key={option}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-[15px] transition-colors",
                        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-500",
                        !revealed && "cursor-pointer border-slate-200 hover:border-slate-400",
                        revealed && isRight && "border-[#00c875] bg-[#dcf7ea]",
                        revealed && isPicked && !isRight && "border-[#d83a52] bg-[#fdeef1]",
                        revealed && !isPicked && !isRight && "border-slate-100 text-slate-400"
                      )}
                    >
                      <input
                        type="radio"
                        name={`check-${questionIndex}`}
                        className="sr-only"
                        checked={isPicked}
                        disabled={revealed}
                        onChange={() => choose(questionIndex, optionIndex)}
                      />
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                          revealed && isRight ? "border-[#00c875] bg-[#00c875] text-white" : "border-slate-300",
                          revealed && isPicked && !isRight && "border-[#d83a52] bg-[#d83a52] text-white"
                        )}
                        aria-hidden="true"
                      >
                        {revealed && isRight && <Check size={14} strokeWidth={3} />}
                        {revealed && isPicked && !isRight && <X size={14} strokeWidth={3} />}
                      </span>
                      <span className="text-slate-900">{option}</span>
                    </label>
                  );
                })}
              </div>

              {revealed && (
                <p
                  role="status"
                  className={cn(
                    "mt-4 rounded-2xl px-4 py-3 text-[14px] leading-relaxed sm:ml-10",
                    picked === question.answer ? "bg-[#dcf7ea] text-[#00613a]" : "bg-[#fdeef1] text-[#8a1f33]"
                  )}
                >
                  <span className="font-semibold">{picked === question.answer ? "Correct. " : "Not quite. "}</span>
                  {question.why}
                </p>
              )}
            </fieldset>
          </li>
        );
      })}
    </ol>
  );
}
