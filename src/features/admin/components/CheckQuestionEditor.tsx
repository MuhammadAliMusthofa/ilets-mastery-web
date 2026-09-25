"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/src/libs/utils";
import type { CheckQuestion } from "@/src/models/basic";
import { CHECK_TYPE_LABELS, type CheckType } from "@/src/models/admin-content";
import { Field, IconAction } from "./AdminUI";
import { fieldClass, textareaClass } from "./fields";

/*
 * Editor satu soal cek cepat. Bentuk tiap tipe sama persis dengan yang
 * dirender QuickCheck di sisi siswa (lihat models/basic.ts).
 */

export const CHECK_TYPES = Object.keys(CHECK_TYPE_LABELS) as CheckType[];

export const CHECK_TYPE_HINT: Record<CheckType, string> = {
  choice: "Students pick one correct option.",
  type: "Students type the missing word into the blank.",
  order: "Students drag shuffled words into the right order.",
  sort: "Students drag words into 2 or 3 groups.",
};

export const blankQuestion = (type: CheckType, keep?: { question: string; why: string }): CheckQuestion => {
  const question = keep?.question ?? "";
  const why = keep?.why ?? "";
  switch (type) {
    case "choice":
      return { type, question, options: ["", ""], answer: 0, why };
    case "type":
      return { type, question, answers: [""], why };
    case "order":
      return { type, question: question || "Put the words in the right order.", words: [], why };
    case "sort":
      return { type, question, buckets: ["", ""], items: [{ text: "", bucket: 0 }, { text: "", bucket: 1 }], why };
  }
};

const addButtonClass =
  "inline-flex h-8 items-center gap-1 rounded-md px-2 text-[13px] font-medium text-primary-500 hover:bg-primary-50 disabled:pointer-events-none disabled:text-slate-300";

const removeButtonClass =
  "flex size-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-[#fdeef1] hover:text-[#b12a41] disabled:pointer-events-none disabled:opacity-30";

// ---------------------------------------------------------------------------
// Per tipe
// ---------------------------------------------------------------------------

