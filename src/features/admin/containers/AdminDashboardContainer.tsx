"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  MonitorPlay, 
  FileText, 
  Settings, 
  LogOut,
  Search,
  Bell,
  TrendingUp,
  FileEdit,
  CheckCircle
} from "lucide-react";
import { cn } from "@/src/libs/utils";

// --- DUMMY DATA ---
const SIDEBAR_MENUS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "questions", label: "Question Bank", icon: Database },
  { id: "students", label: "Students", icon: Users },
  { id: "monitoring", label: "Exam Monitor", icon: MonitorPlay },
  { id: "grading", label: "Manual Grading", icon: FileEdit, badge: "12" }, // Badge buat ngasih tau ada tugas nunggu dinilai
  { id: "reports", label: "Reports", icon: FileText },
];

const QUICK_STATS = [
  { title: "Total Students", value: "1,248", trend: "+12% this month", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { title: "Active Tryouts", value: "34", trend: "5 currently live", icon: MonitorPlay, color: "text-emerald-500", bg: "bg-emerald-50" },
  { title: "Question Bank", value: "5,842", trend: "+142 added this week", icon: Database, color: "text-brand-purple", bg: "bg-brand-purple/10" },
  { title: "Needs Grading", value: "12", trend: "Writing Task 2", icon: FileEdit, color: "text-rose-500", bg: "bg-rose-50" },
];

export default function AdminDashboardContainer() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
   

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Dashboard Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8">
          
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800">Good morning, Teacher! 👋</h2>
            <p className="text-slate-500 mt-1">Here is what's happening with your students today.</p>
          </div>

          {/* 1. QUICK STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {QUICK_STATS.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                      <StatIcon size={24} />
                    </div>
                    <TrendingUp size={20} className="text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 mb-1">{stat.value}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-2">{stat.title}</p>
                    <p className="text-xs font-bold text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded-lg">
                      {stat.trend}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. RECENT ACTIVITY & QUICK ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Recent Submissions (Bigger) */}
            <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Needs Manual Grading</h3>
                <button className="text-sm font-bold text-brand-purple hover:underline">View All</button>
              </div>
              
              <div className="space-y-4">
                {/* Dummy List Item */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex flex-shrink-0 items-center justify-center font-bold text-slate-500">
                        S{item}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Student Name {item}</p>
                        <p className="text-xs font-medium text-slate-500">Writing Task 2 • Submitted 2 hours ago</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:border-brand-purple hover:text-brand-purple transition-colors shadow-sm">
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Quick Actions */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-[24px] shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/20 blur-3xl rounded-full"></div>
              
              <h3 className="font-bold text-lg mb-6 relative z-10">Quick Actions</h3>
              
              <div className="space-y-3 relative z-10">
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/5 backdrop-blur-sm group">
                  <div className="flex items-center gap-3">
                    <Database size={18} className="text-brand-cyan" />
                    <span className="font-medium text-sm">Add New Question</span>
                  </div>
                  <CheckCircle size={16} className="text-white/30 group-hover:text-white/70" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/5 backdrop-blur-sm group">
                  <div className="flex items-center gap-3">
                    <MonitorPlay size={18} className="text-brand-purple" />
                    <span className="font-medium text-sm">Create Tryout Session</span>
                  </div>
                  <CheckCircle size={16} className="text-white/30 group-hover:text-white/70" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}