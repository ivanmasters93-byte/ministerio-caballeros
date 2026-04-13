import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-[var(--color-bg-elevated)] rounded-lg", className)} />
}
