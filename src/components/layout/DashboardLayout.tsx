'use client'

import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { ChatNotificationProvider } from '@/components/chat/ChatNotification'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    fetch('/api/redes')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRedes(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    } else {
      // Default: collapsed on tablet (< 1024px), expanded on desktop (>= 1024px)
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches
      setSidebarCollapsed(!isDesktop)
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      <a href="#main-content" className="skip-link">Saltar al contenido</a>

      <Sidebar
        redes={redes}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggle={toggleSidebar}
        onMobileClose={() => setMobileOpen(false)}
        userRole={user?.role}
      />

      {/*
        Mobile: ml-0, full width
        Desktop (lg+): ml = sidebar width via Tailwind responsive class
      */}
      <div
        className={`flex flex-col min-h-screen w-full transition-[margin] duration-300 ease-in-out ml-0 ${
          mounted
            ? sidebarCollapsed
              ? 'md:ml-[72px] lg:ml-[72px]'
              : 'md:ml-[256px] lg:ml-[256px]'
            : 'md:ml-[72px] lg:ml-[256px]'
        }`}
      >
        <Header
          user={user}
          title={title}
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
        />

        <ChatNotificationProvider>
          <main
            id="main-content"
            className="flex-1 overflow-x-hidden relative p-4 sm:p-6"
          >
            <div className="relative z-10 max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
        </ChatNotificationProvider>
      </div>

      <InstallPrompt />
    </div>
  )
}