function ChoiceFields({
  value,
  onChange,
  id,
}: {
  value: Extract<CheckQuestion, { type: "choice" }>;
  onChange: (next: CheckQuestion) => void;
  id: string;
}) {
  const setOption = (index: number, text: string) =>
    onChange({ ...value, options: value.options.map((option, i) => (i === index ? text : option)) });

  const removeOption = (index: number) =>
    onChange({
      ...value,
      options: value.options.filter((_option, i) => i !== index),
      answer: value.answer === index ? 0 : value.answer > index ? value.answer - 1 : value.answer,
    });

  return (
    <fieldset>
      <legend className="mb-1.5 text-[13px] font-medium text-slate-700">Options — pick the correct one</legend>
      <div className="space-y-2">
        {value.options.map((option, index) => {
          const correct = value.answer === index;
          return (
            <div key={index} className="flex items-center gap-2">
              <label
                className={cn(
                  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-colors",
                  correct ? "border-[#00c875] bg-[#00c875] text-white" : "border-slate-300 text-transparent hover:border-slate-500"
                )}
                title={correct ? "Correct answer" : "Mark as correct"}
              >
                <input
                  type="radio"
                  name={`${id}-answer`}
                  className="sr-only"
                  checked={correct}
                  onChange={() => onChange({ ...value, answer: index })}
                  aria-label={`Option ${index + 1} is correct`}
                />
                <Check size={16} strokeWidth={3} />
              </label>
              <input
                aria-label={`Option ${index + 1}`}
                value={option}
                onChange={(event) => setOption(index, event.target.value)}
                className={cn(fieldClass, correct && "border-[#00c875]")}
                placeholder={`Option ${index + 1}`}
              />
              <button
                type="button"
                aria-label={`Remove option ${index + 1}`}
                className={removeButtonClass}
                disabled={value.options.length <= 2}
                onClick={() => removeOption(index)}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className={cn(addButtonClass, "mt-2")}
        disabled={value.options.length >= 6}
        onClick={() => onChange({ ...value, options: [...value.options, ""] })}
      >
        <Plus size={14} /> Add option
      </button>
    </fieldset>
  );
}

function TypeFields({
  value,
  onChange,
}: {
  value: Extract<CheckQuestion, { type: "type" }>;
  onChange: (next: CheckQuestion) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[13px] font-medium text-slate-700">Accepted answers</legend>
      <p className="mb-2 text-[12px] text-slate-500">
        Add every spelling you accept. Capital letters, curly apostrophes and a final full stop are ignored when checking.
      </p>
      <div className="space-y-2">
        {value.answers.map((answer, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              aria-label={`Accepted answer ${index + 1}`}
              value={answer}
              onChange={(event) => onChange({ ...value, answers: value.answers.map((item, i) => (i === index ? event.target.value : item)) })}
              className={fieldClass}
              placeholder={index === 0 ? "e.g. is" : "another accepted answer"}
            />
            <button
              type="button"
              aria-label={`Remove accepted answer ${index + 1}`}
              className={removeButtonClass}
              disabled={value.answers.length <= 1}
              onClick={() => onChange({ ...value, answers: value.answers.filter((_item, i) => i !== index) })}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={cn(addButtonClass, "mt-2")}
        disabled={value.answers.length >= 8}
        onClick={() => onChange({ ...value, answers: [...value.answers, ""] })}
      >
        <Plus size={14} /> Add accepted answer
      </button>
    </fieldset>
  );
}

/**
 * Kalimat benar diketik utuh lalu dipecah per spasi. Teks mentahnya disimpan
 * sendiri; kalau diturunkan dari `words.join(" ")`, spasi yang baru diketik
 * langsung hilang dan kata berikutnya tidak bisa diketik.
 */
function OrderFields({
  value,
  onChange,
  id,
}: {
  value: Extract<CheckQuestion, { type: "order" }>;
  onChange: (next: CheckQuestion) => void;
  id: string;
}) {
  const [raw, setRaw] = useState(() => value.words.join(" "));

  return (
    <div className="space-y-3">
      <Field
        label="Correct sentence"
        htmlFor={`${id}-words`}
        hint="Type the sentence in the right order. Each space makes a new word card; punctuation stays on its word."
      >
        <input
          id={`${id}-words`}
          value={raw}
          onChange={(event) => {
            setRaw(event.target.value);
            onChange({ ...value, words: event.target.value.split(/\s+/).filter(Boolean) });
          }}
          className={fieldClass}
          placeholder="She is reading a book."
        />
      </Field>
      {value.words.length > 0 && (
        <div>
          <p className="mb-1.5 text-[12px] text-slate-500">{value.words.length} word cards (students see them shuffled)</p>
          <div className="flex flex-wrap gap-1.5">
            {value.words.map((word, index) => (
              <span key={`${word}-${index}`} className="rounded-lg border border-b-[3px] border-slate-200 bg-white px-2.5 py-1 text-[13px] font-medium text-slate-800">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SortFields({
  value,
  onChange,
}: {
  value: Extract<CheckQuestion, { type: "sort" }>;
  onChange: (next: CheckQuestion) => void;
}) {
  const removeBucket = (index: number) =>
    onChange({
      ...value,
      buckets: value.buckets.filter((_bucket, i) => i !== index),
      // Kata di kelompok yang dihapus pindah ke kelompok pertama; indeks setelahnya bergeser.
      items: value.items.map((item) => ({
        ...item,
        bucket: item.bucket === index ? 0 : item.bucket > index ? item.bucket - 1 : item.bucket,
      })),
    });

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium text-slate-700">Groups</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {value.buckets.map((bucket, index) => (
            <div key={index} className="flex items-center gap-1">
              <input
                aria-label={`Group ${index + 1} name`}
                value={bucket}
                onChange={(event) => onChange({ ...value, buckets: value.buckets.map((item, i) => (i === index ? event.target.value : item)) })}
                className={fieldClass}
                placeholder={["Noun", "Verb", "Adjective"][index]}
              />
              <button
                type="button"
                aria-label={`Remove group ${index + 1}`}
                className={removeButtonClass}
                disabled={value.buckets.length <= 2}
                onClick={() => removeBucket(index)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={cn(addButtonClass, "mt-2")}
          disabled={value.buckets.length >= 3}
          onClick={() => onChange({ ...value, buckets: [...value.buckets, ""] })}
        >
          <Plus size={14} /> Add group
        </button>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium text-slate-700">Words and their correct group</legend>
        <div className="space-y-2">
          {value.items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                aria-label={`Word ${index + 1}`}
                value={item.text}
                onChange={(event) =>
                  onChange({ ...value, items: value.items.map((entry, i) => (i === index ? { ...entry, text: event.target.value } : entry)) })
                }
                className={fieldClass}
                placeholder="word"
              />
              <select
                aria-label={`Group for word ${index + 1}`}
                value={item.bucket}
                onChange={(event) =>
                  onChange({ ...value, items: value.items.map((entry, i) => (i === index ? { ...entry, bucket: Number(event.target.value) } : entry)) })
                }
                className={cn(fieldClass, "w-40 shrink-0")}
              >
                {value.buckets.map((bucket, bucketIndex) => (
                  <option key={bucketIndex} value={bucketIndex}>
                    {bucket || `Group ${bucketIndex + 1}`}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label={`Remove word ${index + 1}`}
                className={removeButtonClass}
                disabled={value.items.length <= 2}
                onClick={() => onChange({ ...value, items: value.items.filter((_entry, i) => i !== index) })}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={cn(addButtonClass, "mt-2")}
          disabled={value.items.length >= 12}
          onClick={() => onChange({ ...value, items: [...value.items, { text: "", bucket: 0 }] })}
        >
          <Plus size={14} /> Add word
        </button>
      </fieldset>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kartu soal
// ---------------------------------------------------------------------------

export function CheckQuestionEditor({
  id,
  index,
  total,
  value,
  problems,
  onChange,
  onMove,
  onRemove,
}: {
  /** Kunci stabil soal ini di editor (bukan id database). */
  id: string;
  index: number;
  total: number;
  value: CheckQuestion;
  problems: string[];
  onChange: (next: CheckQuestion) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const type = value.type;

  return (
    <article className={cn("rounded-xl border bg-white", problems.length > 0 ? "border-[#f3c2cb]" : "border-slate-200")}>
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
        <span className="tabular flex size-7 items-center justify-center rounded-full bg-slate-900 text-[12px] font-semibold text-white">{index + 1}</span>
        <label className="sr-only" htmlFor={`${id}-type`}>
          Question type
        </label>
        <select
          id={`${id}-type`}
          value={type}
          onChange={(event) => onChange(blankQuestion(event.target.value as CheckType, { question: value.question, why: value.why }))}
          className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[13px] font-medium text-slate-800 focus:border-primary-500 focus:outline-none"
        >
          {CHECK_TYPES.map((item) => (
            <option key={item} value={item}>
              {CHECK_TYPE_LABELS[item]}
            </option>
          ))}
        </select>
        <span className="hidden text-[12px] text-slate-500 md:inline">{CHECK_TYPE_HINT[type]}</span>
        <span className="ml-auto flex items-center gap-0.5">
          <IconAction label={`Move question ${index + 1} up`} disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp size={15} />
          </IconAction>
          <IconAction label={`Move question ${index + 1} down`} disabled={index === total - 1} onClick={() => onMove(1)}>
            <ArrowDown size={15} />
          </IconAction>
          <IconAction label={`Delete question ${index + 1}`} tone="danger" onClick={onRemove}>
            <Trash2 size={15} />
          </IconAction>
        </span>
      </header>

      <div className="space-y-4 p-4">
        <Field
          label={type === "type" ? "Sentence with a blank" : type === "order" ? "Instruction" : "Question"}
          htmlFor={`${id}-question`}
          hint={type === "type" ? "Write ___ (three underscores) where the student types, e.g. She ___ a teacher. (be)" : undefined}
        >
          <input
            id={`${id}-question`}
            value={value.question}
            onChange={(event) => onChange({ ...value, question: event.target.value })}
            className={fieldClass}
          />
        </Field>

        {type === "choice" && <ChoiceFields id={id} value={value} onChange={onChange} />}
        {type === "type" && <TypeFields value={value} onChange={onChange} />}
        {type === "order" && <OrderFields key={`${id}-order`} id={id} value={value} onChange={onChange} />}
        {type === "sort" && <SortFields value={value} onChange={onChange} />}

        <Field label="Why (shown after answering)" htmlFor={`${id}-why`} hint="One sentence that explains the rule behind the answer.">
          <textarea id={`${id}-why`} rows={2} value={value.why} onChange={(event) => onChange({ ...value, why: event.target.value })} className={textareaClass} />
        </Field>

        {problems.length > 0 && (
          <ul className="space-y-1 rounded-lg bg-[#fdeef1] px-3 py-2 text-[13px] text-[#8a1f33]">
            {problems.map((problem) => (
              <li key={problem}>• {problem}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Validasi (cermin aturan backend di lesson-content.ts)
// ---------------------------------------------------------------------------

export const questionProblems = (question: CheckQuestion): string[] => {
  const problems: string[] = [];
  if (!question.question.trim()) problems.push("Write the question.");
  if (!question.why.trim()) problems.push("Explain why the answer is correct.");

  switch (question.type) {
    case "choice": {
      const options = question.options.map((option) => option.trim());
      if (options.some((option) => !option)) problems.push("Fill in every option.");
      if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) problems.push("Options must be different.");
      if (question.answer >= options.length) problems.push("Mark the correct option.");
      break;
    }
    case "type":
      if (!question.question.includes("___")) problems.push("Add ___ where the student types.");
      if (question.answers.some((answer) => !answer.trim())) problems.push("Fill in or remove empty accepted answers.");
      break;
    case "order":
      if (question.words.length < 2) problems.push("The sentence needs at least 2 words.");
      if (question.words.length > 14) problems.push("Keep the sentence to 14 words or fewer.");
      break;
    case "sort": {
      if (question.buckets.some((bucket) => !bucket.trim())) problems.push("Name every group.");
      if (question.items.some((item) => !item.text.trim())) problems.push("Fill in or remove empty words.");
      question.buckets.forEach((bucket, index) => {
        if (!question.items.some((item) => item.bucket === index)) problems.push(`Group ${bucket.trim() || index + 1} has no words.`);
      });
      break;
    }
  }
  return problems;
};

/** Rapikan spasi sebelum dikirim. */
export const cleanQuestion = (question: CheckQuestion): CheckQuestion => {
  const base = { question: question.question.trim(), why: question.why.trim() };
  switch (question.type) {
    case "choice":
      return { ...question, ...base, options: question.options.map((option) => option.trim()) };
    case "type":
      return { ...question, ...base, answers: question.answers.map((answer) => answer.trim()) };
    case "order":
      return { ...question, ...base };
    case "sort":
      return {
        ...question,
        ...base,
        buckets: question.buckets.map((bucket) => bucket.trim()),
        items: question.items.map((item) => ({ ...item, text: item.text.trim() })),
      };
  }
};
