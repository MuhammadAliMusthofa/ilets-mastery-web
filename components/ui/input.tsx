import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

/** Input Vibe: garis 1px, gelap saat hover, biru saat fokus. */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[4px] border border-slate-300 bg-white px-3 text-sm text-slate-800 transition-colors duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 hover:border-slate-800 focus-visible:border-primary-500 focus-visible:outline-none aria-invalid:border-[#d83a52] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:border-slate-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
