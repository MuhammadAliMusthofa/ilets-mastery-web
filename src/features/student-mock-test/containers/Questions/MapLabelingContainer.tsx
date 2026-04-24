"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/src/libs/utils";
import { MapLabeling } from "../../components/TypeQuestions/MapLabeling";

export interface IAttachment {
  type: string;
  path: string;
}

export interface IQuestionData {
  id: string | number;
  type_question_id: string | number;
  text?: string;
  question_text: string;
  column_answer?: number; // Menentukan berapa label yang harus diisi (misal: 3)
  AttachmentQuestion?: IAttachment[];
}

interface MapLabelingContainerProps {
  data: IQuestionData;
  questionNumber: number; // Nomor mulai soal (misal mulai dari nomor 11)
}

export function MapLabelingContainer({ data, questionNumber }: MapLabelingContainerProps) {
  const columnCount = data?.column_answer || 1;
  
  // Buat array state awal: [{number: 11, value: ''}, {number: 12, value: ''}]
  const [labels, setLabels] = useState(() => 
    Array.from({ length: columnCount }).map((_, i) => ({
      number: questionNumber + i,
      value: "",
    }))
  );

  useEffect(() => {
    // Reset kalau pindah grup soal
    setLabels(Array.from({ length: columnCount }).map((_, i) => ({
      number: questionNumber + i,
      value: "",
    })));
  }, [data?.id, columnCount, questionNumber]);

  const handleLabelChange = (num: number, val: string) => {
    const newLabels = labels.map(label => 
      label.number === num ? { ...label, value: val } : label
    );
    setLabels(newLabels);
    // TODO: Update Zustand store dengan newLabels
    console.log(`Map Label Num ${num} updated:`, val);
  };

  // Cari gambar map-nya dari attachment
  const mapAttachment = data?.AttachmentQuestion?.find((att) => att?.type === "image" && att?.path);
  const mapImageUrl = mapAttachment?.path || "";

  const hasStimulus = !!data?.text; // Untuk Map Labeling biasanya cuma ada teks narasi pengantar

  return (
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden animate-in fade-in duration-300">
      
      {/* --- KIRI: AREA BACAAN (Kalau Ada) --- */}
      {hasStimulus && (
        <div className="w-full lg:w-1/2 h-[40vh] lg:h-full bg-white p-6 lg:p-10 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200 custom-scrollbar shadow-inner">
          <div className="mb-6 flex items-center gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-md">
              Context / Passage
            </span>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-justify sm:text-lg" dangerouslySetInnerHTML={{ __html: data.text! }} />
          <div className="h-20"></div>
        </div>
      )}

      {/* --- KANAN: AREA MAP & INPUT --- */}
      <div className={cn(
        "h-[60vh] lg:h-full bg-slate-50/50 p-6 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col",
        hasStimulus ? "w-full lg:w-1/2" : "w-full lg:max-w-4xl lg:mx-auto"
      )}>
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
          <MapLabeling
            questionText={data?.question_text}
            mapImageUrl={mapImageUrl}
            labels={labels}
            onChange={handleLabelChange}
          />
        </div>
        <div className="h-20 lg:h-10"></div>
      </div>
      
    </div>
  );
}