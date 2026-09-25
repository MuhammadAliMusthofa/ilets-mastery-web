"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, RotateCcw, X } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { Button } from "@/components/ui/button";
import type { CheckQuestion as BaseQuestion } from "@/src/models/basic";

export type CheckQuestion = BaseQuestion & { source?: string };

type ResultHandler = (correct: boolean) => void;

// ---------------------------------------------------------------------------
// Utilitas
// ---------------------------------------------------------------------------

/** Normalisasi jawaban ketik: huruf kecil, apostrof lurus, spasi rapat, tanpa tanda baca di akhir. */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?,;:]+$/, "");

/** Acak deterministik (dari teks soal) supaya urutan kartu tidak berubah tiap render. */
const seededShuffle = <T,>(items: T[], seedText: string): T[] => {
  let seed = [...seedText].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  // Jangan pernah menyajikan urutan yang sudah benar.
  if (result.length > 1 && result.every((item, index) => item === items[index])) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
};

function Feedback({
  correct,
  why,
  reveal,
  inset = true,
}: {
  correct: boolean;
  why: string;
  reveal?: React.ReactNode;
  /** false bila induknya sudah menjorok (sm:pl-10). */
  inset?: boolean;
}) {
  return (
    <div
      role="status"
      className={cn(
        "mt-4 rounded-2xl px-4 py-3 text-[14px] leading-relaxed",
        inset && "sm:ml-10",
        correct ? "bg-[#dcf7ea] text-[#00613a]" : "bg-[#fdeef1] text-[#8a1f33]"
      )}
    >
      <p>
        <span className="font-semibold">{correct ? "Correct. " : "Not quite. "}</span>
        {why}
      </p>
      {!correct && reveal && <div className="mt-2 text-slate-800">{reveal}</div>}
    </div>
  );
}

function CheckButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <Button variant="dark" shape="pill" size="sm" disabled={disabled} onClick={onClick}>
      <Check size={14} strokeWidth={3} /> Check
    </Button>
  );
}

const useDndSensors = (sortable: boolean) =>
  useSensors(
    // Jarak minimal 6px: ketukan biasa tetap dihitung sebagai klik, bukan seret.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, sortable ? { coordinateGetter: sortableKeyboardCoordinates } : undefined)
  );

// ---------------------------------------------------------------------------
// Pilihan ganda
// ---------------------------------------------------------------------------

