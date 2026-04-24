"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  Settings, 
  LogOut,
  BookOpen,
  FolderArchive,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/src/libs/utils";

// --- MENU KHUSUS ADMIN CMS ---
const SIDEBAR_MENUS = [
  { id: "overview", label: "System Overview", icon: LayoutDashboard, href: "/admin" },
  { id: "questions", label: "Question Bank", icon: Database, href: "/admin/questions" },
  { id: "materials", label: "Study Materials", icon: BookOpen, href: "/admin/materials" }, // Buat ngatur Idioms, Vocab, Tenses
  { id: "packages", label: "Exam Packages", icon: FolderArchive, href: "/admin/packages" }, // Buat ngerakit Tryout
  { id: "users", label: "User Management", icon: Users, href: "/admin/users" }, // Buat ngatur Siswa & Guru
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between shadow-sm z-20 shrink-0">
      <div>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-slate-50">
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            IELTS<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">vibe</span>
            <span className="ml-2 text-[10px] font-bold tracking-wider px-2 py-0.5 bg-slate-800 text-white rounded-full align-top">
              CMS
            </span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 mt-4">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Content Manager</p>
          {SIDEBAR_MENUS.map((menu) => {
            const isActive = pathname === menu.href || (menu.href !== "/admin" && pathname.startsWith(menu.href));
            const Icon = menu.icon;
            
            return (
              <Link
                key={menu.id}
                href={menu.href}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                  isActive 
                    ? "bg-gradient-to-r from-brand-cyan/10 to-transparent text-brand-cyan" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? "text-brand-cyan" : "text-slate-400 group-hover:text-slate-600"} />
                  <span>{menu.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100 space-y-1">
        {/* Menu tambahan buat Admin */}
        <Link href="/admin/roles" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
          <ShieldCheck size={20} className="text-slate-400" />
          <span>Roles & Permissions</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
          <Settings size={20} className="text-slate-400" />
          <span>System Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors font-medium mt-2 border border-transparent hover:border-rose-100">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}