"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Maximize, Minimize, CheckCircle2 } from "lucide-react"; // Tambah icon check
import { Button } from "@/components/ui/button";
import { RenderQuestions } from "./Render/RenderQuestions";
import { MOCK_QUESTIONS } from "../constants/constant";
import { DialogShowAllNumber } from "../components/Dialog/DialogShowAllNumber";
import { ExamTimer } from "../components/Timer/ExamTimer";

export default function MockExamTestContainer() {
    const router = useRouter();
    const params = useParams();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const currentQuestionData = MOCK_QUESTIONS[activeQuestionIndex];

    // Logic buat ngecek apakah ini soal terakhir
    const isLastQuestion = activeQuestionIndex === MOCK_QUESTIONS.length - 1;

    // Fungsi yang dipanggil pas tombol Next/Submit diklik
    const handleNextOrSubmit = () => {
        if (isLastQuestion) {
            // 1. Matikan fullscreen kalau aktif (biar nggak aneh pas pindah halaman)
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen();
            }

            // 2. Lempar ke halaman review submission
            // Pastikan route ini sesuai sama folder lu ya bang!
            router.push(`/student/test/mock/${params?.testId}/review`);
        } else {
            // Pindah ke soal selanjutnya
            setActiveQuestionIndex(prev => prev + 1);
        }
    };

    // --- FUNGSI DUMMY STATUS (Nanti diganti pengecekan ke state Zustand) ---
    const getQuestionStatus = (index: number) => {
        // Kita bikin seolah-olah soal nomor 1-2 udah dijawab, soal 3 di-flag, sisanya kosong.
        // Nanti real-nya: Cek apakah `answers[index]` ada isinya atau nggak.
        if (index === 0 || index === 1) return "answered";
        if (index === 2) return "flagged";
        return "unanswered";
    };

    // Fungsi yang dieksekusi pas timer nyentuh 00:00
    const handleTimeUp = () => {
        console.log("WAKTU HABIS! Auto-submitting...");

        // Matikan fullscreen kalau aktif
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen();
        }

        // Nanti di sini lu panggil API Mutasi Submit-nya
        // ...

        // Lempar ke halaman review atau result
        router.push(`/student/test/mock/${params?.testId}/review`);
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans">

            {/* --- HEADER UTAMA --- */}
            <header className="h-16 bg-slate-900 flex items-center justify-between px-6 shrink-0 shadow-md">
                <h1 className="font-bold text-slate-200">IELTS Mock Test - ID: {params?.testId}</h1>
                    <ExamTimer
                        initialSeconds={60} // Dummy: 3600 detik = 60 Menit
                        onTimeUp={handleTimeUp}
                    />
                <div className="flex items-center gap-3">
                    <Button onClick={toggleFullscreen} variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700">
                        {isFullscreen ? <Minimize size={16} className="mr-2" /> : <Maximize size={16} className="mr-2" />}
                        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </Button>
                    <Button onClick={() => router.back()} variant="destructive" size="sm">
                        Akhiri Tes
                    </Button>
                </div>
            </header>

            {/* --- SUB-HEADER --- */}
            <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                <div className="font-bold text-slate-600">
                    Soal {activeQuestionIndex + 1} / {MOCK_QUESTIONS.length}
                </div>

                <div className="flex items-center gap-4">
                
                    <DialogShowAllNumber
                        totalQuestions={MOCK_QUESTIONS.length}
                        activeQuestionIndex={activeQuestionIndex}
                        getQuestionStatus={getQuestionStatus}
                        onQuestionSelect={(newIndex) => setActiveQuestionIndex(newIndex)}
                    />
                </div>
            </div>

            {/* --- KONTEN SOAL UTAMA --- */}
            <div className="flex-1 overflow-hidden relative">
                <RenderQuestions
                    questionData={currentQuestionData}
                    questionNumber={activeQuestionIndex + 1}
                />
            </div>

            {/* --- FOOTER UTAMA --- */}
            <footer className="h-16 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0">
                <Button
                    variant="outline"
                    disabled={activeQuestionIndex === 0}
                    onClick={() => setActiveQuestionIndex(prev => prev - 1)}
                >
                    Soal Sebelumnya
                </Button>

                {/* Tombol Dinamis: Kalo last index jadi Kumpulkan, kalo engga ya Next */}
                <Button
                    className={
                        isLastQuestion
                            ? "bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-md hover:scale-[1.02] transition-all font-bold"
                            : "bg-slate-900 text-white hover:bg-brand-purple font-bold"
                    }
                    onClick={handleNextOrSubmit}
                >
                    {isLastQuestion ? (
                        <>Selesai & Review <CheckCircle2 className="ml-2" size={18} /></>
                    ) : (
                        "Soal Selanjutnya"
                    )}
                </Button>
            </footer>

        </div>
    );
}