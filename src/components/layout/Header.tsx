'use client'
import { Bell, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui/avatar'
import { getRoleLabel } from '@/lib/utils'

interface HeaderProps {
  user?: { name?: string | null; email?: string | null; role?: string }
  title?: string
}

export function Header({ user, title }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title || 'Dashboard'}</h1>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600 relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center">3</span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <Avatar name={user?.name || 'Usuario'} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-500">{getRoleLabel(user?.role || '')}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-gray-400 hover:text-red-500 ml-2 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
