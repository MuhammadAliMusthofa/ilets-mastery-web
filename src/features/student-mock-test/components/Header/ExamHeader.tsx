import React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ExamHeaderProps {
  timeLeft: number;
}

export function ExamHeader({ timeLeft }: ExamHeaderProps) {
  const router = useRouter();

  // Format detik jadi MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <header className="h-16 bg-slate-900 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-brand-purple/20 text-brand-cyan px-2 sm:px-3 py-1 rounded-md font-bold text-xs sm:text-sm border border-brand-cyan/30 uppercase tracking-wider">
          Reading
        </div>
        <h1 className="font-semibold text-slate-200 text-sm sm:text-base hidden sm:block">
          Cambridge 18 - Section 1
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 bg-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-700">
        <Clock size={16} className="text-brand-cyan animate-pulse" />
        <span className="font-mono text-lg sm:text-xl font-bold tracking-wider text-white">
          {formatTime(timeLeft)}
        </span>
      </div>

      <Button onClick={() => router.back()} variant="destructive" size="sm" className="font-bold">
        Akhiri Tes
      </Button>
    </header>
  );
}