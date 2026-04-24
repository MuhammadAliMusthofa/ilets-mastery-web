"use client";

import React from "react";
import { MultipleChoiceContainer } from "../Questions/MultipleChoiceContainer";
import { ShortEssayContainer } from "../Questions/ShortEssayContainer";
import { LongEssayContainer } from "../Questions/LongEssayContainer";
import { MapLabelingContainer } from "../Questions/MapLabelingContainer";
import { TrueFalseContainer } from "../Questions/TrueFalseNGContainer";

// --- DUMMY IMPORT UNTUK TIPE LAIN (Nanti lu tinggal uncomment kalau komponennya udah dibikin) ---
// import { EssayContainer } from "../Questions/EssayContainer";
// import { TrueFalseContainer } from "../Questions/TrueFalseContainer";
// import { MatchContainer } from "../Questions/MatchContainer";

// Sesuaikan dengan model IQuestionData yang kita bikin di MultipleChoiceContainer
interface IQuestionData {
  id: string | number;
  type_question_id: string; // atau number kalau di backend lu pakai ID angka
  text?: string;
  text_image?: string;
  question_text: string;
  Options: any[];
  AttachmentQuestion?: any[];
}

interface RenderQuestionsProps {
  questionData: IQuestionData | null | undefined;
  questionNumber: number; // Untuk passing nomor soal yang lagi aktif
}

export function RenderQuestions({ questionData, questionNumber }: RenderQuestionsProps) {
  
  // 1. Validasi kalau datanya kosong
  if (!questionData) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-slate-50 border border-slate-200 rounded-2xl text-center">
        <h3 className="text-lg font-bold text-slate-700 mb-2">Soal Tidak Ditemukan</h3>
        <p className="text-sm text-slate-500">Data pertanyaan gagal dimuat atau belum tersedia.</p>
      </div>
    );
  }

  // 2. LOGIC SWITCHER TIPE SOAL
  // Di backend lama lu ID 1 itu Multiple Choice, jadi kita mapping sesuai tipe ID-nya.
  // Pastikan tipe data `type_question_id` dari backend itu string atau angka biar match.
  
  switch (String(questionData.type_question_id)) {
    
    // TIPE 1: PILIHAN GANDA (MULTIPLE CHOICE)
    case "1":
    case "multiple_choice": 
      return (
        <MultipleChoiceContainer 
          data={questionData} 
          questionNumber={questionNumber} 
        />
      );

    // TIPE 2: MULTIPLE CHOICE COMPLEX (Jawaban bisa lebih dari 1)
    // case "2":
    //   return <MultipleChoiceComplexContainer data={questionData} questionNumber={questionNumber} />;

    // TIPE 3: TRUE OR FALSE
    case "3":
      return <TrueFalseContainer data={questionData} questionNumber={questionNumber} />;

   // TIPE 5: SHORT ESSAY (Isian Singkat) - Sesuaikan ID dari Backend lu
    case "5":
    case "short_essay":
      return (
        <ShortEssayContainer 
          data={questionData} 
          questionNumber={questionNumber} 
        />
      );

// TIPE 6: LONG ESSAY (WRITING TASK)
    case "6":
    case "long_essay":
      return <LongEssayContainer data={questionData} questionNumber={questionNumber} />;

    // TIPE 8: MAP LABELING (Anggap aja ID-nya 8)
    case "8":
    case "map_labeling":
      return <MapLabelingContainer data={questionData} questionNumber={questionNumber} />;

    // Kalau ID tipe soalnya gak ada di daftar
    default:
      return (
        <div className="flex flex-col items-center justify-center p-10 bg-orange-50 border border-orange-200 rounded-2xl text-center">
          <h3 className="text-lg font-bold text-orange-800 mb-2">Tipe Soal Belum Didukung</h3>
          <p className="text-sm text-orange-600">
            Komponen untuk tipe soal (ID: {questionData.type_question_id}) belum tersedia.
          </p>
        </div>
      );
  }
}