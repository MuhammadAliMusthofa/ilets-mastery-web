"use client";

import React from "react";
import Image from "next/image"; // Import Next Image
import { cn } from "@/src/libs/utils";

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  imageUrl: string;
  onClick?: () => void;
  className?: string;
  gradientColor?: string;
}

export function FeatureCard({
  title,
  subtitle,
  icon,
  imageUrl,
  onClick,
  className,
  gradientColor = "from-cyan-400 via-purple-500 to-pink-500",
}: FeatureCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative mt-12 cursor-pointer transition-all duration-300 hover:translate-y-[-4px]",
        className
      )}
    >
      {/* GARIS GRADIENT (BORDER) */}
      <div className={cn(
        "absolute -inset-[1.5px] rounded-[32px] bg-gradient-to-r p-[1.5px] shadow-xl shadow-slate-200/50",
        gradientColor
      )}>
        {/* BODY UTAMA */}
        <div className="relative h-full w-full rounded-[30px] bg-white p-6 pl-32 sm:pl-44 flex flex-col justify-center min-h-[140px]">
          
          {/* AREA GAMBAR - Pakai Next Image dengan layout fill */}
          <div className="absolute -left-6 -top-10 bottom-4 w-32 sm:w-44 overflow-visible">
            <div className="relative h-full w-full drop-shadow-2xl transition-transform duration-500 group-hover:scale-110">
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 128px, 176px" // Optimasi loading sesuai ukuran W-32/44
                 className="object-cover rounded-[30px]"
                priority // Tambahin ini kalau card muncul di atas (LCP) biar loading secepat kilat
              />
            </div>
          </div>

          {/* KONTEN TEKS */}
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-tight">
              {title}
            </h3>
            
            <div className="flex items-center gap-2 text-slate-500">
              {icon && <div className="shrink-0 opacity-60">{icon}</div>}
              <p className="text-sm sm:text-base font-semibold italic opacity-70 line-clamp-1">
                {subtitle}
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}