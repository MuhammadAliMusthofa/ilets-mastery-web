"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { useExamStore } from "@/src/store/examStore";

interface IOption {
  id: string;
  text: string;
}

interface IQuestionData {
  id: string | number;
  text?: string;
  text_image?: string;
  question_text: string;
  marks?: number;
  Options: IOption[];
}

interface MultipleChoiceComplexContainerProps {
  data: IQuestionData;
  questionNumber: number;
}

const NUMBER_WORDS = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX"];

export function MultipleChoiceComplexContainer({
  data,
  questionNumber,
}: MultipleChoiceComplexContainerProps) {
  const selected = useExamStore((state) => state.answers[Number(data.id)]) ?? [];
  const setStoreAnswer = useExamStore((state) => state.setAnswer);

  const required = Math.max(1, data.marks ?? 2);
  const lastNumber = questionNumber + required - 1;
  const hasStimulus = !!(data.text || data.text_image);

  const toggle = (optionId: string) => {
    if (selected.includes(optionId)) {
      setStoreAnswer(
        Number(data.id),
        selected.filter((id) => id !== optionId)
      );
      return;
    }

    // Memilih lebih dari yang diminta membuat soal bernilai nol, jadi
    // pilihan tambahan ditolak di sini alih-alih diam-diam merugikan siswa.
    if (selected.length >= required) {
      return;
    }

    setStoreAnswer(Number(data.id), [...selected, optionId]);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {hasStimulus && (
        <div className="h-[40vh] w-full overflow-y-auto border-b border-slate-200 bg-white p-6 lg:h-full lg:w-1/2 lg:border-b-0 lg:border-r lg:p-10">
          {data.text_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.text_image}
              alt="Stimulus"
              className="mb-6 max-h-80 w-auto rounded-xl border border-slate-100 object-contain"
            />
          )}
          {data.text && (
            <div
              className="prose prose-slate max-w-none text-justify leading-relaxed text-slate-700 sm:text-lg"
              dangerouslySetInnerHTML={{ __html: data.text }}
            />
          )}
        </div>
      )}

      <div
        className={cn(
          "flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-10",
          hasStimulus ? "lg:w-1/2" : "mx-auto w-full max-w-3xl"
        )}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-black text-slate-800">
            Questions {questionNumber}
            {required > 1 ? `–${lastNumber}` : ""}
          </h3>
          <p className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-slate-600">
            Choose <span className="font-bold">{NUMBER_WORDS[required] ?? required}</span> letters.
            <span className="ml-2 text-slate-500">
              ({selected.length}/{required} dipilih)
            </span>
          </p>

          <p
            className="mb-6 text-base font-semibold leading-relaxed text-slate-800"
            dangerouslySetInnerHTML={{ __html: data.question_text }}
          />

          <div className="space-y-2">
            {data.Options.map((option) => {
              const isSelected = selected.includes(option.id);
              const isLocked = !isSelected && selected.length >= required;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  disabled={isLocked}
                  onClick={() => toggle(option.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-all sm:p-4",
                    isSelected
                      ? "border-brand-purple bg-brand-purple/5 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50",
                    isLocked && "cursor-not-allowed opacity-50 hover:border-slate-100 hover:bg-white"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                      isSelected ? "border-brand-purple bg-brand-purple text-white" : "border-slate-300"
                    )}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="flex gap-2 text-sm sm:text-base">
                    <span className="font-bold text-slate-700">{option.id}.</span>
                    <span className={isSelected ? "font-medium text-slate-900" : "text-slate-600"}>
                      {option.text}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
