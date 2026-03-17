import * as React from "react"
import { cn } from "@/src/libs/utils"

// 1. MAPPING WARNA (Gw tambahin emerald biar makin lengkap)
const themeStyles = {
  purple: {
    badge: "bg-purple-100 text-purple-700",
    shadow: "hover:shadow-purple-200/50",
  },
  orange: {
    badge: "bg-orange-100 text-orange-700",
    shadow: "hover:shadow-orange-200/50",
  },
  blue: {
    badge: "bg-blue-100 text-blue-700",
    shadow: "hover:shadow-blue-200/50",
  },
  rose: {
    badge: "bg-rose-100 text-rose-700",
    shadow: "hover:shadow-rose-200/50",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-700",
    shadow: "hover:shadow-emerald-200/50",
  },
  brand: {
    badge: "bg-brand-cyan/15 text-brand-purple",
    shadow: "hover:shadow-brand-purple/20",
  }
}

// 2. PROPS: number/badge dibikin opsional, deskripsi dibebasin
export interface CardMenuWithIllustrationProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: React.ReactNode; // Bisa string biasa, atau elemen React custom
  illustration: React.ReactNode;
  theme?: keyof typeof themeStyles;
  badge?: React.ReactNode; // Bebas mau diisi angka "1", icon Lucide, atau dikosongin
}

export function CardMenuWithIllustration({
  title,
  description,
  illustration,
  theme = "blue",
  badge,
  className,
  ...props
}: CardMenuWithIllustrationProps) {
  
  const currentTheme = themeStyles[theme];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] bg-white p-6 transition-all duration-300 cursor-pointer",
        "border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1",
        currentTheme.shadow,
        className
      )}
      {...props}
    >
      {/* BAGIAN ATAS: Badge (Opsional) & Judul */}
      <div className="mb-3 flex items-center gap-3">
        {badge && (
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold text-sm",
            currentTheme.badge
          )}>
            {badge}
          </div>
        )}
        <h3 className="text-xl font-bold text-slate-800 leading-tight z-10 relative">
          {title}
        </h3>
      </div>

      {/* BAGIAN TENGAH: Deskripsi */}
      <div className="pr-16 relative z-10 min-h-[60px]">
        <div className="text-sm leading-relaxed text-slate-500">
          {description}
        </div>
      </div>

      {/* ILUSTRASI DI POJOK KANAN BAWAH */}
      <div className="absolute -bottom-2 -right-4 flex h-[100px] w-[100px] items-center justify-center drop-shadow-sm transition-transform duration-300 hover:scale-110 opacity-90">
        <span className="text-7xl">
          {illustration}
        </span>
      </div>
    </div>
  )
}