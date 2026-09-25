"use client";

import { QuestionLayout } from "./QuestionLayout";
import React from "react";
import { useExamStore } from "@/src/store/examStore";
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
  // Nilai dibaca dari store per id soal, jadi berpindah nomor tidak perlu reset.
  const storedAnswer = useExamStore((state) => state.answers[Number(data?.id)]);
  const setStoreAnswer = useExamStore((state) => state.setAnswer);
  const currentAnswer = storedAnswer?.[0] ?? null;

  const handleAnswerSubmission = (value: string) => {
    setStoreAnswer(Number(data.id), [value]);
  };


  return (
    <QuestionLayout stimulusHtml={data?.text} stimulusImage={data?.text_image}>
      <TrueFalseNG
        questionId={questionNumber}
        question={data?.question_text}
        selectedValue={currentAnswer}
        onSelect={handleAnswerSubmission}
        variant="TFNG"
      />
    </QuestionLayout>
  );
}
