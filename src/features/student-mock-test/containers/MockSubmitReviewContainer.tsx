"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import komponen modular yang baru dibikin
import { SubmitTestDialog } from "../components/Dialog/DialogSubmitTest"; // Sesuaikan path lu
import { ReviewUserInfoCard } from "../components/Card/ReviewUserInfoCard";
import { ReviewTimerBox } from "../components/Card/ReviewTimerBox";
import { ReviewWarningBox } from "../components/Card/ReviewWarningBox";
import { ReviewQuestionGrid } from "../components/Card/ReviewQuestionsGrid";


// --- DUMMY DATA UNTUK SIMULASI ---
const TOTAL_QUESTIONS = 40;
const DUMMY_USER = {
  name: "Student Fighter",
  email: "student@ieltsvibe.com",
  testName: "Cambridge IELTS 18 - Academic Reading",
};

export default function MockSubmitReviewContainer() {
  const router = useRouter();

  // Bikin dummy status jawaban
  const questionStatuses = useMemo(() => {
    return Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
      if ([12, 15, 24, 31, 39].includes(i)) return "unanswered";
      if ([5, 8, 20, 27, 35].includes(i)) return "flagged";
      return "answered";
    });
  }, []);

  // Hitung statistik
  const stats = useMemo(() => {
    const answered = questionStatuses.filter(s => s === "answered").length;
    const unanswered = questionStatuses.filter(s => s === "unanswered").length;
    const flagged = questionStatuses.filter(s => s === "flagged").length;
    return { answered, unanswered, flagged };
  }, [questionStatuses]);

  // Handler kalau user klik grid nomor soal (balik ke halaman ujian)
  const handleQuestionClick = (questionNumber: number) => {
    console.log(`Navigasi balik ke soal nomor ${questionNumber}`);
    router.back(); 
    // Nanti lu bisa passing query params buat nembak index soalnya. 
    // Contoh: router.push(`/student/test/mock/123/exam?soal=${questionNumber}`)
  };

  return (
    <div className="fixed inset-0 z-[100] h-screen w-full bg-[#f8fafc] overflow-y-auto py-12 px-4 sm:px-6 lg:px-8 font-sans [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-cyan/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Siap untuk mengumpulkan?
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Cek kembali jawabanmu sebelum waktu habis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- KOLOM KIRI (Col span 4) --- */}
          <div className="lg:col-span-4 space-y-6">
            <ReviewUserInfoCard user={DUMMY_USER} />
            
            <ReviewTimerBox timeLeftStr="12:45" />

            <div className="space-y-3">
              <SubmitTestDialog />
              <Button 
                variant="outline"
                onClick={() => router.back()}
                className="w-full h-14 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="mr-2" size={18} />
                Kembali ke Lembar Soal
              </Button>
            </div>
          </div>

          {/* --- KOLOM KANAN (Col span 8) --- */}
          <div className="lg:col-span-8 space-y-6">
            <ReviewWarningBox unansweredCount={stats.unanswered} />
            
            <ReviewQuestionGrid 
              statuses={questionStatuses} 
              stats={stats} 
              totalQuestions={TOTAL_QUESTIONS} 
              onQuestionClick={handleQuestionClick} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}