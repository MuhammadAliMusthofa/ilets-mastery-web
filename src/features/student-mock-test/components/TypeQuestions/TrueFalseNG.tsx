"use client";

import React from "react";
import { cn } from "@/src/libs/utils";

interface ITrueFalseNGProps {
  questionId: number;
  question: string;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  // Format IELTS ada 2 macam: T/F/NG atau Y/N/NG
  variant?: "TFNG" | "YNNG"; 
}

export function TrueFalseNG({
  questionId,
  question,
  selectedValue,
  onSelect,
  variant = "TFNG",
}: ITrueFalseNGProps) {
  
  const options = variant === "TFNG" 
    ? ["TRUE", "FALSE", "NOT GIVEN"] 
    : ["YES", "NO", "NOT GIVEN"];

  return (
    <div className="space-y-6">
      {/* 1. PERTANYAAN / STATEMENT */}
      <div className="font-semibold text-slate-800 text-base leading-relaxed flex gap-3">
        <span className="font-black text-brand-purple shrink-0">{questionId}.</span>
        <div 
          className="prose prose-slate max-w-none text-slate-700 w-full"
          dangerouslySetInnerHTML={{ __html: question }} 
        />
      </div>

      {/* 2. OPSI JAWABAN (Tombol Blok) */}
      <div className="flex flex-col sm:flex-row gap-3 pl-2 sm:pl-7">
        {options.map((opt) => {
          const isSelected = selectedValue === opt;
          
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-center",
                isSelected 
                  ? "border-brand-purple bg-brand-purple text-white shadow-md" 
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-purple/50 hover:bg-slate-50"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}