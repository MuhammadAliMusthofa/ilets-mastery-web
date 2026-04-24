"use client";

import React from "react";
import { Search, Bell } from "lucide-react";

export default function AdminTopbar() {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 z-10 shrink-0">
      
      {/* Search Bar - Diubah target pencariannya */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search question IDs, materials, or users..." 
          className="w-full bg-slate-50 border border-slate-100 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all"
        />
      </div>

      <div className="md:hidden"></div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={22} />
          {/* Badge notif sistem, misal server error atau user baru daftar */}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-cyan rounded-full border-2 border-white"></span>
        </button>
        
        <div className="w-px h-8 bg-slate-200"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 group-hover:text-brand-cyan transition-colors">Super Admin</p>
            <p className="text-xs text-slate-500 font-medium">System Manager</p>
          </div>
          {/* Avatar Admin dibikin beda warnanya (biru solid) */}
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-brand-cyan/20">
            SA
          </div>
        </div>
      </div>
      
    </header>
  );
}