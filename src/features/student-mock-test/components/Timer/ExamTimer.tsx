"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/src/libs/utils";

interface ExamTimerProps {
  /** Sisa waktu dalam detik, dihitung dari jam server. */
  initialSeconds: number;
  /** Dipanggil sekali saat waktu mencapai nol. */
  onTimeUp?: () => void;
}

const pad = (num: number) => num.toString().padStart(2, "0");

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/** Readout sisa waktu: angka lebar tetap, merah di lima menit terakhir. */
export function ExamTimer({ initialSeconds, onTimeUp }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const isCritical = timeLeft > 0 && timeLeft <= 300;
  const isTimeUp = timeLeft <= 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[4px] px-3 py-1",
        isCritical || isTimeUp ? "bg-[#fdeef1] text-[#b12a41]" : "text-slate-800"
      )}
      role="timer"
      aria-label={isTimeUp ? "Time's up" : `Time left ${formatTime(timeLeft)}`}
    >
      <Clock size={16} className={isCritical || isTimeUp ? "text-[#b12a41]" : "text-slate-500"} />
      <span className="tabular text-[20px] font-semibold leading-none">
        {isTimeUp ? "Time's up" : formatTime(timeLeft)}
      </span>
    </div>
  );
}
