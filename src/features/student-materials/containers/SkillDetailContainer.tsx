"use client";

import React, { use } from "react";
// 1. IMPORT KOMPONEN GLOBAL KITA
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PlayCircle, Lock, BookOpen, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- DUMMY DATA ---
const DUMMY_UNITS = [
  { id: 1, title: "Getting ready to start", status: "completed" },
  { id: 2, title: "Following a conversation / Identifying main ideas", status: "ongoing" },
  { id: 3, title: "Detail and specific information", status: "locked" },
  { id: 4, title: "Identifying attitudes and opinions", status: "locked" },
  { id: 5, title: "Academic contexts", status: "locked" },
  { id: 6, title: "Matching and classifying", status: "locked" },
  { id: 7, title: "Completing notes and summaries", status: "locked" },
  { id: 8, title: "Advanced practice", status: "locked" },
];

interface SkillDetailProps {
  skill: string;
}

export default function SkillDetailContainer({ skill }: SkillDetailProps) {
  const formattedSkillTitle = skill.charAt(0).toUpperCase() + skill.slice(1);
  const unitsToShow = skill === "speaking" ? DUMMY_UNITS.slice(0, 4) : DUMMY_UNITS;
  const router = useRouter();

  // Fungsi buat nentuin tema warna berdasarkan nama skill (biar nyambung sama halaman depan)
  const getHeaderTheme = () => {
    switch (skill.toLowerCase()) {
      case "listening": return "from-blue-500 to-blue-400";
      case "reading": return "from-emerald-500 to-emerald-400";
      case "writing": return "from-brand-cyan to-brand-purple";
      case "speaking": return "from-orange-500 to-orange-400";
      default: return "from-slate-600 to-slate-500";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* --- TOMBOL KEMBALI --- */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-purple mb-8 transition-colors">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* --- HEADER BANNER --- */}
      <div className={`mb-10 p-8 rounded-[32px] text-white shadow-xl bg-gradient-to-tr ${getHeaderTheme()} relative overflow-hidden`}>
        {/* Dekorasi Bulatan Transparan */}
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-50%] left-[-10%] w-[200px] h-[200px] bg-black/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen size={24} className="text-white" />
              </div>
              <span className="text-white/80 font-bold uppercase tracking-widest text-xs">Materi Ujian</span>
            </div>
            <h1 className="text-4xl font-black mb-3">
              {formattedSkillTitle} Mastery
            </h1>
            <p className="text-white/90 text-sm md:text-base max-w-lg">
              Selesaikan unit pembelajaran di bawah ini secara berurutan untuk memaksimalkan skor {formattedSkillTitle} kamu.
            </p>
          </div>
        </div>
      </div>

      {/* --- LIST UNIT MATERI --- */}
      <div className="space-y-4">
        {unitsToShow.map((unit, index) => {
          
          const isCompleted = unit.status === "completed";
          const isOngoing = unit.status === "ongoing";
          const isLocked = unit.status === "locked";

          return (
            <Card 
              key={unit.id}
              variant="default" // Pake varian default dari Card global kita
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 transition-all duration-300 ${
                isCompleted ? "bg-white border-green-100 hover:border-green-300" :
                isOngoing ? "bg-white border-brand-cyan/40 shadow-md ring-4 ring-brand-cyan/10" :
                "bg-slate-50/50 border-slate-100 opacity-70 grayscale-[20%]"
              }`}
            >
              <div className="flex items-start sm:items-center gap-5 w-full">
                
                {/* Ikon Status & Nomor */}
                <div className={`relative flex shrink-0 h-14 w-14 items-center justify-center rounded-2xl font-black text-xl shadow-sm ${
                  isCompleted ? "bg-green-100 text-green-600" :
                  isOngoing ? "bg-gradient-to-tr from-brand-cyan to-brand-purple text-white shadow-brand-purple/20" :
                  "bg-slate-200 text-slate-400"
                }`}>
                  {isLocked ? <Lock size={20} /> : index + 1}
                  
                  {/* Badge Centang kecil di pojok ikon kalau udah selesai */}
                  {isCompleted && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                      <CheckCircle2 size={18} className="text-green-500" fill="white" />
                    </div>
                  )}
                </div>
                
                {/* Judul Unit */}
                <div className="flex-1 pr-4">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">
                    Unit {unit.id}
                  </p>
                  <h3 className={`text-base sm:text-lg font-bold leading-tight mb-1 ${
                    isLocked ? "text-slate-500" : "text-slate-800"
                  }`}>
                    {unit.title}
                  </h3>
                  <p className={`text-xs sm:text-sm font-medium ${
                    isCompleted ? "text-green-600" : 
                    isOngoing ? "text-brand-purple" : 
                    "text-slate-400"
                  }`}>
                    {isCompleted ? "✓ Selesai dipelajari" : isOngoing ? "⏳ Sedang dipelajari" : "Terkunci"}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 sm:mt-0 w-full sm:w-auto flex justify-end">
                {isCompleted && (
                  <Button variant="outline" className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-600 hover:text-green-600 hover:bg-green-50 font-bold bg-white">
                    Review
                  </Button>
                )}
                {isOngoing && (
                  <Button variant="default" className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white hover:opacity-90 shadow-md font-bold group" onClick={() => router.push(`/student/materials/${skill}/${unit.id}`)}>
                    Lanjutkan
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
                {isLocked && (
                  <Button variant="ghost" disabled className="w-full sm:w-auto rounded-xl text-slate-400 bg-slate-100 font-bold">
                    Terkunci
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
}