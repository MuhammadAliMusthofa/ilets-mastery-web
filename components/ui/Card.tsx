import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/libs/utils"

// 1. KITA BIKIN KAMUS VARIAN CARD-NYA
const cardVariants = cva(
  // Base style: Semua kartu bakal melengkung 24px dan punya transisi halus
  "relative rounded-[24px] text-slate-900 transition-all duration-300", 
  {
    variants: {
      variant: {
        // Kartu standar
        default: "bg-white border border-slate-200 shadow-sm hover:shadow-md",
        
        // Kartu Kaca
        glass: "bg-white/40 backdrop-blur-md border border-white/60 shadow-xl shadow-slate-200/30",
        
        // 🔥 PERBAIKAN: Menggunakan trik padding transparan untuk border gradient
        gradientBrand: "bg-white shadow-sm hover:shadow-md hover:shadow-brand-purple/20 hover:-translate-y-1 relative border-[1px] border-transparent [background-clip:padding-box,border-box] [background-origin:border-box] bg-[linear-gradient(white,white),linear-gradient(to_right,theme(colors.brand-cyan),theme(colors.brand-purple))]",

        gradientWarm: "bg-white shadow-sm hover:shadow-md hover:shadow-pink-200/50 hover:-translate-y-1 relative border-[1px] border-transparent [background-clip:padding-box,border-box] [background-origin:border-box] bg-[linear-gradient(white,white),linear-gradient(to_top_right,theme(colors.pink.400),theme(colors.purple.400),theme(colors.orange.400))]",

        gradientCool: "bg-white shadow-sm hover:shadow-md hover:shadow-blue-200/50 hover:-translate-y-1 relative border-[1px] border-transparent [background-clip:padding-box,border-box] [background-origin:border-box] bg-[linear-gradient(white,white),linear-gradient(to_top_right,theme(colors.emerald.300),theme(colors.blue.500))]",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
)

// 2. TAMBAHKAN VARIANT PROPS KE INTERFACE CARD
export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof cardVariants> {}

// 3. KOMPONEN CARD UTAMA
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

// --- (Komponen Header, Title, Content di bawah ini tetap sama seperti biasa) ---

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 relative z-10", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent, cardVariants }