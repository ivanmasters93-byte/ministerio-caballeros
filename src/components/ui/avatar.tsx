import { cn, getInitials } from "@/lib/utils"

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  const colors = [
    'bg-[var(--color-accent-blue)]', 'bg-[var(--color-accent-green)]',
    'bg-[var(--color-accent-purple)]', 'bg-[var(--color-accent-amber)]',
    'bg-[var(--color-accent-red)]', 'bg-[#6366f1]',
    'bg-[#ec4899]', 'bg-[#14b8a6]',
  ]
  const colorIndex = name.charCodeAt(0) % colors.length
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0',
      sizes[size],
      colors[colorIndex],
      className
    )}>
      {getInitials(name)}
    </div>
  )
}
