import React from "react";
import { Clock } from "lucide-react";

interface ReviewTimerBoxProps {
  timeLeftStr: string;
}

export function ReviewTimerBox({ timeLeftStr }: ReviewTimerBoxProps) {
  return (
    <div className="bg-slate-900 p-6 rounded-[24px] border border-slate-800 shadow-xl shadow-slate-900/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 blur-2xl rounded-full group-hover:bg-brand-cyan/20 transition-colors duration-700"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Clock size={16} className="animate-pulse text-brand-cyan" />
          <span className="text-xs font-bold uppercase tracking-wider">Sisa Waktu</span>
        </div>
        <h2 className="text-4xl font-mono font-black text-white tracking-widest">
          {timeLeftStr}
        </h2>
        <p className="text-xs text-slate-500 mt-2">Selesai otomatis saat waktu habis.</p>
      </div>
    </div>
  );
}