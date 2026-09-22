import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/libs/utils"

/**
 * Kartu Vibe: permukaan putih, garis 1px, sudut 8px, tanpa bayangan.
 * Varian kaca dan gradasi lama dipertahankan namanya tapi jatuh ke gaya
 * standar, karena dunia visual ini tidak memakainya.
 */
const cardVariants = cva("relative rounded-lg border border-slate-200 bg-white text-slate-800", {
  variants: {
    variant: {
      default: "",
      glass: "",
      gradientBrand: "",
      gradientWarm: "",
      gradientCool: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, className }))} {...props} />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-tight text-slate-800", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent, cardVariants }
