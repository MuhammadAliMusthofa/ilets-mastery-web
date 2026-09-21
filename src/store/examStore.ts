import { create } from "zustand";
import type { AnswerInput, AttemptSession } from "@/src/models/ielts";

interface ExamState {
  attemptId: number | null;
  answers: Record<number, string[]>;
  flagged: Record<number, boolean>;
  /** Id soal yang berubah sejak autosave terakhir. */
  dirty: Record<number, true>;

  hydrate: (session: AttemptSession) => void;
  setAnswer: (questionId: number, value: string[]) => void;
  toggleFlag: (questionId: number) => void;
  /** Mengambil jawaban yang berubah lalu menandainya bersih. */
  takeDirty: () => AnswerInput[];
  /** Mengembalikan tanda kotor bila autosave gagal, agar dicoba lagi. */
  restoreDirty: (items: AnswerInput[]) => void;
  allAnswers: () => AnswerInput[];
  reset: () => void;
}

export const useExamStore = create<ExamState>()((set, get) => ({
  attemptId: null,
  answers: {},
  flagged: {},
  dirty: {},

  hydrate: (session) => {
    // Jangan menimpa jawaban lokal yang belum tersimpan milik attempt yang sama.
    if (get().attemptId === session.attempt_id) {
      return;
    }
    set({ attemptId: session.attempt_id, answers: { ...session.answers }, flagged: {}, dirty: {} });
  },

  setAnswer: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
      dirty: { ...state.dirty, [questionId]: true },
    })),

  toggleFlag: (questionId) =>
    set((state) => ({ flagged: { ...state.flagged, [questionId]: !state.flagged[questionId] } })),

  takeDirty: () => {
    const { dirty, answers } = get();
    const items = Object.keys(dirty).map((id) => ({
      question_id: Number(id),
      answer: answers[Number(id)] ?? [],
    }));
    set({ dirty: {} });
    return items;
  },

  restoreDirty: (items) =>
    set((state) => {
      const dirty = { ...state.dirty };
      for (const item of items) {
        dirty[item.question_id] = true;
      }
      return { dirty };
    }),

  allAnswers: () =>
    Object.entries(get().answers).map(([id, answer]) => ({ question_id: Number(id), answer })),

  reset: () => set({ attemptId: null, answers: {}, flagged: {}, dirty: {} }),
}));

/** Soal dianggap terjawab bila ada minimal satu isian yang tidak kosong. */
export const isAnswered = (value: string[] | undefined): boolean =>
  !!value && value.some((part) => part !== undefined && part !== null && part.trim() !== "");
