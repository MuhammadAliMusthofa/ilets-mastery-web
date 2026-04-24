"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/src/libs/utils";

interface ExamTimerProps {
  initialSeconds: number; // Waktu ujian dalam detik (misal: 3600 = 1 jam)
  onTimeUp?: () => void; // Fungsi yang dipanggil otomatis pas timer abis
}

export function ExamTimer({ initialSeconds, onTimeUp }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    // Kalau waktu habis, panggil fungsi onTimeUp & hentikan interval
    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    // Jalankan timer mundur setiap 1 detik
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  // Fungsi buat format detik jadi HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    const pad = (num: number) => num.toString().padStart(2, "0");

    // Kalo lebih dari sejam, tampilin format HH:MM:SS, kalo kurang format MM:SS aja
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  // Logic buat ngubah warna jadi merah berkedip kalau sisa waktu < 5 menit (300 detik)
  const isTimeCritical = timeLeft > 0 && timeLeft <= 300;
  const isTimeUp = timeLeft <= 0;

  return (
    <div className={cn(
      "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-colors duration-500",
      // Warna berubah sesuai sisa waktu
      isTimeUp 
        ? "bg-red-50 border-red-200 text-red-600" 
        : isTimeCritical
        ? "bg-red-500 border-red-600 text-white animate-pulse"
        : "bg-slate-800 border-slate-700 text-white"
    )}>
      <Clock size={16} className={cn(
        "shrink-0",
        !isTimeUp && !isTimeCritical && "text-brand-cyan"
      )} />
      
      <span className={cn(
        "font-mono text-lg sm:text-xl font-bold tracking-wider",
        isTimeUp && "text-red-600 font-sans tracking-normal text-base"
      )}>
        {isTimeUp ? "Waktu Habis!" : formatTime(timeLeft)}
      </span>
    </div>
  );
}