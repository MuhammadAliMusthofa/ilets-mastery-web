"use client";

import React, { useState } from "react";
import { X, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonNumber, QuestionStatus } from "../Button/ButtonNumber";

interface DialogShowAllNumberProps {
  totalQuestions: number;
  activeQuestionIndex: number;
  // Fungsi untuk ngecek status tiap soal (nanti logic-nya disambung ke Zustand)
  getQuestionStatus: (index: number) => QuestionStatus; 
  // Fungsi pas user ngeklik salah satu nomor
  onQuestionSelect: (index: number) => void;
}

export function DialogShowAllNumber({
  totalQuestions,
  activeQuestionIndex,
  getQuestionStatus,
  onQuestionSelect,
}: DialogShowAllNumberProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Array untuk merender tombol 1 sampai totalQuestions
  const questions = Array.from({ length: totalQuestions }, (_, i) => i);

  // Handle klik: Tutup modal lalu pindah soal
  const handleNavigate = (index: number) => {
    onQuestionSelect(index);
    setIsOpen(false);
  };

  return (
    <>
      {/* --- TOMBOL TRIGGER --- */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="text-brand-cyan font-bold hover:bg-brand-cyan/10"
      >
        <LayoutGrid size={18} className="mr-2" />
        Lihat Semua Nomor
      </Button>

      {/* --- MODAL OVERLAY --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* DIALOG BOX */}
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white z-10">
              <div>
                <h2 className="text-xl font-black text-slate-800">Peta Soal</h2>
                <p className="text-sm font-medium text-slate-500">Lompat ke nomor yang kamu inginkan.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal (Bisa di-scroll kalau soalnya sampe 50+) */}
            <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/50">
              
              {/* Legend Singkat */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-brand-cyan/20 border-2 border-brand-cyan" />
                  <span className="text-xs font-bold text-slate-600">Saat Ini</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-brand-purple/10 border-2 border-brand-purple" />
                  <span className="text-xs font-bold text-slate-600">Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-white border-2 border-slate-200" />
                  <span className="text-xs font-bold text-slate-600">Kosong</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-100 border-2 border-orange-400" />
                  <span className="text-xs font-bold text-slate-600">Ragu</span>
                </div>
              </div>

              {/* Grid Nomor Soal */}
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                {questions.map((index) => {
                  const number = index + 1;
                  // Kalau nomor ini lagi dikerjain, paksa statusnya jadi "active"
                  const status = index === activeQuestionIndex 
                    ? "active" 
                    : getQuestionStatus(index);

                  return (
                    <ButtonNumber
                      key={number}
                      number={number}
                      status={status}
                      onClick={() => handleNavigate(index)}
                    />
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}