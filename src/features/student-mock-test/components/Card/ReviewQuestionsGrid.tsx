"use client";

import React from "react";
import { ButtonNumber, QuestionStatus } from "../Button/ButtonNumber";

interface ReviewQuestionGridProps {
  statuses: QuestionStatus[];
  stats: { answered: number; unanswered: number; flagged: number };
  totalQuestions: number;
  onQuestionClick: (number: number) => void;
}

export function ReviewQuestionGrid({ statuses, stats, totalQuestions, onQuestionClick }: ReviewQuestionGridProps) {
  const progressPercentage = Math.round((stats.answered / totalQuestions) * 100);

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-white shadow-xl shadow-slate-200/40">
      
      {/* Progress Summary */}
      <div className="mb-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h3 className="font-black text-slate-800 text-xl">Periksa Jawabanmu</h3>
            <p className="text-sm font-medium text-slate-500">Klik pada nomor untuk kembali ke soal tersebut.</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-brand-purple">{stats.answered}</span>
            <span className="text-slate-400 font-bold"> / {totalQuestions}</span>
          </div>
        </div>
        
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Legend / Keterangan Warna */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-8 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-brand-purple/10 border-2 border-brand-purple" />
          <span className="text-sm font-bold text-slate-600">Terjawab ({stats.answered})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border-2 border-slate-200" />
          <span className="text-sm font-bold text-slate-600">Kosong ({stats.unanswered})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-400" />
          <span className="text-sm font-bold text-slate-600">Ragu/Review ({stats.flagged})</span>
        </div>
      </div>

      {/* Number Grid - Memanggil Komponen Modular */}
      <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-3">
        {statuses.map((status, index) => (
          <ButtonNumber
            key={index + 1}
            number={index + 1}
            status={status}
            onClick={() => onQuestionClick(index + 1)}
          />
        ))}
      </div>

    </div>
  );
}