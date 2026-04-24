"use client";

import React from "react";
import { Flag, AlertTriangle } from "lucide-react";
import { cn } from "@/src/libs/utils";

export type QuestionStatus = "answered" | "unanswered" | "flagged" | "active";

interface ButtonNumberProps {
  number: number;
  status: QuestionStatus;
  onClick: () => void;
  disabled?: boolean;
}

export function ButtonNumber({ number, status, onClick, disabled }: ButtonNumberProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative h-11 sm:h-12 w-full rounded-xl text-sm font-black transition-all duration-200 hover:scale-110 active:scale-95 border-2 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed",
        
        // --- STYLING BERDASARKAN STATUS ---
        
        // 1. ACTIVE (Sedang dikerjakan saat ini)
        status === "active" && "bg-brand-cyan/20 border-brand-cyan text-brand-cyan ring-4 ring-brand-cyan/10 shadow-md",
        
        // 2. ANSWERED (Sudah diisi)
        status === "answered" && "bg-brand-purple/10 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white",
        
        // 3. FLAGGED (Ragu-ragu / Ditandai)
        status === "flagged" && "bg-orange-50 border-orange-400 text-orange-600 hover:bg-orange-500 hover:text-white",
        
        // 4. UNANSWERED (Masih Kosong)
        status === "unanswered" && "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
      )}
    >
      {number}
      
      {/* Ikon penanda kecil di pojok tombol */}
      {status === "flagged" && (
        <div className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white p-0.5 rounded-full shadow-sm">
          <Flag size={10} strokeWidth={4} />
        </div>
      )}
      
      {/* (Opsional) Ikon warning buat yang kosong, biasanya ditampilin pas di halaman review aja */}
      {status === "unanswered" && (
        <div className="absolute -top-1.5 -right-1.5 bg-slate-200 text-slate-500 p-0.5 rounded-full shadow-sm">
          <AlertTriangle size={10} strokeWidth={4} />
        </div>
      )}
    </button>
  );
}