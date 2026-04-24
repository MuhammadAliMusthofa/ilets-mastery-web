"use client";

import React from "react";
import { cn } from "@/src/libs/utils";

interface IMapLabelItem {
  number: number; // Nomor soal di peta (misal: 11, 12, 13)
  value: string;
}

interface IMapLabelingProps {
  questionText: string;
  mapImageUrl: string; // Wajib ada gambar peta/diagram
  labels: IMapLabelItem[]; // Array state jawaban dari container
  onChange: (number: number, value: string) => void;
}

export function MapLabeling({
  questionText,
  mapImageUrl,
  labels,
  onChange,
}: IMapLabelingProps) {
  return (
    <div className="space-y-8">
      
      {/* 1. INSTRUKSI */}
      <div className="font-semibold text-slate-800 text-base leading-relaxed">
        <div 
          className="prose prose-slate max-w-none text-slate-700"
          dangerouslySetInnerHTML={{ __html: questionText }} 
        />
      </div>

      {/* 2. GAMBAR PETA/DIAGRAM */}
      <div className="flex justify-center bg-slate-100 p-2 sm:p-4 rounded-2xl border border-slate-200">
        <img 
          src={mapImageUrl} 
          alt="Map or Diagram Labeling" 
          className="max-h-[400px] w-auto rounded-xl shadow-sm object-contain bg-white" 
        />
      </div>

      {/* 3. INPUT GRID (Isian Label) */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
          Fill in the labels:
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {labels.map((label) => (
            <div key={label.number} className="flex items-center gap-3 bg-white p-2 pl-4 rounded-xl border border-slate-200 shadow-sm focus-within:border-brand-purple focus-within:ring-2 focus-within:ring-brand-purple/20 transition-all">
              <span className="font-black text-brand-purple text-lg min-w-[24px]">
                {label.number}.
              </span>
              <input
                type="text"
                autoComplete="off"
                placeholder="Type answer..."
                value={label.value || ""}
                onChange={(e) => onChange(label.number, e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-800 font-medium placeholder:text-slate-300 placeholder:font-normal"
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}