"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import type { QuestionAttachment, QuestionOption, QuestionType } from "@/src/models/ielts";

const parseVariants = (text: string): string[] =>
  text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

/**
 * Menyimpan teks mentahnya sendiri. Kalau nilai input diturunkan dari
 * `variants.join(", ")`, koma yang baru diketik langsung hilang saat
 * di-parse ulang, sehingga varian kedua tidak pernah bisa diketik.
 */
function AnswerVariantsInput({
  index,
  variants,
  onCommit,
}: {
  index: number;
  variants: string[];
  onCommit: (next: string[]) => void;
}) {
  const [raw, setRaw] = useState(() => variants.join(", "));

  return (
    <div>
      <label
        htmlFor={`blank-${index}`}
        className="mb-1 block text-xs font-medium text-slate-600"
      >
        Accepted answers for blank {index + 1}
      </label>
      <input
        id={`blank-${index}`}
        value={raw}
        placeholder="separate variants with commas, e.g. colour, color"
        onChange={(event) => {
          setRaw(event.target.value);
          onCommit(parseVariants(event.target.value));
        }}
        className="h-10 w-full rounded-[4px] border border-slate-300 bg-white px-3 text-[14px] hover:border-slate-800 focus:border-primary-500 focus:outline-none"
      />
    </div>
  );
}

export interface QuestionDraft {
  question_type: QuestionType;
  column_answer: number | null;
  options: QuestionOption[];
  accepted_answers: string[][];
  attachments: QuestionAttachment[];
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const TRUE_FALSE_VALUES = ["TRUE", "FALSE", "NOT_GIVEN"] as const;

/** Nilai awal yang sudah memenuhi aturan backend untuk tiap tipe. */
export const blankDraftFor = (type: QuestionType): Omit<QuestionDraft, "question_type"> => {
  switch (type) {
    case "MULTIPLE_CHOICE":
    case "MULTIPLE_CHOICE_COMPLEX":
      return {
        column_answer: null,
        options: [
          { id: "A", text: "" },
          { id: "B", text: "" },
        ],
        accepted_answers: [[]],
        attachments: [],
      };
    case "TRUE_FALSE_NOT_GIVEN":
      return { column_answer: null, options: [], accepted_answers: [[]], attachments: [] };
    case "SHORT_ANSWER":
    case "MAP_LABELING":
      return { column_answer: 1, options: [], accepted_answers: [[]], attachments: [] };
    case "LONG_ESSAY":
      return { column_answer: null, options: [], accepted_answers: [], attachments: [] };
  }
};

interface QuestionTypeFieldsProps {
  value: QuestionDraft;
  onChange: (next: QuestionDraft) => void;
}

export function QuestionTypeFields({ value, onChange }: QuestionTypeFieldsProps) {
  const patch = (changes: Partial<QuestionDraft>) => onChange({ ...value, ...changes });

  const usesOptions =
    value.question_type === "MULTIPLE_CHOICE" ||
    value.question_type === "MULTIPLE_CHOICE_COMPLEX";
  const allowsMultipleAnswers = value.question_type === "MULTIPLE_CHOICE_COMPLEX";
  const usesBlanks =
    value.question_type === "SHORT_ANSWER" || value.question_type === "MAP_LABELING";

  const selected = value.accepted_answers[0] ?? [];

  const toggleAnswer = (optionId: string) => {
    if (allowsMultipleAnswers) {
      const next = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId];
      patch({ accepted_answers: [next] });
      return;
    }

    patch({ accepted_answers: [[optionId]] });
  };

  const addOption = () => {
    const nextLetter = OPTION_LETTERS[value.options.length];
    if (!nextLetter) {
      return;
    }
    patch({ options: [...value.options, { id: nextLetter, text: "" }] });
  };

  const removeOption = (optionId: string) => {
    patch({
      options: value.options.filter((option) => option.id !== optionId),
      accepted_answers: [selected.filter((id) => id !== optionId)],
    });
  };

  const setBlankCount = (count: number) => {
    if (count < 1 || count > 10) {
      return;
    }

    const answers = Array.from(
      { length: count },
      (_unused, index) => value.accepted_answers[index] ?? []
    );
    patch({ column_answer: count, accepted_answers: answers });
  };

