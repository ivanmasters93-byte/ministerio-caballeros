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
  MessageCircle,
  Shield,
  Wallet,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Palette,
  Video,
  Mic,
  Crown,
  Cross,
  Mail,
  Radio,
  User,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'

interface SidebarProps {
  redes?: Array<{ id: string; nombre: string; tipo: string }>
  collapsed?: boolean
  mobileOpen?: boolean
  onToggle?: () => void
  onMobileClose?: () => void
  userRole?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: number
}

const panoramaItems: NavItem[] = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/hermanos', label: 'Hermanos', icon: Users },
  { href: '/liderazgo', label: 'Liderazgo', icon: Crown },
]

const personasItems: NavItem[] = [
  { href: '/seguimiento', label: 'Seguimiento', icon: UserCheck },
  { href: '/oracion', label: 'Oracion', icon: Heart },
  { href: '/hermanos/enviar-versiculo', label: 'Enviar Versiculo', icon: BookOpen },
]

const ministerioItems: NavItem[] = [
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/anuncios', label: 'Anuncios', icon: Megaphone },
  { href: '/asistencia', label: 'Asistencia', icon: ClipboardList },
  { href: '/predicas', label: 'Predicas', icon: Mic },
  { href: '/predicas/en-vivo', label: 'Predica en Vivo', icon: Radio },
]

const recursosItems: NavItem[] = [
  { href: '/reuniones', label: 'Reuniones', icon: Video },
  { href: '/finanzas', label: 'Finanzas', icon: Wallet },
  { href: '/flyers', label: 'Flyers', icon: Palette },
]

const herramientasItems: NavItem[] = [
  { href: '/email', label: 'Correo', icon: Mail },
  { href: '/roles', label: 'Roles', icon: Shield },
]

// Nav items for HERMANO role
const miembroGeneralItems: NavItem[] = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/mi-perfil', label: 'Mi Perfil', icon: User },
]

const miembroActividadItems: NavItem[] = [
  { href: '/agenda', label: 'Eventos', icon: Calendar },
  { href: '/anuncios', label: 'Anuncios', icon: Megaphone },
  { href: '/oracion', label: 'Oracion', icon: Heart },
  { href: '/reuniones', label: 'Reuniones', icon: Video },
]

const miembroComunidadItems: NavItem[] = [
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/biblia', label: 'Biblia', icon: Cross },
  { href: '/documentos', label: 'Recursos', icon: BookOpen },
  { href: '/asistente-ia', label: 'Asistente IA', icon: Bot },
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

export function Sidebar({ collapsed = false, mobileOpen = false, onToggle, onMobileClose, userRole }: SidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <>
      {/* Logo area */}
      <div className="relative flex-shrink-0" style={{ padding: collapsed ? '16px 8px' : '24px 16px' }}>
        <Link href="/" className={cn('flex', collapsed ? 'justify-center' : 'flex-col items-center gap-2')}>
            <Logo size={collapsed ? 40 : 80} animated />
          {!collapsed && (
            <div className="text-center">
              <p
                className="font-bold text-[16px] leading-tight tracking-widest gold-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                GEDEONES GP
              </p>
              <p className="text-[10px] leading-tight tracking-wider uppercase mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Ministerio de Caballeros
              </p>
            </div>
          )}
        </Link>
        <div
          className="absolute bottom-0 left-4 right-4 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent-gold), transparent)' }}
        />
      </div>

      {/* Toggle button — tablet and desktop */}
      <div className="flex-shrink-0 px-3 pt-3 pb-1 hidden md:block">
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
        {userRole === 'HERMANO' ? (
          <>
            <NavGroup label="General" items={miembroGeneralItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
            <NavGroup label="Actividades" items={miembroActividadItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
            <NavGroup label="Comunidad" items={miembroComunidadItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
          </>
        ) : (
          <>
            <NavGroup label="General" items={panoramaItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
            <NavGroup label="Pastoral" items={personasItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
            <NavGroup label="Actividades" items={ministerioItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
            <NavGroup label="Gestion" items={recursosItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
          </>
        )}
      </nav>

      {/* Bottom tools section */}
      {userRole !== 'HERMANO' && (
        <div className="flex-shrink-0 px-3 py-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
          <NavGroup label="Herramientas" items={herramientasItems} pathname={pathname} collapsed={collapsed} onNavigate={onMobileClose} />
        </div>
      )}

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
      {/* ===== DESKTOP SIDEBAR (hidden on mobile, collapsed icon-only on md tablet, full on lg+) ===== */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-screen flex-col z-40 transition-all duration-300 ease-in-out"
        style={{
          width: collapsed ? 'var(--spacing-sidebar-collapsed)' : 'var(--spacing-sidebar)',
          background: 'var(--color-bg-sidebar)',
          borderRight: '1px solid var(--color-border-subtle)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* ===== MOBILE DRAWER (hidden on tablet and desktop) ===== */}
      {/* Backdrop */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onMobileClose}
      />
      {/* Drawer */}
      <aside
        className={cn(
          'md:hidden fixed top-0 left-0 h-screen flex flex-col z-50 transition-transform duration-300 ease-in-out',
        )}
        style={{
          width: 280,
          background: 'var(--color-bg-sidebar)',
          borderRight: '1px solid var(--color-border-subtle)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Reuse sidebar content but never collapsed on mobile */}
        {/* Logo area — large and centered */}
        <div className="relative flex-shrink-0" style={{ padding: '28px 16px 20px' }}>
          <Link href="/" onClick={onMobileClose} className="flex flex-col items-center gap-3">
            <Logo size={88} animated />
            <div className="text-center">
              <p className="font-bold text-[18px] leading-tight tracking-widest gold-text" style={{ fontFamily: 'var(--font-display)' }}>
                GEDEONES GP
              </p>
              <p className="text-[10px] leading-tight tracking-wider uppercase mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Ministerio de Caballeros
              </p>
            </div>
          </Link>
          <div className="absolute bottom-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent-gold), transparent)' }} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1">
          {userRole === 'HERMANO' ? (
            <>
              <NavGroup label="General" items={miembroGeneralItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
              <NavGroup label="Actividades" items={miembroActividadItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
              <NavGroup label="Comunidad" items={miembroComunidadItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
            </>
          ) : (
            <>
              <NavGroup label="General" items={panoramaItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
              <NavGroup label="Pastoral" items={personasItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
              <NavGroup label="Actividades" items={ministerioItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
              <NavGroup label="Gestion" items={recursosItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
            </>
          )}
        </nav>
        {userRole !== 'HERMANO' && (
          <div className="flex-shrink-0 px-3 py-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
            <NavGroup label="Herramientas" items={herramientasItems} pathname={pathname} collapsed={false} onNavigate={onMobileClose} />
          </div>
        )}
        <div className="flex-shrink-0 py-3 text-center" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
          <p className="text-[10px] tracking-wider" style={{ color: 'var(--color-text-muted)' }}>v1.0.0 &middot; MVP</p>
        </div>
      </aside>
    </>
  )
}
