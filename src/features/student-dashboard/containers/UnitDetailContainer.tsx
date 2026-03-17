"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Trophy
} from "lucide-react";

interface UnitDetailProps {
  skill: string;
  unitId: number;
}

export default function UnitDetailContainer({ skill, unitId }: UnitDetailProps) {
  const formattedSkillTitle = skill.charAt(0).toUpperCase() + skill.slice(1);

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER NAVIGATION --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Link 
          href={`/student/materials/${skill}`} // Sesuaikan dengan route list unit lu
          className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-purple transition-colors"
        >
          <div className="p-2 rounded-full group-hover:bg-brand-purple/10 transition-colors">
            <ArrowLeft size={18} />
          </div>
          Back to Units List
        </Link>

        {/* Mini Progress Indicator */}
        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full">
          <div className="flex -space-x-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-2 w-8 rounded-full border border-white ${i <= 1 ? 'bg-brand-cyan' : 'bg-slate-300'}`} />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase">Part 1 of 3</span>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative mb-8 p-1 bg-gradient-to-r from-brand-cyan to-brand-purple rounded-[32px] shadow-lg">
        <div className="bg-white rounded-[31px] p-8">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter mb-4">
            <BookOpen size={14} />
            Unit {unitId}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Getting ready to start
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            Di unit ini, kamu akan mempelajari cara memahami konteks pembicaraan sebelum audio dimainkan. Ini adalah kemampuan krusial dalam IELTS Listening.
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT (TEORI) --- */}
      <Card className="p-8 border-slate-100 shadow-sm mb-8 rounded-[24px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Teori Dasar</h2>
        </div>
        
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed italic border-l-4 border-slate-100 pl-6 mb-8">
          "Sebelum rekaman dimulai, kamu akan diberikan waktu untuk membaca soal. Gunakan waktu ini untuk menebak siapa yang akan berbicara, di mana mereka berada, dan apa topik pembicaraannya."
        </div>

        {/* Tip Box pakai style mon-green/cyan lu */}
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4">
          <div className="mt-1">
            <Lightbulb className="text-emerald-500" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 mb-1 text-sm uppercase tracking-wide">Pro Tip:</h4>
            <p className="text-emerald-700 text-sm font-medium">
              Perhatikan judul bagian (jika ada) dan instruksi soal, misalnya <span className="underline decoration-emerald-300 font-bold text-emerald-800">"Write NO MORE THAN TWO WORDS"</span>. Seringkali jebakan ada di instruksi ini.
            </p>
          </div>
        </div>
      </Card>

      {/* --- INTERACTIVE QUIZ --- */}
      <Card className="p-8 border-slate-100 shadow-sm mb-8 rounded-[24px] bg-slate-50/50">
        <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
          ✍️ Quick Check
        </h2>
        <p className="text-slate-500 mb-6 font-medium">Berdasarkan teori di atas, apa yang harus kamu lakukan sebelum audio dimainkan?</p>
        
        <div className="space-y-3">
          {[
            "Langsung memikirkan jawabannya",
            "Membaca soal dan memprediksi konteks",
            "Menutup mata dan berkonsentrasi pada audio"
          ].map((option, idx) => (
            <label 
              key={idx} 
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-transparent hover:border-brand-cyan hover:shadow-md hover:shadow-brand-cyan/5 transition-all cursor-pointer"
            >
              <div className="h-6 w-6 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-brand-cyan transition-colors">
                <div className="h-3 w-3 rounded-full bg-brand-cyan opacity-0 group-has-[:checked]:opacity-100 transition-opacity" />
              </div>
              <input type="radio" name="quiz1" className="hidden" />
              <span className="text-slate-700 font-bold text-sm sm:text-base">{option}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* --- NAVIGATION FOOTER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-slate-100">
        <Button 
          variant="ghost" 
          className="w-full sm:w-auto rounded-xl font-bold text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className="mr-2" size={18} />
          Previous Unit
        </Button>
        
        <Button 
          className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-black shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          Complete & Next Unit
          <Trophy className="ml-2 group-hover:rotate-12 transition-transform" size={20} />
        </Button>
      </div>

    </div>
  );
}