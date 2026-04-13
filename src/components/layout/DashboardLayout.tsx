'use client'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
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

  useEffect(() => {
    fetch('/api/redes').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setRedes(data)
    }).catch(() => {})
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar redes={redes} />
      <div className="flex-1 flex flex-col">
        <Header user={user} title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
