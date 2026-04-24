import React from "react";
import { AlertTriangle } from "lucide-react";

interface ReviewWarningBoxProps {
  unansweredCount: number;
}

export function ReviewWarningBox({ unansweredCount }: ReviewWarningBoxProps) {
  if (unansweredCount <= 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm animate-in zoom-in-95 duration-300">
      <div className="bg-orange-100 p-2 rounded-full shrink-0">
        <AlertTriangle className="text-orange-500" size={24} />
      </div>
      <div>
        <h4 className="font-bold text-orange-900 mb-1">Tunggu sebentar!</h4>
        <p className="text-orange-700 text-sm font-medium">
          Masih ada <span className="font-black text-orange-800">{unansweredCount} pertanyaan</span> yang belum kamu jawab. Di ujian IELTS, tidak ada sistem minus. Sebaiknya tebak jawabannya daripada dibiarkan kosong!
        </p>
      </div>
    </div>
  );
}