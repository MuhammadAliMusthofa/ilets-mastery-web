"use client";

import { useState } from "react";
import { QUICK_CHECK_PASS, passMarkOf } from "../constants";

export interface QuickCheckScore {
  correct: number;
  answered: number;
  total: number;
}

/**
 * Syarat lulus quick check sebelum sebuah langkah boleh ditandai selesai.
 * Menyimpan skor terakhir, menghitung nilai minimalnya, dan menyediakan
 * `attempt` sebagai kunci remount agar "coba lagi" mengosongkan jawaban.
 */
export function useQuickCheckGate(total: number) {
  const [attempt, setAttempt] = useState(0);
  const [score, setScore] = useState<QuickCheckScore | null>(null);

  const needed = passMarkOf(total);
  const answeredAll = total > 0 && score !== null && score.answered === total;
  const passed = total === 0 || (score !== null && score.correct >= needed);
  const missing = score ? Math.max(0, needed - score.correct) : needed;

  return {
    attempt,
    score,
    /** Jawaban benar minimal yang harus dicapai. */
    needed,
    /** Berapa jawaban benar lagi yang masih kurang. */
    missing,
    answeredAll,
    passed,
    /** Sudah menjawab semuanya tetapi belum mencapai nilai minimal. */
    failed: answeredAll && !passed,
    percent: Math.round(QUICK_CHECK_PASS * 100),
    onScore: (correct: number, answered: number) => setScore({ correct, answered, total }),
    retry: () => {
      setScore(null);
      setAttempt((value) => value + 1);
    },
  };
}
