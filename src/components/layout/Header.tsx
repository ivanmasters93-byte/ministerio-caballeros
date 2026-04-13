'use client'

import { useState } from 'react'
import { Bell, LogOut, Menu, Search, X, Cross } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui/avatar'
import { getRoleLabel } from '@/lib/utils'
import Link from 'next/link'

interface HeaderProps {
  user?: { name?: string | null; email?: string | null; role?: string }
  title?: string
  onMenuToggle?: () => void
}

export function Header({ user, title, onMenuToggle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
      style={{
        height: 'var(--spacing-header)',
        background: 'rgba(12, 14, 20, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Left: Hamburger (mobile) + Page title */}
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        {/* Hamburger — mobile only (below md) */}
        <button
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center w-11 h-11 -ml-2 rounded-lg transition-colors duration-200 cursor-pointer"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>

        {/* Logo — mobile only, clickable */}
        <Link href="/" className="md:hidden flex items-center gap-2">
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-md"
            style={{
              width: 28, height: 28,
              background: 'var(--color-accent-gold-soft)',
              border: '1px solid rgba(201, 168, 76, 0.2)',
            }}
          >
            <Cross size={14} style={{ color: 'var(--color-accent-gold)' }} />
          </div>
          <span className="text-sm font-bold tracking-wide" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
            GEDEONES
          </span>
        </Link>

        {/* Page title — tablet and desktop */}
        <h1
          className="text-lg font-semibold truncate hidden md:block"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
        >
          {title || 'Dashboard'}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search — hidden on very small screens */}
        <div className="relative flex items-center hidden sm:flex">
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
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-default)' }}
                onKeyDown={(e) => { if (e.key === 'Escape') setSearchOpen(false) }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="ml-1 p-1 rounded transition-colors duration-200 cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg transition-colors duration-200 cursor-pointer"
              style={{ color: 'var(--color-text-muted)' }}
              title="Buscar"
              aria-label="Buscar en el sistema"
            >
              <Search size={18} />
            </button>
          )}
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-colors duration-200 cursor-pointer"
          style={{ color: 'var(--color-text-muted)' }}
          title="Notificaciones"
          aria-label="3 notificaciones pendientes"
        >
          <Bell size={18} />
          <span
            className="absolute top-1 right-1 flex items-center justify-center rounded-full text-[9px] font-bold"
            style={{ width: 16, height: 16, background: 'var(--color-accent-red)', color: '#ffffff' }}
          >
            3
          </span>
        </button>

        {/* Divider — hidden on mobile */}
        <div
          className="h-6 mx-1 sm:mx-2 hidden sm:block"
          style={{ width: 1, background: 'var(--color-border-default)' }}
        />

        {/* User section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="rounded-full p-0.5"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-gold), rgba(201, 168, 76, 0.3))' }}
          >
            <Avatar name={user?.name || 'Usuario'} size="sm" />
          </div>
          <div className="hidden md:block min-w-0">
            <p className="text-sm font-medium truncate leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {user?.name || 'Usuario'}
            </p>
            <p className="text-[11px] truncate leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
              {getRoleLabel(user?.role || '')}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-lg transition-colors duration-200 hidden sm:block cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
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