  if (value.question_type === "LONG_ESSAY") {
    return (
      <p className="rounded-lg bg-primary-50 px-4 py-3 text-[14px] text-slate-800">
        This type has no answer key. Students score their own writing through
        self-assessment guided by the band descriptor rubric.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {usesOptions && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Answer options
            {allowsMultipleAnswers && (
              <span className="ml-2 text-xs font-normal text-slate-500">
                tick every correct answer
              </span>
            )}
          </p>

          <div className="space-y-2">
            {value.options.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <input
                  type={allowsMultipleAnswers ? "checkbox" : "radio"}
                  name="correct-option"
                  aria-label={`Mark ${option.id} as correct`}
                  checked={selected.includes(option.id)}
                  onChange={() => toggleAnswer(option.id)}
                />
                <span className="flex size-7 items-center justify-center rounded-[4px] bg-slate-800 text-[13px] font-semibold text-white">{option.id}</span>
                <input
                  aria-label={`Option ${option.id} text`}
                  value={option.text}
                  onChange={(event) =>
                    patch({
                      options: value.options.map((item) =>
                        item.id === option.id ? { ...item, text: event.target.value } : item
                      ),
                    })
                  }
                  className="h-10 flex-1 rounded-[4px] border border-slate-300 bg-white px-3 text-[14px] hover:border-slate-800 focus:border-primary-500 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label={`Remove option ${option.id}`}
                  onClick={() => removeOption(option.id)}
                  className="flex size-8 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#fdeef1] hover:text-[#b12a41]"
                >
                  <Minus size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addOption}
            className="mt-3 inline-flex h-8 items-center gap-1 rounded-[4px] px-2 text-[13px] font-medium text-primary-500 hover:bg-primary-50"
          >
            <Plus size={14} /> Add option
          </button>
        </div>
      )}

      {value.question_type === "TRUE_FALSE_NOT_GIVEN" && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Correct answer</p>
          <div className="flex gap-4">
            {TRUE_FALSE_VALUES.map((answer) => (
              <label key={answer} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tfng-answer"
                  aria-label={`Correct answer: ${answer}`}
                  checked={selected.includes(answer)}
                  onChange={() => patch({ accepted_answers: [[answer]] })}
                />
                {answer}
              </label>
            ))}
          </div>
        </div>
      )}

      {usesBlanks && (
        <div>
          <div className="mb-2 flex items-center gap-3">
            <p className="text-sm font-medium text-slate-700">
              Blanks: {value.column_answer}
            </p>
            <button
              type="button"
              aria-label="Add a blank"
              onClick={() => setBlankCount((value.column_answer ?? 1) + 1)}
              className="h-10 rounded-[4px] border border-slate-300 bg-white px-2 text-[14px]"
            >
              <Plus size={14} />
            </button>
            <button
              type="button"
              aria-label="Remove a blank"
              onClick={() => setBlankCount((value.column_answer ?? 1) - 1)}
              className="h-10 rounded-[4px] border border-slate-300 bg-white px-2 text-[14px]"
            >
              <Minus size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {value.accepted_answers.map((group, index) => (
              <AnswerVariantsInput
                key={`${value.question_type}-${index}`}
                index={index}
                variants={group}
                onCommit={(next) =>
                  patch({
                    accepted_answers: value.accepted_answers.map((item, itemIndex) =>
                      itemIndex === index ? next : item
                    ),
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {value.question_type === "MAP_LABELING" && (
        <div>
          <label htmlFor="map-image" className="mb-1 block text-sm font-medium text-slate-700">
            Map image URL
          </label>
          <input
            id="map-image"
            value={value.attachments.find((item) => item.type === "image")?.path ?? ""}
            onChange={(event) =>
              patch({
                attachments: event.target.value
                  ? [{ type: "image", path: event.target.value }]
                  : [],
              })
            }
            className="h-10 w-full rounded-[4px] border border-slate-300 bg-white px-3 text-[14px] hover:border-slate-800 focus:border-primary-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
