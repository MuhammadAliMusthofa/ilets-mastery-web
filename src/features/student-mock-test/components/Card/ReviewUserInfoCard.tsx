import React from "react";
import { BookOpen } from "lucide-react";

interface ReviewUserInfoCardProps {
  user: {
    name: string;
    email: string;
    testName: string;
  };
}

export function ReviewUserInfoCard({ user }: ReviewUserInfoCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[24px] border border-white shadow-xl shadow-slate-200/40">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-purple flex items-center justify-center text-white font-bold text-xl shadow-inner">
          {user.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{user.name}</h3>
          <p className="text-xs text-slate-500 font-medium">{user.email}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <BookOpen size={18} className="text-brand-purple mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modul Ujian</p>
            <p className="font-semibold text-slate-700 text-sm">{user.testName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}