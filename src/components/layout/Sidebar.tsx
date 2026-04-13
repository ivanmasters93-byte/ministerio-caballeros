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
  mobileOpen?: boolean
  onToggle?: () => void
  onMobileClose?: () => void
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
  { href: '/predicas', label: 'Predicas', icon: Mic },
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
  onNavigate?: () => void
}

function NavGroup({ label, items, pathname, collapsed, onNavigate }: NavGroupProps) {
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
              onClick={onNavigate}
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

export function Sidebar({ collapsed = false, mobileOpen = false, onToggle, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <>
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
        <div
          className="absolute bottom-0 left-4 right-4 h-px"
          style={{ background: 'linear-gradient(90deg, var(--color-accent-gold), transparent)' }}
        />
      </div>

      {/* Toggle button — desktop only */}
      <div className="flex-shrink-0 px-3 pt-3 pb-1 hidden lg:block">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center rounded-md py-1.5 transition-all duration-200 cursor-pointer"
          style={{ color: 'var(--color-text-muted)', background: 'transparent', border: 'none' }}
          title={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1">
        <NavGroup label="Panorama" items={panoramaItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
        <NavGroup label="Personas" items={personasItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
        <NavGroup label="Ministerio" items={ministerioItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
        <NavGroup label="Recursos" items={recursosItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
      </nav>

      {/* Bottom tools section */}
      <div className="flex-shrink-0 px-3 py-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <NavGroup label="Herramientas" items={herramientasItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
      </div>

      {/* Footer version */}
      <div className="flex-shrink-0 py-3 text-center" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        {!collapsed ? (
          <p className="text-[10px] tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            v1.0.0 &middot; MVP
          </p>
        ) : (
          <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>1.0</p>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* ===== DESKTOP SIDEBAR (hidden on mobile) ===== */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 h-screen flex-col z-40 transition-all duration-300 ease-in-out"
        style={{
          width: collapsed ? 'var(--spacing-sidebar-collapsed)' : 'var(--spacing-sidebar)',
          background: 'var(--color-bg-sidebar)',
          borderRight: '1px solid var(--color-border-subtle)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* ===== MOBILE DRAWER (hidden on desktop) ===== */}
      {/* Backdrop */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onMobileClose}
      />
      {/* Drawer */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 h-screen flex flex-col z-50 transition-transform duration-300 ease-in-out',
        )}
        style={{
          width: 280,
          background: 'var(--color-bg-sidebar)',
          borderRight: '1px solid var(--color-border-subtle)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Reuse sidebar content but never collapsed on mobile */}
        {/* Logo area */}
        <div className="relative flex-shrink-0" style={{ padding: '20px 16px' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-lg"
              style={{
                width: 36, height: 36,
                background: 'var(--color-accent-gold-soft)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
              }}
            >
              <Cross size={18} style={{ color: 'var(--color-accent-gold)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm leading-tight tracking-wide" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                GEDEONES
              </p>
              <p className="text-[11px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                Ministerio de Caballeros
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, var(--color-accent-gold), transparent)' }} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1">
          <NavGroup label="Panorama" items={panoramaItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
          <NavGroup label="Personas" items={personasItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
          <NavGroup label="Ministerio" items={ministerioItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
          <NavGroup label="Recursos" items={recursosItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
        </nav>
        <div className="flex-shrink-0 px-3 py-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
          <NavGroup label="Herramientas" items={herramientasItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
        </div>
        <div className="flex-shrink-0 py-3 text-center" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
          <p className="text-[10px] tracking-wider" style={{ color: 'var(--color-text-muted)' }}>v1.0.0 &middot; MVP</p>
        </div>
      </aside>
    </>
  )
}
