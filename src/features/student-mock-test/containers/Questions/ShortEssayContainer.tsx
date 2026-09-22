"use client";

import { QuestionLayout } from "./QuestionLayout";
import React from "react";
import { useExamStore } from "@/src/store/examStore";
import { ShortEssay } from "../../components/TypeQuestions/ShortEssay";

// --- INTERFACES (Sama seperti MultipleChoiceContainer) ---
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
  column_answer?: number; // Ekstra field untuk nentuin berapa jumlah kotaknya
  AttachmentQuestion?: IAttachment[];
}

interface ShortEssayContainerProps {
  data: IQuestionData;
  questionNumber: number;
}

export function ShortEssayContainer({ data, questionNumber }: ShortEssayContainerProps) {
  // TODO: Nanti ganti pakai Zustand store (currentAnswer)
  // State ini isinya array string. Kalau column_answer = 2, isinya misal: ["hello", "world"]
  const storedAnswer = useExamStore((state) => state.answers[Number(data?.id)]);
  const setStoreAnswer = useExamStore((state) => state.setAnswer);
  const updatedAnswer = storedAnswer ?? [];

  const handleAnswerSubmission = (value: string, index: number) => {
    // Diisi rapat sampai jumlah kotak: array bolong akan terkirim sebagai null.
    const columns = Math.max(data?.column_answer || 1, index + 1);
    const newAnswer = Array.from({ length: columns }, (_, i) =>
      i === index ? value : updatedAnswer[i] ?? ""
    );

    setStoreAnswer(Number(data.id), newAnswer);
  };


  return (
    <QuestionLayout stimulusHtml={data?.text} stimulusImage={data?.text_image} attachments={data?.AttachmentQuestion}>
      <ShortEssay
        questionId={questionNumber}
        question={data?.question_text}
        value={updatedAnswer}
        onChange={handleAnswerSubmission}
        column={data?.column_answer || 1}
      />
    </QuestionLayout>
  );
}
