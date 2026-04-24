"use client";

import React from "react";
import { cn } from "@/src/libs/utils";

interface IShortEssayProps {
  questionId: number; // Biar seragam ada nomor soalnya
  question: string;
  value: string[];
  onChange: (value: string, index: number) => void;
  column?: number;
}

export function ShortEssay({
  questionId,
  question,
  value,
  onChange,
  column = 1,
}: IShortEssayProps) {
  return (
    <div className="space-y-6">
      
      {/* 1. QUESTION TEXT (Stimulus/Instruksi Soal) */}
      <div className="font-semibold text-slate-800 text-base leading-relaxed flex gap-3">
        <span className="font-black text-brand-purple shrink-0">{questionId}.</span>
        
        {/* Render HTML untuk teks pertanyaan */}
        <div 
          className="prose prose-slate max-w-none text-slate-700 w-full"
          dangerouslySetInnerHTML={{ __html: question }} 
        />
      </div>

      {/* 2. INPUT FIELDS (Kotak Isian) */}
      <div className="space-y-4 pl-2 sm:pl-7">
        {Array.from({ length: column }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1.5 group">
            
            {/* Label opsional kalau isiannya lebih dari 1 */}
            {column > 1 && (
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 transition-colors group-focus-within:text-brand-purple">
                Answer {index + 1}
              </label>
            )}
            
            <input
              type="text"
              autoComplete="off"
              placeholder={column > 1 ? `Type answer ${index + 1}...` : "Type your answer here..."}
              value={value[index] || ""}
              onChange={(e) => onChange(e.target.value, index)}
              className={cn(
                "w-full px-4 py-3.5 bg-white border-2 rounded-xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 placeholder:font-normal",
                // State kalau input lagi kosong vs ada isinya
                value[index] ? "border-brand-purple/30 bg-brand-purple/5" : "border-slate-100 hover:border-slate-200",
                // State kalau lagi di-klik (focus)
                "focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 focus:bg-white"
              )}
            />
          </div>
        ))}
      </div>

    </div>
  );
}