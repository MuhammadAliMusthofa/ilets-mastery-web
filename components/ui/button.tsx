import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils" // Pastikan path ini sesuai dengan project lu

const buttonVariants = cva(
  // Base classes (Semua tombol otomatis jadi rounded-full dan punya animasi membal)
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 outline-none select-none focus-visible:ring-3 focus-visible:ring-brand-purple/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-sm hover:opacity-90 hover:shadow-md",
        outline: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 text-slate-700",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        link: "text-brand-purple underline-offset-4 hover:underline",

        // 🔥 INI DIA VARIAN BARU KITA: GRADIENT OUTLINE
        // Triknya: Tombolnya punya background putih, tapi kita taruh elemen gaib (::before) di belakangnya dengan ukuran sedikit lebih besar (inset -2px) dan kasih background gradasi!
        // Di dalam variant: { ... }
      gradientOutline: "relative bg-white text-slate-800 border-2 border-transparent bg-clip-padding before:absolute before:inset-0 before:-z-10 before:-m-[2px] before:rounded-[inherit] before:bg-gradient-to-r before:from-brand-cyan before:to-brand-purple hover:bg-transparent hover:text-white transition-all duration-300 shadow-sm hover:shadow-brand-purple/30",
      },
      size: {
        default: "h-11 gap-2 px-6",
        sm: "h-9 gap-1.5 px-4 text-xs",
        lg: "h-14 gap-3 px-8 text-base",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }