"use client";

import { QuestionLayout } from "./QuestionLayout";
import React from "react";
import { useExamStore } from "@/src/store/examStore";
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
  
  const storedAnswer = useExamStore((state) => state.answers[Number(data?.id)]);
  const setStoreAnswer = useExamStore((state) => state.setAnswer);

  // Diturunkan dari store: [{number: 11, value: ''}, {number: 12, value: ''}]
  const labels = Array.from({ length: columnCount }).map((_, i) => ({
    number: questionNumber + i,
    value: storedAnswer?.[i] ?? "",
  }));

  const handleLabelChange = (num: number, val: string) => {
    setStoreAnswer(
      Number(data.id),
      labels.map((label) => (label.number === num ? val : label.value))
    );
  };

  // Cari gambar map-nya dari attachment
  const mapAttachment = data?.AttachmentQuestion?.find((att) => att?.type === "image" && att?.path);
  const mapImageUrl = mapAttachment?.path || "";


  return (
    <QuestionLayout stimulusHtml={data?.text}>
      <MapLabeling
        questionText={data?.question_text}
        mapImageUrl={mapImageUrl}
        labels={labels}
        onChange={handleLabelChange}
      />
    </QuestionLayout>
  );
}
