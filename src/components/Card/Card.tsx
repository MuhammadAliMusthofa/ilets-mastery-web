import { cn } from "@/src/libs/utils";
import * as React from "react";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-[32px] overflow-hidden transition-transform hover:-translate-y-1",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

// 2. Bagian Atas Card (Untuk padding atas)
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 relative z-10", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

// 3. Standar Judul Card
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-[17px] font-medium tracking-tight", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

// 4. Area Isi Card
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }