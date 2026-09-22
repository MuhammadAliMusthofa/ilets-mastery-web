"use client";

import React from "react";
import { QuestionText } from "./QuestionNumber";
import { QuestionNumber } from "./QuestionNumber";
import { cn } from "@/src/libs/utils";

interface IMapLabelItem {
  number: number;
  value: string;
}

interface IMapLabelingProps {
  questionText: string;
  mapImageUrl: string;
  labels: IMapLabelItem[];
  onChange: (number: number, value: string) => void;
}

export function MapLabeling({ questionText, mapImageUrl, labels, onChange }: IMapLabelingProps) {
  return (
    <div className="space-y-5">
      <QuestionText html={questionText} className="[&>p:first-child]:mt-0" />

      {mapImageUrl && (
        <div className="flex justify-center rounded-lg border border-slate-200 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mapImageUrl} alt="Map for the labelling questions" className="max-h-[420px] w-auto object-contain" />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {labels.map((label) => {
          const inputId = `map-label-${label.number}`;
          const filled = !!label.value?.trim();
          return (
            <div key={label.number} className="flex items-center gap-2.5">
              <label htmlFor={inputId}>
                <QuestionNumber value={label.number} className={cn(!filled && "bg-slate-500")} />
                <span className="sr-only">Label for question {label.number}</span>
              </label>
              <input
                id={inputId}
                type="text"
                autoComplete="off"
                value={label.value || ""}
                onChange={(event) => onChange(label.number, event.target.value)}
                className="h-10 w-full rounded-[4px] border border-slate-300 bg-white px-3 text-[15px] text-slate-800 transition-colors duration-150 hover:border-slate-800 focus:border-primary-500 focus:outline-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
