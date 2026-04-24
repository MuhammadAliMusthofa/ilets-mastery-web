"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Send, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";

export function SubmitTestDialog() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LOGIC PENENTU JENIS TES (Diadaptasi dari kode lama lu)
  // Misal ngecek dari URL apakah ini Mock Test, Tryout, atau Latihan biasa
  const isMockTest = pathname.includes("mock");
  const isTryout = pathname.includes("tryout");

  const getTestTitle = () => {
    if (isTryout) return "Kumpulkan Jawaban Tryout?";
    if (isMockTest) return "Kumpulkan IELTS Mock Test?";
    return "Kumpulkan Latihan Soal?";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 1. TODO: Panggil API Mutasi lu di sini (useSubmitLatihanSoal)
      // await submitLatihanSoal({ id, body: [...] })
      
      // Simulasi delay API (Hapus ini kalau API asli udah dipasang)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Lempar ke halaman Result/History sesuai tipe tes
      if (isMockTest) {
        router.push("/student/test/mock/history"); // Ganti dengan rute result lu
      } else if (isTryout) {
        router.push("/student/tryout/history");
      } else {
        router.push("/student/latihan/history");
      }

    } catch (error) {
      console.error("Gagal melakukan submit:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* --- TOMBOL TRIGGER UTAMA --- */}
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full h-14 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-black shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg group"
      >
        Kumpulkan Sekarang
        <Send className="ml-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={20} />
      </Button>

      {/* --- MODAL DIALOG OVERLAY --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* DIALOG BOX */}
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Tombol X (Close) */}
            <button 
              onClick={() => !isSubmitting && setIsOpen(false)}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>

            {/* Konten Modal */}
            <div className="p-8 text-center flex flex-col items-center">
              
              {/* Ikon Ilustrasi */}
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={40} className="text-orange-500" />
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-2">
                {getTestTitle()}
              </h2>
              
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                Jawaban yang sudah dikumpulkan tidak dapat diubah kembali. Pastikan Anda sudah memeriksa semua nomor soal dengan teliti.
              </p>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-brand-purple text-white font-bold text-base transition-all"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Memproses...
                    </div>
                  ) : (
                    "Ya, Kumpulkan Jawaban"
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </Button>
              </div>

            </div>
          </div>

        </div>
      )}
    </>
  );
}