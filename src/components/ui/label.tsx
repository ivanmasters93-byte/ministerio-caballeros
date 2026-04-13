import { cn } from "@/lib/utils"
import { LabelHTMLAttributes } from "react"

export function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("text-sm font-medium text-[var(--color-text-secondary)] mb-1 block", className)} {...props}>
      {children}
    </label>
  )
}
