"use client";

import { QuestionLayout } from "./QuestionLayout";
import React from "react";
import { useExamStore } from "@/src/store/examStore";
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
  const storedAnswer = useExamStore((state) => state.answers[Number(data?.id)]);
  const setStoreAnswer = useExamStore((state) => state.setAnswer);
  const currentAnswer = storedAnswer?.[0] ?? null;
  
  const audioAttachment = data?.AttachmentQuestion?.find((att) => att?.type === "audio" && att?.path);
  const audioSrc = audioAttachment?.path;
  const soundKey = `soal_${data?.id}`;

  const handleAnswerSubmission = (selectedOptionId: string) => {
    setStoreAnswer(Number(data.id), [selectedOptionId]);
  };


  return (
    <QuestionLayout stimulusHtml={data?.text} stimulusImage={data?.text_image}>
      <MultipleChoice
        questionId={questionNumber}
        questionText={data?.question_text}
        options={data?.Options}
        selectedValue={currentAnswer}
        onSelect={handleAnswerSubmission}
        soundFile={audioSrc}
        soundKey={soundKey}
      />
    </QuestionLayout>
  );
}
