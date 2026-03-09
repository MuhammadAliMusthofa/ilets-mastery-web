import { cn } from "@/src/libs/utils"
import * as React from "react"

// 1. Kita siapkan "Kamus" variasi tombolnya
const buttonVariants = {
  variant: {
    default: "bg-mon-dark text-white hover:bg-black/80 shadow-sm", // Tombol solid hitam
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm", // Tombol biru utama
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700", // Tombol garis
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700", // Tombol transparan (tanpa garis)
  },
  size: {
    default: "h-10 px-4 py-2", // Ukuran standar
    sm: "h-8 rounded-md px-3 text-sm", // Ukuran kecil
    lg: "h-12 rounded-md px-8 text-lg", // Ukuran besar
    icon: "h-10 w-10 flex items-center justify-center rounded-full", // Khusus untuk ikon
  }
}

// 2. Definisikan Props (Tambahin variant dan size)
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant
  size?: keyof typeof buttonVariants.size
}

// 3. Komponen utamanya
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants.variant[variant], // Panggil warna dari kamus
          buttonVariants.size[size],       // Panggil ukuran dari kamus
          className // Tetap izinkan custom class dari luar
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }