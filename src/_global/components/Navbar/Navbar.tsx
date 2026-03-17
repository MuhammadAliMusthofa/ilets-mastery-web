"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Bell, User, LogOut, Settings, LayoutDashboard, BookOpen } from "lucide-react";
import { useAuthStore } from "@/src/store/authStore";
import { cn } from "@/src/libs/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Daftar menu navigasi (bisa ditambahin sesuai role nanti)
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Practice", href: "/practice", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/40 bg-white/60 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LEFT: LOGO & NAV LINKS */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-purple text-white shadow-lg shadow-brand-purple/20">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              IELTS<span className="bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">vibe</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 rounded-full px-4 text-slate-600 hover:text-brand-purple hover:bg-white",
                    pathname === item.href && "bg-white text-brand-purple shadow-sm"
                  )}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT: ACTIONS & PROFILE */}
        <div className="flex items-center gap-3">
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-600 hover:bg-white hover:text-brand-purple transition-all">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-pink-500 border-2 border-white"></span>
          </Button>

          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

          {/* PROFILE DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 pr-4 transition-all hover:border-brand-purple/40 hover:shadow-md outline-none">
                {/* Avatar / Icon */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-500 group-hover:from-brand-cyan group-hover:to-brand-purple group-hover:text-white transition-all overflow-hidden font-bold text-xs">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="profile" className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || "G"
                  )}
                </div>
                
                {/* User Info */}
                <div className="hidden text-left sm:block">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                    {user?.name || "Guest User"}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
                    {user?.role || "Visitor"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 mt-2">
              <div className="px-3 py-2 sm:hidden">
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <DropdownMenuLabel className="px-3 py-1.5 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                Menu Utama
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-50" />
              
              <DropdownMenuItem className="flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                <User size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Profil Saya</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                <Settings size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Pengaturan</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-slate-50" />
              
              <DropdownMenuItem 
                onClick={() => logout()}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-500 transition-colors"
              >
                <LogOut size={16} />
                <span className="text-sm font-bold">Keluar Aplikasi</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </nav>
  );
}