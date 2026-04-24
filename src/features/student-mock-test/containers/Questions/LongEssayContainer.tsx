"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/src/libs/utils";
import { LongEssay } from "../../components/TypeQuestions/LongEssay";

export interface IQuestionData {
  id: string | number;
  type_question_id: string | number;
  text?: string;
  text_image?: string;
  question_text: string;
}

interface LongEssayContainerProps {
  data: IQuestionData;
  questionNumber: number;
}

export function LongEssayContainer({ data, questionNumber }: LongEssayContainerProps) {
  // TODO: Nanti ganti pakai Zustand store
  const [currentAnswer, setCurrentAnswer] = useState<string>("");

  useEffect(() => {
    setCurrentAnswer(""); // Nanti ambil dari state Zustand
  }, [data?.id]);

  const handleAnswerSubmission = (value: string) => {
    setCurrentAnswer(value);
    // TODO: Karena ini ngetik essay panjang, lebih baik pakai debounce sebelum di-save ke Zustand
    // biar gak berat nge-render state global tiap ngetik 1 huruf.
    console.log(`Update Essay ID ${data.id}: ${value.length} characters`);
  };

  const hasStimulus = !!(data?.text || data?.text_image);

  return (
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden animate-in fade-in duration-300">
      
      {/* --- KIRI: PROMPT / STIMULUS --- */}
      {hasStimulus && (
        <div className="w-full lg:w-1/2 h-[40vh] lg:h-full bg-white p-6 lg:p-10 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200 custom-scrollbar shadow-inner">
          <div className="mb-6 flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-cyan/20 text-brand-cyan font-black text-xs uppercase tracking-wider rounded-md border border-brand-cyan/30">
              Writing Prompt
            </span>
          </div>
          {data?.text_image && (
            <div className="flex justify-center mb-8">
              <img src={data.text_image} alt="Writing Chart" className="max-h-96 w-auto rounded-xl shadow-md border border-slate-200 object-contain" />
            </div>
          )}
          {data?.text && (
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed sm:text-lg" dangerouslySetInnerHTML={{ __html: data.text }} />
          )}
          <div className="h-20"></div>
        </div>
      )}

      {/* --- KANAN: AREA NGETIK --- */}
      <div className={cn(
        "h-[60vh] lg:h-full bg-slate-50/50 p-6 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col",
        hasStimulus ? "w-full lg:w-1/2" : "w-full lg:max-w-4xl lg:mx-auto"
      )}>
        <LongEssay
          questionId={questionNumber}
          question={data?.question_text}
          value={currentAnswer}
          onChange={handleAnswerSubmission}
          minWords={150} // Nanti bisa dinamis dari backend (Task 1 = 150, Task 2 = 250)
        />
        <div className="h-20 lg:h-10"></div>
      </div>
      
    </div>
  );
}