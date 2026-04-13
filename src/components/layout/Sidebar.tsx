'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Network,
  Calendar,
  Megaphone,
  ClipboardList,
  Heart,
  BookOpen,
  Bot,
  MessageSquare,
  Shield,
  Wallet,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Cross,
  Palette,
  Video,
  Mic,
} from 'lucide-react'

interface SidebarProps {
  redes?: Array<{ id: string; nombre: string; tipo: string }>
  collapsed?: boolean
  onToggle?: () => void
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: number
}

const panoramaItems: NavItem[] = [
  { href: '/', label: 'Centro de Mando', icon: LayoutDashboard },
  { href: '/redes', label: 'Redes', icon: Network },
]

const personasItems: NavItem[] = [
  { href: '/hermanos', label: 'Hermanos', icon: Users },
  { href: '/seguimiento', label: 'Seguimiento', icon: UserCheck },
  { href: '/oracion', label: 'Peticiones de Oracion', icon: Heart },
]

const ministerioItems: NavItem[] = [
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/anuncios', label: 'Anuncios', icon: Megaphone },
  { href: '/asistencia', label: 'Asistencia', icon: ClipboardList },
  { href: '/finanzas', label: 'Finanzas', icon: Wallet },
]

const recursosItems: NavItem[] = [
  { href: '/documentos', label: 'Documentos', icon: BookOpen },
  { href: '/predicas', label: 'Prédicas', icon: Mic },
]

const herramientasItems: NavItem[] = [
  { href: '/reuniones', label: 'Reuniones', icon: Video },
  { href: '/asistente-ia', label: 'Asistente IA', icon: Bot },
  { href: '/whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { href: '/flyers', label: 'Flyers', icon: Palette },
  { href: '/roles', label: 'Roles y Permisos', icon: Shield },
]

interface NavGroupProps {
  label: string
  items: NavItem[]
  pathname: string
  collapsed: boolean
}

function NavGroup({ label, items, pathname, collapsed }: NavGroupProps) {
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="mb-2">
      {!collapsed && (
        <p
          className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {label}
        </p>
      )}
      {collapsed && <div className="h-px mx-3 my-2" style={{ background: 'var(--color-border-subtle)' }} />}
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'nav-item',
                active && 'nav-item-active',
                collapsed && 'justify-center px-0 mx-0 border-l-0'
              )}
              style={collapsed ? { paddingLeft: 0, paddingRight: 0, marginLeft: 0, justifyContent: 'center' } : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className="min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1.5"
                  style={{
                    background: 'var(--color-accent-red-soft)',
                    color: 'var(--color-accent-red)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 'var(--spacing-sidebar-collapsed)' : 'var(--spacing-sidebar)',
        background: 'var(--color-bg-sidebar)',
        borderRight: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Logo area */}
      <div className="relative flex-shrink-0" style={{ padding: collapsed ? '20px 8px' : '20px 16px' }}>
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{
              width: 36,
              height: 36,
              background: 'var(--color-accent-gold-soft)',
              border: '1px solid rgba(201, 168, 76, 0.2)',
            }}
          >
            <Cross size={18} style={{ color: 'var(--color-accent-gold)' }} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p
                className="font-bold text-sm leading-tight tracking-wide"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
              >
                GEDEONES
              </p>
              <p className="text-[11px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                Ministerio de Caballeros
              </p>
            </div>
          )}
        </div>

        {/* Gold accent line under logo */}
        <div
          className="absolute bottom-0 left-4 right-4 h-px"
          style={{
            background: 'linear-gradient(90deg, var(--color-accent-gold), transparent)',
          }}
        />
      </div>

      {/* Toggle button */}
      <div className="flex-shrink-0 px-3 pt-3 pb-1">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center rounded-md py-1.5 transition-all duration-200"
          style={{
            color: 'var(--color-text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)'
            e.currentTarget.style.background = 'var(--color-bg-elevated)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)'
            e.currentTarget.style.background = 'transparent'
          }}
          title={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1">
        <NavGroup label="Panorama" items={panoramaItems} pathname={pathname} collapsed={collapsed} />
        <NavGroup label="Personas" items={personasItems} pathname={pathname} collapsed={collapsed} />
        <NavGroup label="Ministerio" items={ministerioItems} pathname={pathname} collapsed={collapsed} />
        <NavGroup label="Recursos" items={recursosItems} pathname={pathname} collapsed={collapsed} />
      </nav>

      {/* Bottom tools section */}
      <div
        className="flex-shrink-0 px-3 py-2"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <NavGroup label="Herramientas" items={herramientasItems} pathname={pathname} collapsed={collapsed} />
      </div>

      {/* Footer version */}
      <div
        className="flex-shrink-0 py-3 text-center"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        {!collapsed ? (
          <p className="text-[10px] tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            v1.0.0 &middot; MVP
          </p>
        ) : (
          <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
            1.0
          </p>
        )}
      </div>
    </aside>
  )
}
