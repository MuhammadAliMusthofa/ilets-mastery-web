import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

/**
 * Tombol mengikuti Vibe (monday.com): sudut 4px, tinggi 32/40/48px,
 * satu biru untuk aksi utama. Nama varian lama dipertahankan agar halaman
 * yang memakainya tidak rusak; varian gradasi kini jatuh ke gaya outline.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[4px] border border-transparent text-sm font-medium whitespace-nowrap transition-colors duration-150 ease-out select-none outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:pointer-events-none disabled:bg-slate-100 disabled:text-slate-400 disabled:border-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600",
        outline: "border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
        secondary: "bg-slate-100 text-slate-800 hover:bg-[#dcdfec]",
        ghost: "text-slate-800 hover:bg-[#dcdfec]",
        destructive: "bg-[#d83a52] text-white hover:bg-[#b63546]",
        link: "h-auto px-0 text-primary-500 hover:underline",
        gradientOutline: "border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
        // Sisi siswa: tombol hitam ala halaman marketing monday.
        dark: "bg-slate-950 text-white hover:bg-slate-800",
      },
      shape: {
        square: "",
        pill: "rounded-full",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    compoundVariants: [
      { shape: "pill", size: "default", className: "px-5" },
      { shape: "pill", size: "sm", className: "px-4" },
      { shape: "pill", size: "lg", className: "px-7 text-[15px]" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "square",
    },
  }
)

function Button({
  className,
  variant,
  size,
  shape,
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
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
