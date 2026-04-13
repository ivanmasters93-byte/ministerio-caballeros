'use client'

import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { useEffect, useState } from 'react'

interface RedSummary {
  id: string
  nombre: string
  tipo: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: { name?: string | null; email?: string | null; role?: string; id?: string }
  title?: string
}

export function DashboardLayout({ children, user, title }: DashboardLayoutProps) {
  const [redes, setRedes] = useState<RedSummary[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetch('/api/redes')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRedes(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    }
    setMounted(true)
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', JSON.stringify(next))
      return next
    })
  }

  const sidebarWidth = sidebarCollapsed ? 72 : 256

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Skip to content for keyboard users (UI-UX-Pro-Max: skip-links) */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>

      <Sidebar
        redes={redes}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{
          marginLeft: mounted ? sidebarWidth : 256,
        }}
      >
        <Header user={user} title={title} />

        <main
          id="main-content"
          className="flex-1 overflow-auto relative"
          style={{ padding: 'var(--spacing-content)' }}
        >
          {/* Subtle radial gradient for depth */}
          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              marginLeft: sidebarWidth,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(201, 168, 76, 0.03) 0%, transparent 60%)',
            }}
          />

          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>

      <InstallPrompt />
    </div>
  )
}
