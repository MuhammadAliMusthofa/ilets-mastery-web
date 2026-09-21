"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Target, AlertTriangle, MonitorPlay, Loader2 } from "lucide-react";
import { useExamPackage, useStartAttempt } from "../hooks/useExam";
import { MOCK_ROUTES } from "../constants/routes";
import { SKILL_LABELS } from "@/src/models/ielts";

interface MockTestDetailProps {
  testId: string;
}

const readErrorMessage = (error: unknown): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? "Gagal memulai ujian. Coba lagi.";
};

export default function MockTestDetailContainer({ testId }: MockTestDetailProps) {
  const router = useRouter();
  const packageId = Number(testId);
  const { data: pkg, isLoading, isError } = useExamPackage(packageId);
  const startAttempt = useStartAttempt();

  const inProgress = pkg?.last_attempt?.status === "IN_PROGRESS";

  const handleStart = async () => {
    try {
      const session = await startAttempt.mutateAsync(packageId);
      // Tidak perlu reset store: hydrate() di halaman ujian mengganti lembar
      // jawaban hanya bila attempt-nya berbeda, sehingga jawaban lokal yang
      // belum tersimpan pada attempt yang dilanjutkan tidak ikut terbuang.
      router.push(MOCK_ROUTES.exam(packageId, session.attempt_id));
    } catch {
      // Pesan dirender dari state mutation.
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={20} /> Memuat tes…
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 font-medium text-slate-600">Tes tidak ditemukan atau belum diterbitkan.</p>
        <Button variant="outline" onClick={() => router.push(MOCK_ROUTES.list)}>
          Kembali ke daftar tes
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <button
        type="button"
        onClick={() => router.push(MOCK_ROUTES.list)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-purple transition-colors mb-8 bg-white/50 px-4 py-2 rounded-full w-fit backdrop-blur-sm"
      >
        <ArrowLeft size={16} /> Kembali ke Daftar Tes
      </button>

      <div className="relative mb-8 p-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-[32px] shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 rounded-full blur-3xl mix-blend-screen" />
        <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-[31px] p-8 sm:p-12 text-white border border-white/10">
          <div className="flex flex-wrap gap-2 mb-4">
            {pkg.skills.map((skill) => (
              <span
                key={skill}
                className="bg-brand-cyan/20 text-brand-cyan px-3 py-1 rounded-md font-bold text-xs uppercase tracking-widest border border-brand-cyan/30"
              >
                {SKILL_LABELS[skill]}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">{pkg.title}</h1>
          <p className="text-slate-300 text-lg max-w-xl">
            {pkg.description ??
              "Kerjakan dengan fokus, perhatikan waktu, dan pastikan koneksi internet stabil."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 sm:p-8 rounded-[24px] border-slate-100 shadow-sm bg-white/80 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Target className="text-brand-purple" /> Susunan Ujian
            </h2>
            <ul className="divide-y divide-slate-100">
              {pkg.sections.map((section) => (
                <li key={section.skill} className="flex items-center justify-between py-3">
                  <span className="font-bold text-slate-700">{SKILL_LABELS[section.skill]}</span>
                  <span className="text-sm font-medium text-slate-500">
                    {section.total_marks} soal · {section.duration_minutes} menit
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="bg-orange-50 border border-orange-100 p-6 rounded-[24px] flex items-start gap-4">
            <AlertTriangle className="text-orange-500 shrink-0" />
            <div>
              <h4 className="font-bold text-orange-900 mb-1">Waktu tetap berjalan</h4>
              <p className="text-orange-700 text-sm font-medium">
                Jawaban tersimpan otomatis. Kalau kamu menutup browser, waktu tetap berjalan di
                server dan kamu bisa melanjutkan dari perangkat mana pun sebelum waktu habis.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-6 rounded-[24px] border-slate-100 shadow-sm bg-white/80 backdrop-blur-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-4">
              <Clock size={32} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Durasi</p>
            <h3 className="text-3xl font-black text-slate-800 mb-6">{pkg.duration_minutes} Min</h3>

            <Button
              onClick={handleStart}
              disabled={startAttempt.isPending || pkg.total_marks === 0}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-black shadow-lg shadow-brand-purple/20 hover:scale-[1.02] transition-all text-lg disabled:opacity-60 disabled:hover:scale-100"
            >
              {startAttempt.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {inProgress ? "Lanjutkan Ujian" : "Mulai Ujian"}
                  <MonitorPlay className="ml-2" size={20} />
                </>
              )}
            </Button>

            {startAttempt.isError && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {readErrorMessage(startAttempt.error)}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
