import { cn, getInitials } from "@/lib/utils"

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500',
    'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
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
