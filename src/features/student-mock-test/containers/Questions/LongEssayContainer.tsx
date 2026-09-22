"use client";

import { QuestionLayout } from "./QuestionLayout";
import React from "react";
import { useExamStore } from "@/src/store/examStore";
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
  // Store hanya me-render ulang komponen yang berlangganan soal ini, dan
  // pengiriman ke server sudah di-debounce oleh autosave di container ujian.
  const storedAnswer = useExamStore((state) => state.answers[Number(data?.id)]);
  const setStoreAnswer = useExamStore((state) => state.setAnswer);
  const currentAnswer = storedAnswer?.[0] ?? "";

  const handleAnswerSubmission = (value: string) => {
    setStoreAnswer(Number(data.id), [value]);
  };


  // Task 1 GT minimal 150 kata, Task 2 minimal 250; dibaca dari teks soal.
  const minWords = /250/.test(data?.question_text ?? "") ? 250 : 150;

  return (
    <QuestionLayout stimulusHtml={data?.text} stimulusImage={data?.text_image}>
      <LongEssay
        questionId={questionNumber}
        question={data?.question_text}
        value={currentAnswer}
        onChange={handleAnswerSubmission}
        minWords={minWords}
      />
    </QuestionLayout>
  );
}
