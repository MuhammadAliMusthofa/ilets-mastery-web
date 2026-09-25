"use client";

import React, { useEffect, useState } from "react";
import { X, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonNumber, QuestionStatus } from "../Button/ButtonNumber";

interface DialogShowAllNumberProps {
  totalQuestions: number;
  activeQuestionIndex: number;
  getQuestionStatus: (index: number) => QuestionStatus;
  onQuestionSelect: (index: number) => void;
}

const LEGEND: Array<{ label: string; swatch: string }> = [
  { label: "Current", swatch: "border-2 border-primary-500 bg-primary-50" },
  { label: "Answered", swatch: "bg-[#00c875]" },
  { label: "Flagged", swatch: "bg-[#fdab3d]" },
  { label: "Blank", swatch: "border border-slate-300 bg-white" },
];

/** Peta soal: lompat ke nomor mana pun tanpa kehilangan jawaban. */
export function DialogShowAllNumber({
  totalQuestions,
  activeQuestionIndex,
  getQuestionStatus,
  onQuestionSelect,
}: DialogShowAllNumberProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleNavigate = (index: number) => {
    onQuestionSelect(index);
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <LayoutGrid size={16} />
        Question map
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="peta-soal-title"
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 id="peta-soal-title" className="text-lg font-semibold text-slate-800">Question map</h2>
                <p className="text-[13px] text-slate-500">Pick a number to jump straight to it. Your answers stay saved.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-8 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#dcdfec] hover:text-slate-800"
                aria-label="Close question map"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <ul className="mb-5 flex flex-wrap gap-x-5 gap-y-2">
                {LEGEND.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-[13px] text-slate-700">
                    <span className={`size-3.5 rounded-[3px] ${item.swatch}`} aria-hidden="true" />
                    {item.label}
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
                {Array.from({ length: totalQuestions }, (_, index) => (
                  <ButtonNumber
                    key={index}
                    number={index + 1}
                    status={index === activeQuestionIndex ? "active" : getQuestionStatus(index)}
                    onClick={() => handleNavigate(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
