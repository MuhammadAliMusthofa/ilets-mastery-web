"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic2,
  Clock,
  PlayCircle,
  Layers,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/src/libs/utils";
import { useExamPackages } from "../hooks/useExam";
import { MOCK_ROUTES } from "../constants/routes";
import { SKILL_LABELS, type Skill } from "@/src/models/ielts";

const CATEGORIES: Array<{ id: Skill | "all"; label: string; icon: typeof Layers }> = [
  { id: "all", label: "Semua", icon: Layers },
  { id: "LISTENING", label: "Listening", icon: Headphones },
  { id: "READING", label: "Reading", icon: BookOpen },
  { id: "WRITING", label: "Writing", icon: PenTool },
  { id: "SPEAKING", label: "Speaking", icon: Mic2 },
];

const SKILL_BADGE: Record<Skill, string> = {
  LISTENING: "bg-blue-50 text-blue-600",
  READING: "bg-emerald-50 text-emerald-600",
  WRITING: "bg-orange-50 text-orange-600",
  SPEAKING: "bg-brand-purple/10 text-brand-purple",
};

export default function MockTestListContainer() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Skill | "all">("all");
  const { data: packages, isLoading, isError } = useExamPackages();

  const filtered = (packages ?? []).filter((pkg) =>
    activeFilter === "all" ? true : pkg.skills.includes(activeFilter)
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
          Mock <span className="text-brand-purple">Tests</span>
        </h1>
        <p className="text-slate-500 font-medium">
          Simulasi IELTS General Training dengan waktu dan penilaian seperti ujian asli.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
        {CATEGORIES.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveFilter(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all",
                isActive
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              <cat.icon size={16} className={isActive ? "text-brand-cyan" : "opacity-70"} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-64 rounded-[24px] bg-white/60 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <p className="py-20 text-center font-medium text-red-500">
          Gagal memuat daftar tes. Coba muat ulang halaman.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((pkg) => {
          const last = pkg.last_attempt;
          const inProgress = last?.status === "IN_PROGRESS";
          const done = last?.status === "SUBMITTED";
          const bands = Object.values(last?.band_scores ?? {}).filter(
            (band): band is number => typeof band === "number"
          );

          return (
            <Card
              key={pkg.id}
              className="group p-5 sm:p-6 bg-white/80 backdrop-blur-md border-slate-100 hover:border-brand-purple/30 hover:shadow-xl transition-all duration-300 rounded-[24px] flex flex-col"
            >
              <div className="flex justify-between items-start gap-2 mb-4">
                <div className="flex flex-wrap gap-1.5">
                  {pkg.skills.map((skill) => (
                    <span
                      key={skill}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider",
                        SKILL_BADGE[skill]
                      )}
                    >
                      {SKILL_LABELS[skill]}
                    </span>
                  ))}
                </div>
                {done && (
                  <div className="flex shrink-0 items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                    <CheckCircle2 size={14} />
                    {bands.length > 0 ? `Band ${bands.join(" / ")}` : "Selesai"}
                  </div>
                )}
                {inProgress && (
                  <div className="shrink-0 text-amber-700 text-xs font-bold bg-amber-50 px-2 py-1 rounded-md">
                    Sedang berjalan
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-brand-purple transition-colors">
                {pkg.title}
              </h3>
              {pkg.description && (
                <p className="mb-4 line-clamp-2 text-sm text-slate-500">{pkg.description}</p>
              )}

              <div className="mt-auto flex items-center gap-4 text-sm font-medium text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-slate-400" /> {pkg.duration_minutes} menit
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1.5">
                  <BookOpen size={16} className="text-slate-400" /> {pkg.total_marks} soal
                </div>
              </div>

              <div className="flex gap-2">
                {done && last && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(MOCK_ROUTES.result(pkg.id, last.id))}
                    className="h-12 flex-1 rounded-xl font-bold"
                  >
                    Lihat hasil
                  </Button>
                )}
                <Button
                  onClick={() => router.push(MOCK_ROUTES.detail(pkg.id))}
                  className="h-12 flex-1 rounded-xl bg-slate-900 hover:bg-brand-purple text-white font-bold transition-all shadow-md"
                >
                  {inProgress ? "Lanjutkan" : done ? "Ulangi" : "Lihat detail"}
                  {done ? <RotateCcw size={16} className="ml-2" /> : <PlayCircle size={18} className="ml-2" />}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-medium">
          {packages && packages.length > 0
            ? "Belum ada tes untuk skill ini."
            : "Belum ada tes yang diterbitkan. Nantikan segera."}
        </div>
      )}
    </div>
  );
}