function ChoiceQuestion({
  question,
  index,
  onResult,
}: {
  question: Extract<CheckQuestion, { type: "choice" }>;
  index: number;
  onResult: ResultHandler;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const revealed = picked !== null;

  return (
    <>
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
                name={`check-${index}`}
                className="sr-only"
                checked={isPicked}
                disabled={revealed}
                onChange={() => {
                  if (revealed) return;
                  setPicked(optionIndex);
                  onResult(optionIndex === question.answer);
                }}
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
      {revealed && <Feedback correct={picked === question.answer} why={question.why} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// Ketik jawaban
// ---------------------------------------------------------------------------

function TypeQuestion({
  question,
  index,
  onResult,
}: {
  question: Extract<CheckQuestion, { type: "type" }>;
  index: number;
  onResult: ResultHandler;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const accepted = useMemo(() => question.answers.map(normalize), [question.answers]);
  const [before, after] = question.question.includes("___") ? question.question.split("___") : [question.question, ""];
  const inputId = `type-${index}`;

  const check = () => {
    if (result !== null || !value.trim()) return;
    const correct = accepted.includes(normalize(value));
    setResult(correct);
    onResult(correct);
  };

  return (
    <>
      <div className="mt-4 sm:pl-10">
        <p className="text-[16px] leading-[2.4] text-slate-900">
          {before}
          <label htmlFor={inputId} className="sr-only">
            Your answer
          </label>
          <input
            id={inputId}
            value={value}
            disabled={result !== null}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && check()}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="type here"
            size={Math.max(8, value.length + 2)}
            className={cn(
              "mx-1 inline-block h-10 rounded-xl border-2 bg-white px-3 text-center text-[16px] font-medium text-slate-900 transition-colors focus:outline-none",
              result === null && "border-slate-300 focus:border-primary-500",
              result === true && "border-[#00c875] bg-[#dcf7ea]",
              result === false && "border-[#d83a52] bg-[#fdeef1]"
            )}
          />
          {after}
        </p>
        {result === null && (
          <div className="mt-3">
            <CheckButton disabled={!value.trim()} onClick={check} />
          </div>
        )}
      </div>
      {result !== null && (
        <Feedback
          correct={result}
          why={question.why}
          reveal={
            <>
              Accepted answer{question.answers.length > 1 ? "s" : ""}:{" "}
              <span className="font-semibold">{question.answers.join(" / ")}</span>
            </>
          }
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Susun kalimat (drag & drop, atau ketuk)
// ---------------------------------------------------------------------------

type Tile = { id: string; text: string };

function WordTile({
  tile,
  onTap,
  disabled,
  tone,
}: {
  tile: Tile;
  onTap: () => void;
  disabled: boolean;
  tone?: "right" | "wrong";
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tile.id, disabled });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onTap}
      disabled={disabled}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "flex h-11 touch-none select-none items-center rounded-xl border-2 border-b-4 bg-white px-3.5 text-[15px] font-medium text-slate-900",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
        !disabled && "cursor-grab border-slate-200 hover:border-slate-400 active:cursor-grabbing",
        isDragging && "opacity-30",
        tone === "right" && "border-[#00c875] bg-[#dcf7ea]",
        tone === "wrong" && "border-[#d83a52] bg-[#fdeef1]"
      )}
    >
      {tile.text}
    </button>
  );
}

function TileZone({
  id,
  tiles,
  children,
  className,
  label,
}: {
  id: string;
  tiles: Tile[];
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <SortableContext id={id} items={tiles.map((tile) => tile.id)} strategy={horizontalListSortingStrategy}>
      <div
        ref={setNodeRef}
        aria-label={label}
        className={cn("flex min-h-[60px] flex-wrap items-center gap-2 rounded-2xl p-2.5 transition-colors", className, isOver && "ring-2 ring-primary-500")}
      >
        {children}
      </div>
    </SortableContext>
  );
}

function OrderQuestion({
  question,
  onResult,
}: {
  question: Extract<CheckQuestion, { type: "order" }>;
  onResult: ResultHandler;
}) {
  const tiles = useMemo<Tile[]>(() => question.words.map((text, i) => ({ id: `w${i}`, text })), [question.words]);
  const byId = useMemo(() => new Map(tiles.map((tile) => [tile.id, tile])), [tiles]);
  const initialBank = useMemo(() => seededShuffle(tiles.map((tile) => tile.id), question.question + question.words.join(" ")), [tiles, question]);

  const [bank, setBank] = useState<string[]>(initialBank);
  const [answer, setAnswer] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const sensors = useDndSensors(true);
  const locked = result !== null;

  const containerOf = (id: string) => (answer.includes(id) ? "answer" : bank.includes(id) ? "bank" : id);

  const moveTo = (id: string, target: "answer" | "bank", overIndex?: number) => {
    const from = containerOf(id);
    if (from === target) return;
    const insert = (list: string[]) => {
      const next = [...list];
      next.splice(overIndex ?? next.length, 0, id);
      return next;
    };
    if (target === "answer") {
      setBank((list) => list.filter((item) => item !== id));
      setAnswer(insert);
    } else {
      setAnswer((list) => list.filter((item) => item !== id));
      setBank(insert);
    }
  };

  const onDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  // Pindah antar zona saat kartu melewati zona lain.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeKey = String(active.id);
    const overKey = String(over.id);
    const from = containerOf(activeKey);
    const to = overKey === "answer" || overKey === "bank" ? overKey : containerOf(overKey);
    if (from === to || (to !== "answer" && to !== "bank")) return;
    const list = to === "answer" ? answer : bank;
    const overIndex = list.indexOf(overKey);
    moveTo(activeKey, to, overIndex >= 0 ? overIndex : undefined);
  };

  // Urutkan ulang di dalam zona yang sama.
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const activeKey = String(active.id);
    const overKey = String(over.id);
    const zone = containerOf(activeKey);
    if (zone !== containerOf(overKey)) return;
    const setter = zone === "answer" ? setAnswer : setBank;
    setter((list) => {
      const from = list.indexOf(activeKey);
      const to = list.indexOf(overKey);
      return from < 0 || to < 0 ? list : arrayMove(list, from, to);
    });
  };

  const check = () => {
    const sentence = answer.map((id) => byId.get(id)?.text).join(" ");
    const correct = sentence === question.words.join(" ");
    setResult(correct);
    onResult(correct);
  };

  const reset = () => {
    setBank(initialBank);
    setAnswer([]);
  };

  return (
    <div className="mt-4 sm:pl-10">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <p className="mb-2 text-[13px] text-slate-500">Your sentence</p>
        <TileZone
          id="answer"
          tiles={answer.map((id) => byId.get(id) as Tile)}
          label="Your sentence"
          className={cn(
            "border-2 border-dashed",
            result === null && "border-slate-300 bg-slate-50",
            result === true && "border-[#00c875] bg-[#dcf7ea]",
            result === false && "border-[#d83a52] bg-[#fdeef1]"
          )}
        >
          {answer.length === 0 && <span className="px-2 text-[14px] text-slate-400">Drag or tap words to build the sentence</span>}
          {answer.map((id) => (
            <WordTile key={id} tile={byId.get(id) as Tile} disabled={locked} onTap={() => !locked && moveTo(id, "bank")} />
          ))}
        </TileZone>

        {!locked && (
          <>
            <p className="mb-2 mt-4 text-[13px] text-slate-500">Word bank</p>
            <TileZone id="bank" tiles={bank.map((id) => byId.get(id) as Tile)} label="Word bank" className="bg-white">
              {bank.length === 0 && <span className="px-2 text-[14px] text-slate-400">All words used</span>}
              {bank.map((id) => (
                <WordTile key={id} tile={byId.get(id) as Tile} disabled={locked} onTap={() => moveTo(id, "answer")} />
              ))}
            </TileZone>
          </>
        )}

        <DragOverlay>
          {activeId ? (
            <span className="flex h-11 items-center rounded-xl border-2 border-b-4 border-slate-900 bg-white px-3.5 text-[15px] font-medium text-slate-900 shadow-lg">
              <GripVertical size={14} className="mr-1 text-slate-400" aria-hidden="true" />
              {byId.get(activeId)?.text}
            </span>
          ) : null}
        </DragOverlay>
      </DndContext>

      {result === null && (
        <div className="mt-4 flex flex-wrap gap-2">
          <CheckButton disabled={bank.length > 0} onClick={check} />
          {answer.length > 0 && (
            <Button variant="ghost" shape="pill" size="sm" onClick={reset}>
              <RotateCcw size={14} /> Reset
            </Button>
          )}
        </div>
      )}
      {result !== null && (
        <Feedback
          correct={result}
          why={question.why}
          inset={false}
          reveal={
            <>
              Correct order: <span className="font-semibold">{question.words.join(" ")}</span>
            </>
          }
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kelompokkan (drag & drop ke kotak, atau ketuk kata lalu ketuk kotak)
// ---------------------------------------------------------------------------

function SortChip({
  id,
  text,
  selected,
  disabled,
  tone,
  onTap,
}: {
  id: string;
  text: string;
  selected: boolean;
  disabled: boolean;
  tone?: "right" | "wrong";
  onTap: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onTap}
      disabled={disabled}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
      aria-pressed={selected}
      className={cn(
        "relative z-10 flex h-10 touch-none select-none items-center gap-1.5 rounded-full border-2 bg-white px-3.5 text-[14px] font-medium text-slate-900",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
        !disabled && "cursor-grab border-slate-200 hover:border-slate-400 active:cursor-grabbing",
        selected && "border-primary-500 bg-primary-50",
        isDragging && "z-50 shadow-lg",
        tone === "right" && "border-[#00c875] bg-[#dcf7ea]",
        tone === "wrong" && "border-[#d83a52] bg-[#fdeef1]"
      )}
    >
      {tone === "right" && <Check size={13} strokeWidth={3} className="text-[#007a47]" aria-hidden="true" />}
      {tone === "wrong" && <X size={13} strokeWidth={3} className="text-[#b12a41]" aria-hidden="true" />}
      {text}
    </button>
  );
}

function Bucket({
  id,
  label,
  onTap,
  canDrop,
  children,
}: {
  id: string;
  label: string;
  onTap: () => void;
  canDrop: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[120px] flex-col rounded-2xl border-2 border-dashed p-3 transition-colors",
        isOver ? "border-primary-500 bg-primary-50" : "border-slate-300 bg-slate-50"
      )}
    >
      <button
        type="button"
        onClick={onTap}
        disabled={!canDrop}
        className="mb-2 self-start rounded-full bg-slate-900 px-3 py-1 text-[13px] font-medium text-white disabled:bg-slate-700 enabled:hover:bg-primary-500"
        aria-label={canDrop ? `Put the selected word in ${label}` : label}
      >
        {label}
      </button>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function SortQuestion({
  question,
  onResult,
}: {
  question: Extract<CheckQuestion, { type: "sort" }>;
  onResult: ResultHandler;
}) {
  const items = useMemo(() => question.items.map((item, i) => ({ ...item, id: `s${i}` })), [question.items]);
  const poolOrder = useMemo(() => seededShuffle(items.map((item) => item.id), question.question), [items, question.question]);

  // null = masih di kumpulan kata; angka = indeks kotak.
  const [placed, setPlaced] = useState<Record<string, number | null>>(() => Object.fromEntries(items.map((item) => [item.id, null])));
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const sensors = useDndSensors(false);
  const locked = result !== null;

  const place = (id: string, bucket: number | null) => {
    setPlaced((current) => ({ ...current, [id]: bucket }));
    setSelected(null);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || locked) return;
    const target = String(over.id);
    place(String(active.id), target === "pool" ? null : Number(target.replace("bucket-", "")));
  };

  const pool = poolOrder.filter((id) => placed[id] === null);
  const toneOf = (id: string) => {
    if (!locked) return undefined;
    const item = items.find((entry) => entry.id === id);
    return item && placed[id] === item.bucket ? "right" : "wrong";
  };

  const check = () => {
    const correct = items.every((item) => placed[item.id] === item.bucket);
    setResult(correct);
    onResult(correct);
  };

  const chip = (id: string) => {
    const item = items.find((entry) => entry.id === id)!;
    return (
      <SortChip
        key={id}
        id={id}
        text={item.text}
        selected={selected === id}
        disabled={locked}
        tone={toneOf(id)}
        onTap={() => {
          if (locked) return;
          // Kata yang sudah di kotak: ketuk untuk mengembalikannya ke kumpulan.
          if (placed[id] !== null) place(id, null);
          else setSelected((current) => (current === id ? null : id));
        }}
      />
    );
  };

  return (
    <div className="mt-4 sm:pl-10">
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {!locked && (
          <>
            <PoolZone>
              {pool.length === 0 && <span className="px-2 text-[14px] text-slate-400">Every word is placed. Check your answer.</span>}
              {pool.map(chip)}
            </PoolZone>
            <p className="mb-2 mt-4 text-[13px] text-slate-500">
              Drag each word into a box, or tap a word and then tap the box name.
            </p>
          </>
        )}
        <div className={cn("grid gap-3", question.buckets.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          {question.buckets.map((label, bucketIndex) => (
            <Bucket
              key={label}
              id={`bucket-${bucketIndex}`}
              label={label}
              canDrop={selected !== null && !locked}
              onTap={() => selected && place(selected, bucketIndex)}
            >
              {items.filter((item) => placed[item.id] === bucketIndex).map((item) => chip(item.id))}
            </Bucket>
          ))}
        </div>
      </DndContext>

      {result === null && (
        <div className="mt-4">
          <CheckButton disabled={pool.length > 0} onClick={check} />
        </div>
      )}
      {result !== null && (
        <Feedback
          correct={result}
          why={question.why}
          inset={false}
          reveal={
            <ul className="space-y-1">
              {question.buckets.map((label, bucketIndex) => (
                <li key={label}>
                  <span className="font-semibold">{label}:</span>{" "}
                  {question.items
                    .filter((item) => item.bucket === bucketIndex)
                    .map((item) => item.text)
                    .join(", ")}
                </li>
              ))}
            </ul>
          }
        />
      )}
    </div>
  );
}

function PoolZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });
  return (
    <div
      ref={setNodeRef}
      aria-label="Words to sort"
      className={cn("flex min-h-[60px] flex-wrap items-center gap-2 rounded-2xl bg-white p-2.5", isOver && "ring-2 ring-primary-500")}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kuis
// ---------------------------------------------------------------------------

const KIND_LABEL: Record<CheckQuestion["type"], string> = {
  choice: "Choose",
  type: "Type the missing word",
  order: "Build the sentence",
  sort: "Sort",
};

/**
 * Kuis cek cepat: pilihan ganda, ketik jawaban, susun kalimat, dan kelompokkan.
 * Setiap soal dinilai sekali (saat dijawab/dicek), lalu menampilkan alasannya.
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
  const [results, setResults] = useState<Record<number, boolean>>({});

  const record = (questionIndex: number) => (correct: boolean) => {
    if (results[questionIndex] !== undefined) return;
    const next = { ...results, [questionIndex]: correct };
    setResults(next);
    const values = Object.values(next);
    onScore?.(values.filter(Boolean).length, values.length, questions.length);
    onAnswer?.(questionIndex, correct);
  };

  return (
    <ol className={cn("space-y-5", className)}>
      {questions.map((question, questionIndex) => {
        // Soal lama tanpa "type" diperlakukan sebagai pilihan ganda.
        const kind = (question as { type?: CheckQuestion["type"] }).type ?? "choice";
        const normalized = { ...question, type: kind } as CheckQuestion;
        return (
          <li key={questionIndex} className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex gap-3">
              <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[13px] text-white">
                {questionIndex + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <span className="mb-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {KIND_LABEL[kind]}
                </span>
                {kind !== "type" && <p className="text-[16px] font-medium text-slate-900">{question.question}</p>}
                {question.source && <p className="mt-0.5 text-[13px] text-slate-500">From: {question.source}</p>}
              </div>
            </div>

            {normalized.type === "choice" && <ChoiceQuestion question={normalized} index={questionIndex} onResult={record(questionIndex)} />}
            {normalized.type === "type" && <TypeQuestion question={normalized} index={questionIndex} onResult={record(questionIndex)} />}
            {normalized.type === "order" && <OrderQuestion question={normalized} onResult={record(questionIndex)} />}
            {normalized.type === "sort" && <SortQuestion question={normalized} onResult={record(questionIndex)} />}
          </li>
        );
      })}
    </ol>
  );
}
