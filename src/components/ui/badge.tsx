import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--color-accent-blue-soft)] text-[var(--color-accent-blue)]',
    success: 'bg-[var(--color-accent-green-soft)] text-[var(--color-accent-green)]',
    warning: 'bg-[var(--color-accent-amber-soft)] text-[var(--color-accent-amber)]',
    danger: 'bg-[var(--color-accent-red-soft)] text-[var(--color-accent-red)]',
    outline: 'border border-[var(--color-border-default)] text-[var(--color-text-secondary)]',
    secondary: 'bg-[rgba(255,255,255,0.06)] text-[var(--color-text-secondary)]',
  }
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
