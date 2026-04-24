"use client";

import React, { useMemo } from "react";
import { cn } from "@/src/libs/utils";

interface ILongEssayProps {
  questionId: number;
  question: string;
  value: string;
  onChange: (value: string) => void;
  minWords?: number; // Target minimal kata (contoh: 150 atau 250)
}

export function LongEssay({
  questionId,
  question,
  value,
  onChange,
  minWords = 250,
}: ILongEssayProps) {
  
  // Fungsi penghitung kata yang akurat (mengabaikan spasi ganda)
  const wordCount = useMemo(() => {
    if (!value.trim()) return 0;
    return value.trim().split(/\s+/).length;
  }, [value]);

  const isWordCountMet = wordCount >= minWords;

  return (
    <div className="space-y-4">
      {/* 1. PERTANYAAN / PROMPT WRITING */}
      <div className="font-semibold text-slate-800 text-base leading-relaxed flex gap-3 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <span className="font-black text-brand-purple shrink-0">{questionId}.</span>
        <div 
          className="prose prose-slate max-w-none text-slate-700 w-full"
          dangerouslySetInnerHTML={{ __html: question }} 
        />
      </div>

      {/* 2. TEXTAREA WRITING */}
      <div className="relative group">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start writing your essay here..."
          className={cn(
            "w-full min-h-[400px] p-5 bg-white border-2 rounded-2xl outline-none transition-all text-slate-800 leading-relaxed resize-y custom-scrollbar",
            value ? "border-brand-purple/30 bg-slate-50/50" : "border-slate-200 hover:border-slate-300",
            "focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 focus:bg-white"
          )}
        />
        
        {/* 3. WORD COUNTER INDICATOR */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Word Count:</span>
          <span className={cn(
            "text-sm font-black",
            isWordCountMet ? "text-emerald-600" : "text-orange-500"
          )}>
            {wordCount} <span className="text-slate-400 font-medium">/ {minWords} min</span>
          </span>
        </div>
      </div>
    </div>
  );
}