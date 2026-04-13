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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetch('/api/redes')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRedes(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) setSidebarCollapsed(JSON.parse(saved))
    setMounted(true)
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', JSON.stringify(next))
      return next
    })
  }

  const desktopMargin = mounted ? (sidebarCollapsed ? 72 : 256) : 256

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      <a href="#main-content" className="skip-link">Saltar al contenido</a>

      <Sidebar
        redes={redes}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggle={toggleSidebar}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/*
        Mobile: ml-0, full width
        Desktop (lg+): ml = sidebar width via inline style
      */}
      <div
        className="flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: 0 }}
      >
        {/* This div applies desktop margin only — hidden from mobile via media query in CSS */}
        <div
          className="desktop-offset flex flex-col min-h-screen"
          style={{ '--sidebar-w': `${desktopMargin}px` } as React.CSSProperties}
        >
          <Header
            user={user}
            title={title}
            onMenuToggle={() => setMobileOpen((prev) => !prev)}
          />

          <main
            id="main-content"
            className="flex-1 overflow-auto relative p-4 sm:p-6"
          >
            <div className="relative z-10 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      <InstallPrompt />
    </div>
  )
}
