"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/src/libs/utils";
import { TrueFalseNG } from "../../components/TypeQuestions/TrueFalseNG";

export interface IQuestionData {
  id: string | number;
  type_question_id: string | number;
  text?: string;
  text_image?: string;
  question_text: string;
  // Opsi bisa dikosongin dari backend karena udah hardcode di komponen
}

interface TrueFalseContainerProps {
  data: IQuestionData;
  questionNumber: number;
}

export function TrueFalseContainer({ data, questionNumber }: TrueFalseContainerProps) {
  // TODO: Nanti ganti pakai Zustand store
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);

  // Reset state kalau pindah nomor soal
  useEffect(() => {
    setCurrentAnswer(null); // Nanti ambil dari state Zustand
  }, [data?.id]);

  const handleAnswerSubmission = (value: string) => {
    setCurrentAnswer(value);
    console.log(`Menjawab soal ID ${data.id} dengan: ${value}`);
    // TODO: Panggil setStoreAnswer() Zustand di sini
  };

  const hasStimulus = !!(data?.text || data?.text_image);

  return (
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden animate-in fade-in duration-300">
      
      {/* --- KIRI: AREA STIMULUS --- */}
      {hasStimulus && (
        <div className="w-full lg:w-1/2 h-[40vh] lg:h-full bg-white p-6 lg:p-10 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200 custom-scrollbar shadow-inner">
          <div className="mb-6 flex items-center gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-md">
              Reading Passage
            </span>
          </div>
          {data?.text_image && (
            <div className="flex justify-center mb-8">
              <img src={data.text_image} alt="Stimulus" className="max-h-80 w-auto rounded-xl shadow-sm border border-slate-100 object-contain" />
            </div>
          )}
          {data?.text && (
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-justify sm:text-lg" dangerouslySetInnerHTML={{ __html: data.text }} />
          )}
          <div className="h-20"></div>
        </div>
      )}

      {/* --- KANAN: AREA SOAL --- */}
      <div className={cn(
        "h-[60vh] lg:h-full bg-slate-50/50 p-6 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col",
        hasStimulus ? "w-full lg:w-1/2" : "w-full lg:max-w-4xl lg:mx-auto"
      )}>
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
          <div className="mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md">
              Question {questionNumber}
            </span>
          </div>
          
          <TrueFalseNG
            questionId={questionNumber}
            question={data?.question_text}
            selectedValue={currentAnswer}
            onSelect={handleAnswerSubmission}
            variant="TFNG" // Bisa lu ganti logicnya jadi "YNNG" kalau butuh Yes/No/Not Given
          />
        </div>
        <div className="h-20 lg:h-10"></div>
      </div>
      
    </div>
  );
}