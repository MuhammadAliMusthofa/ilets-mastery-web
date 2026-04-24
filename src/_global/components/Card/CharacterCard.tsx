"use client";

import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { cn } from "@/src/libs/utils";
import { MagicCard } from "@/components/ui/magic-card";

interface CharacterCardProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  imageUrl: string;
  gradientColor?: string;
  avatarBg?: string;
  onClick?: () => void;
  className?: string;
}

function AvatarCard({ imageSrc, avatarBg }: { imageSrc: string; avatarBg: string }) {
  return (
    <div className={cn(
      "relative rounded-2xl sm:rounded-3xl w-20 h-20 sm:w-28 sm:h-28 shadow-inner flex-shrink-0 transition-transform duration-300 group-hover:scale-105",
      avatarBg
    )}>
      <div className="absolute -top-24 sm:-top-32 bottom-0 left-0 right-0 overflow-hidden rounded-b-2xl sm:rounded-b-3xl z-10 pointer-events-none">
        <Image
          src={imageSrc}
          alt="Avatar"
          width={400}
          height={500}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[110px] sm:w-[150px] h-auto max-w-none object-contain transition-transform duration-500 group-hover:-translate-y-2 drop-shadow-xl"
          priority
          unoptimized
        />
      </div>
      
      <div className="absolute inset-0 bg-black/5 rounded-2xl sm:rounded-3xl pointer-events-none"></div>
    </div>
  );
}

export function CharacterCard({
  title,
  subtitle,
  icon,
  imageUrl,
  gradientColor = "#9E7AFF", 
  avatarBg = "bg-slate-200",
  onClick,
  className
}: CharacterCardProps) {
  return (
    <div
      className={cn("relative mb-2 mt-8 w-full group cursor-pointer", className)}
      onClick={onClick}
    >
      <MagicCard
        className="w-full h-[120px] sm:h-[150px] rounded-[24px] sm:rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300 border-slate-100/50"
        gradientColor={gradientColor}
      >
        <div className="relative z-50 flex items-center w-full h-full p-4 sm:p-6">
          <div className="mr-4 sm:mr-8 w-20 sm:w-28 shrink-0" />
          <div className="flex flex-col gap-0.5 sm:gap-1 flex-grow overflow-hidden text-left">
            <h2 className="text-slate-900 text-lg sm:text-2xl font-black tracking-tight truncate">
              {title}
            </h2>

            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400">
              {icon && <div className="flex-shrink-0 scale-90 sm:scale-100 opacity-60">{icon}</div>}
              <p className="text-[11px] sm:text-base font-bold italic truncate leading-tight opacity-80">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </MagicCard>

      <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <AvatarCard imageSrc={imageUrl} avatarBg={avatarBg} />
      </div>
    </div>
  );
}