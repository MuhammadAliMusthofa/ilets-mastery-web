"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { useExamStore } from "@/src/store/examStore";
import { QuestionLayout } from "./QuestionLayout";
import { QuestionNumber, QuestionText } from "../../components/TypeQuestions/QuestionNumber";

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

export function MultipleChoiceComplexContainer({ data, questionNumber }: MultipleChoiceComplexContainerProps) {
  const selected = useExamStore((state) => state.answers[Number(data.id)]) ?? [];
  const setStoreAnswer = useExamStore((state) => state.setAnswer);

  const required = Math.max(1, data.marks ?? 2);
  const lastNumber = questionNumber + required - 1;

  const toggle = (optionId: string) => {
    if (selected.includes(optionId)) {
      setStoreAnswer(Number(data.id), selected.filter((id) => id !== optionId));
      return;
    }
    // Memilih lebih dari yang diminta membuat soal bernilai nol, jadi pilihan
    // tambahan ditolak di sini alih-alih diam-diam merugikan siswa.
    if (selected.length >= required) {
      return;
    }
    setStoreAnswer(Number(data.id), [...selected, optionId]);
  };

  return (
    <QuestionLayout stimulusHtml={data.text} stimulusImage={data.text_image}>
      <div className="space-y-5">
        <div className="flex gap-3">
          <QuestionNumber value={required > 1 ? `${questionNumber}–${lastNumber}` : questionNumber} className="mt-0.5" />
          <div>
            <p className="mb-2 text-[14px] text-slate-700">
              Choose <span className="font-semibold">{NUMBER_WORDS[required] ?? required}</span> letters.{" "}
              <span className="tabular text-slate-500">({selected.length}/{required} selected)</span>
            </p>
            <QuestionText html={data.question_text} className="[&>p:first-child]:mt-0" />
          </div>
        </div>

        <fieldset className="space-y-2 sm:pl-9">
          <legend className="sr-only">
            Choose {required} answers for questions {questionNumber} to {lastNumber}
          </legend>
          {data.Options.map((option) => {
            const isSelected = selected.includes(option.id);
            const isLocked = !isSelected && selected.length >= required;

            return (
              <label
                key={option.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-500",
                  isSelected
                    ? "cursor-pointer border-primary-500 bg-primary-50"
                    : "cursor-pointer border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50",
                  isLocked && "cursor-not-allowed opacity-50 hover:border-slate-200 hover:bg-white"
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSelected}
                  disabled={isLocked}
                  onChange={() => toggle(option.id)}
                />
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-[4px] border text-[13px] font-semibold",
                    isSelected ? "border-primary-500 bg-primary-500 text-white" : "border-slate-300 text-slate-700"
                  )}
                  aria-hidden="true"
                >
                  {isSelected ? <Check size={14} strokeWidth={3} /> : option.id}
                </span>
                <span className="pt-0.5 text-[15px] leading-relaxed text-slate-800">
                  <span className="sr-only">{option.id}. </span>
                  {option.text}
                </span>
              </label>
            );
          })}
        </fieldset>
      </div>
    </QuestionLayout>
  );
}
