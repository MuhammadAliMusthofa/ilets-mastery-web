"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Headphones, BookOpen, PenTool, Mic2, Clock, PlayCircle, Layers, CheckCircle2 } from "lucide-react";
import { cn } from "@/src/libs/utils";

// 1. MOCK DATA
const MOCK_TESTS = [
  { id: "101", title: "Cambridge 18 - Test 1", category: "listening", duration: "30 Min", questions: 40, status: "new" },
  { id: "102", title: "Academic Reading Practice", category: "reading", duration: "60 Min", questions: 40, status: "completed" },
  { id: "103", title: "Task 1 & 2 Masterclass", category: "writing", duration: "60 Min", questions: 2, status: "new" },
  { id: "104", title: "Speaking Part 1-3", category: "speaking", duration: "15 Min", questions: 3, status: "new" },
  { id: "105", title: "Cambridge 18 - Test 2", category: "listening", duration: "30 Min", questions: 40, status: "new" },
];

const CATEGORIES = [
  { id: "all", label: "All Categories", icon: Layers },
  { id: "listening", label: "Listening", icon: Headphones },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "writing", label: "Writing", icon: PenTool },
  { id: "speaking", label: "Speaking", icon: Mic2 },
];

export default function MockTestListContainer() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");

  // Logic untuk memfilter data
  const filteredTests = MOCK_TESTS.filter(test => 
    activeFilter === "all" ? true : test.category === activeFilter
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
          Mock <span className="text-brand-purple">Tests</span> 🎯
        </h1>
        <p className="text-slate-500 font-medium">Uji kemampuanmu dengan simulasi ujian berstandar IELTS resmi.</p>
      </div>

      {/* --- FILTER BUTTONS --- */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
        {CATEGORIES.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
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

      {/* --- TEST GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <Card key={test.id} className="group p-5 sm:p-6 bg-white/80 backdrop-blur-md border-slate-100 hover:border-brand-purple/30 hover:shadow-xl transition-all duration-300 rounded-[24px]">
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5",
                test.category === 'listening' ? "bg-blue-50 text-blue-600" :
                test.category === 'reading' ? "bg-emerald-50 text-emerald-600" :
                test.category === 'writing' ? "bg-orange-50 text-orange-600" :
                "bg-brand-purple/10 text-brand-purple"
              )}>
                {test.category}
              </div>
              {test.status === "completed" && (
                <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                  <CheckCircle2 size={14} /> Done
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-brand-purple transition-colors">
              {test.title}
            </h3>

            <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl">
              <div className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> {test.duration}</div>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <div className="flex items-center gap-1.5"><BookOpen size={16} className="text-slate-400" /> {test.questions} Qs</div>
            </div>

            <Button 
              onClick={() => router.push(`/student/test/mock/${test.id}`)}
              className="w-full rounded-xl bg-slate-900 hover:bg-brand-purple text-white font-bold h-12 transition-all shadow-md"
            >
              {test.status === "completed" ? "Review Result" : "View Details"}
              <PlayCircle size={18} className="ml-2" />
            </Button>
          </Card>
        ))}
      </div>
      
      {filteredTests.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-medium">
          Belum ada tes untuk kategori ini.
        </div>
      )}

    </div>
  );
}