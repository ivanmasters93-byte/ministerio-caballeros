'use client'

import { useState } from 'react'
import { Bell, LogOut, Search, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui/avatar'
import { getRoleLabel } from '@/lib/utils'

interface HeaderProps {
  user?: { name?: string | null; email?: string | null; role?: string }
  title?: string
}

export function Header({ user, title }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        height: 'var(--spacing-header)',
        background: 'rgba(12, 14, 20, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Left: Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <h1
          className="text-lg font-semibold truncate"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
        >
          {title || 'Dashboard'}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex items-center">
          {searchOpen && (
            <div className="flex items-center mr-2 fade-in">
              <input
                type="text"
                placeholder="Buscar..."
                autoFocus
                className="w-48 h-8 px-3 text-sm rounded-lg outline-none transition-all duration-200"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-gold)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-default)'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false)
                }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="ml-1 p-1 rounded transition-colors duration-200"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
              title="Buscar"
              aria-label="Buscar en el sistema"
            >
              <Search size={18} />
            </button>
          )}
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-colors duration-200"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
          title="Notificaciones"
          aria-label="3 notificaciones pendientes"
        >
          <Bell size={18} />
          <span
            className="absolute top-1 right-1 flex items-center justify-center rounded-full text-[9px] font-bold"
            style={{
              width: 16,
              height: 16,
              background: 'var(--color-accent-red)',
              color: '#ffffff',
            }}
          >
            3
          </span>
        </button>

        {/* Divider */}
        <div
          className="h-6 mx-2"
          style={{
            width: 1,
            background: 'var(--color-border-default)',
          }}
        />

        {/* User section */}
        <div className="flex items-center gap-3">
          <div
            className="rounded-full p-0.5"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-gold), rgba(201, 168, 76, 0.3))',
            }}
          >
            <Avatar name={user?.name || 'Usuario'} size="sm" className="ring-2 ring-transparent" />
          </div>
          <div className="hidden sm:block min-w-0">
            <p
              className="text-sm font-medium truncate leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {user?.name || 'Usuario'}
            </p>
            <p
              className="text-[11px] truncate leading-tight"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {getRoleLabel(user?.role || '')}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-red)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
            title="Cerrar sesion"
            aria-label="Cerrar sesion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
