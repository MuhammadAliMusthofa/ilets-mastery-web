import * as React from "react";
import { cn } from "@/src/libs/utils"; // Pastikan path utils cn() lu bener

interface WrapperGridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function WrapperGridBackground({ 
  children, 
  className, 
  ...props 
}: WrapperGridBackgroundProps) {
  return (
 
    <div 
      className={cn("relative min-h-screen w-full bg-[#f8fafc] overflow-hidden", className)} 
      {...props}
    >
      {/* 2. Pattern Layer: bg-dot */}
      <div className="absolute inset-0 bg-grid bg-[size:3rem_3rem]" />
      
      {/* 3. Radial Mask */}
      <div className="absolute inset-0 pointer-events-none bg-[#f8fafc] [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_80%)]" />

      {/* 4. Konten Utama (Children) */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}