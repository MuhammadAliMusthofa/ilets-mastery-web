"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Target, AlertTriangle, MonitorPlay } from "lucide-react";

interface MockTestDetailProps {
  testId: string;
}

export default function MockTestDetailContainer({ testId }: MockTestDetailProps) {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* Navigation Back */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-purple transition-colors mb-8 bg-white/50 px-4 py-2 rounded-full w-fit backdrop-blur-sm"
      >
        <ArrowLeft size={16} /> Kembali ke Daftar Tes
      </button>

      {/* Hero Banner */}
      <div className="relative mb-8 p-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-[32px] shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 rounded-full blur-3xl mix-blend-screen"></div>
        <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-[31px] p-8 sm:p-12 text-white border border-white/10">
          <div className="bg-brand-cyan/20 text-brand-cyan px-3 py-1 rounded-md font-bold text-xs w-fit mb-4 uppercase tracking-widest border border-brand-cyan/30">
            Reading Module
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
            Academic Reading Practice
          </h1>
          <p className="text-slate-300 text-lg max-w-xl">
            Simulasi tes ID {testId}. Kerjakan dengan fokus, perhatikan waktu, dan pastikan koneksi internet stabil.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Kolom Kiri: Informasi */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 sm:p-8 rounded-[24px] border-slate-100 shadow-sm bg-white/80 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Target className="text-brand-purple" /> Instruksi Ujian
            </h2>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                Kamu memiliki waktu 60 menit untuk menyelesaikan 40 pertanyaan.
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                Terdapat 3 bagian bacaan (*Reading Passages*). Baca dengan teliti.
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                Pastikan pengejaan kata (*spelling*) benar karena akan memengaruhi skor.
              </li>
            </ul>
          </Card>

          <div className="bg-orange-50 border border-orange-100 p-6 rounded-[24px] flex items-start gap-4">
            <AlertTriangle className="text-orange-500 shrink-0" />
            <div>
              <h4 className="font-bold text-orange-900 mb-1">Perhatian!</h4>
              <p className="text-orange-700 text-sm font-medium">
                Jika kamu keluar dari layar ujian (*refresh* atau tutup *browser*), waktu akan terus berjalan dan progres mungkin tidak tersimpan.
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Tombol Action */}
        <div className="space-y-4">
          <Card className="p-6 rounded-[24px] border-slate-100 shadow-sm bg-white/80 backdrop-blur-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-4">
              <Clock size={32} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Durasi</p>
            <h3 className="text-3xl font-black text-slate-800 mb-6">60 Min</h3>
            
            <Button 
              onClick={() => router.push(`/student/test/mock/${testId}/exam`)}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-black shadow-lg shadow-brand-purple/20 hover:scale-[1.02] transition-all text-lg"
            >
              Mulai Ujian <MonitorPlay className="ml-2" size={20} />
            </Button>
          </Card>
        </div>

      </div>

    </div>
  );
}