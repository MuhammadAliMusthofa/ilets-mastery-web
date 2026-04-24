"use client";

import React, { useState } from "react";
import { cn } from "@/src/libs/utils";
import { MultipleChoice, IOption } from "../../components/TypeQuestions/MultipleChoice"; 

export interface IAttachment {
  type: string;
  path: string;
}

export interface IQuestionData {
  id: string | number;
  type_question_id: string | number;
  text?: string;
  text_image?: string;
  question_text: string;
  Options: IOption[];
  AttachmentQuestion?: IAttachment[];
}

interface MultipleChoiceContainerProps {
  data: IQuestionData;
  questionNumber: number;
}

export function MultipleChoiceContainer({ data, questionNumber }: MultipleChoiceContainerProps) {
  // TODO: Nanti ganti pakai Zustand store
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  
  const audioAttachment = data?.AttachmentQuestion?.find((att) => att?.type === "audio" && att?.path);
  const audioSrc = audioAttachment?.path;
  const soundKey = `soal_${data?.id}`;

  const handleAnswerSubmission = (selectedOptionId: string) => {
    setCurrentAnswer(selectedOptionId);
    console.log(`Menjawab soal ID ${data.id} dengan opsi: ${selectedOptionId}`);
  };

  // Cek apakah soal ini punya stimulus (teks bacaan atau gambar bacaan)
  const hasStimulus = !!(data?.text || data?.text_image);

  return (
    // WRAPPER UTAMA: Pakai w-full h-full biar menuhin sisa ruang dari ExamContainer
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden animate-in fade-in duration-300">
      
      {/* --- KIRI: AREA STIMULUS (PASSAGE / BACAAN) --- */}
      {/* Cuma dirender kalau hasStimulus = true */}
      {hasStimulus && (
        <div className="w-full lg:w-1/2 h-[40vh] lg:h-full bg-white p-6 lg:p-10 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200 custom-scrollbar shadow-inner">
          
          <div className="mb-6 flex items-center gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-md">
              Reading Passage
            </span>
          </div>

          {/* Tampilkan gambar stimulus kalau ada */}
          {data?.text_image && (
            <div className="flex justify-center mb-8">
              <img 
                src={data.text_image} 
                alt="Stimulus" 
                className="max-h-80 w-auto rounded-xl shadow-sm border border-slate-100 object-contain" 
              />
            </div>
          )}
          
          {/* Teks Stimulus (Parse HTML) */}
          {data?.text && (
            <div 
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-justify sm:text-lg"
              dangerouslySetInnerHTML={{ __html: data.text }} 
            />
          )}
          
          <div className="h-20"></div> {/* Spacer bawah biar bisa discroll mentok */}
        </div>
      )}

      {/* --- KANAN: AREA PERTANYAAN & OPSI (QUESTION) --- */}
      {/* Kalau nggak ada stimulus, w-full & ditengahin (max-w-4xl mx-auto). Kalau ada, w-1/2. */}
      <div className={cn(
        "h-[60vh] lg:h-full bg-slate-50/50 p-6 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col",
        hasStimulus ? "w-full lg:w-1/2" : "w-full lg:max-w-4xl lg:mx-auto"
      )}>
        
        {/* AREA ATTACHMENT EXTRA (Gambar spesifik untuk pertanyaan, bukan stimulus utama) */}
        {Array.isArray(data?.AttachmentQuestion) && 
          data.AttachmentQuestion.some(item => item?.path && item.type === "image") && (
          <div className="flex flex-wrap gap-4 mb-6">
            {data.AttachmentQuestion.map((item, index) => {
              if (item.type === "image" && item.path) {
                return (
                  <div key={`att-img-${index}`} className="border border-slate-200 p-2 rounded-xl bg-white shadow-sm">
                    <img src={item.path} alt={`Attachment ${index}`} className="max-h-48 rounded-lg object-contain" />
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* KOMPONEN INTI MULTIPLE CHOICE */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
          <div className="mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md">
              Question {questionNumber}
            </span>
          </div>
          
          <MultipleChoice
            questionId={questionNumber}
            questionText={data?.question_text}
            options={data?.Options}
            selectedValue={currentAnswer}
            onSelect={handleAnswerSubmission}
            soundFile={audioSrc}
            soundKey={soundKey}
          />
        </div>
        
        <div className="h-20 lg:h-10"></div> {/* Spacer bawah */}
      </div>
      
    </div>
  );
}