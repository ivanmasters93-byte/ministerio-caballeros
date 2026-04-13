'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Calendar, Megaphone, ClipboardList,
  Heart, BookOpen, Settings, Bot, MessageSquare, Network,
  UserCheck
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hermanos', label: 'Hermanos', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/anuncios', label: 'Anuncios', icon: Megaphone },
  { href: '/asistencia', label: 'Asistencia', icon: ClipboardList },
  { href: '/seguimiento', label: 'Seguimiento', icon: UserCheck },
  { href: '/oracion', label: 'Peticiones', icon: Heart },
  { href: '/documentos', label: 'Documentos', icon: BookOpen },
]

const toolItems = [
  { href: '/asistente-ia', label: 'Asistente IA', icon: Bot },
  { href: '/whatsapp', label: 'WhatsApp', icon: MessageSquare },
]

const adminItems = [
  { href: '/roles', label: 'Roles y Permisos', icon: Settings },
]

interface SidebarProps {
  redes?: Array<{ id: string; nombre: string; tipo: string }>
}

export function Sidebar({ redes = [] }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-blue-950 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-blue-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-900 font-bold text-lg">✝</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Ministerio</p>
            <p className="text-blue-300 text-xs">de Caballeros</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main nav */}
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive(item.href)
                ? 'bg-blue-700 text-white'
                : 'text-blue-200 hover:bg-blue-900 hover:text-white'
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}

        {/* Redes section */}
        {redes.length > 0 && (
          <div className="mt-4">
            <p className="text-blue-400 text-xs uppercase tracking-wider px-3 mb-2">Redes</p>
            {redes.map(red => (
              <Link
                key={red.id}
                href={`/redes/${red.id}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive(`/redes/${red.id}`)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:bg-blue-900 hover:text-white'
                )}
              >
                <Network size={14} />
                {red.nombre}
              </Link>
            ))}
          </div>
        )}

        {/* Tools */}
        <div className="mt-4 pt-4 border-t border-blue-900">
          <p className="text-blue-400 text-xs uppercase tracking-wider px-3 mb-2">Herramientas</p>
          {toolItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-900 hover:text-white'
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Admin */}
        <div className="mt-4 pt-4 border-t border-blue-900">
          <p className="text-blue-400 text-xs uppercase tracking-wider px-3 mb-2">Administración</p>
          {adminItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-900 hover:text-white'
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-900">
        <p className="text-blue-400 text-xs text-center">v1.0.0 · MVP</p>
      </div>
    </aside>
  )
}
