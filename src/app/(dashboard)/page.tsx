'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  Calendar,
  Heart,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  UserPlus,
  CalendarPlus,
  Megaphone,
  ClipboardCheck,
  MessageSquare,
  Phone,
  Home,
  FileText,
  Plus,
  ExternalLink,
  Video,
  CirclePlay,
  DollarSign,
  BookOpen,
  Mic,
  Palette,
  MessageCircle,
  Eye,
  Send,
  Radio,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Evento {
  id: string
  titulo: string
  fecha: string
  hora?: string
  tipo?: string
  red?: { nombre: string }
  zoomLink?: string
  youtubeLink?: string
}

interface Anuncio {
  id: string
  titulo: string
  prioridad: string
  contenido?: string
  createdAt: string
}

interface CasoSeguimiento {
  id: string
  tipo: string
  estado: string
  descripcion?: string
  createdAt: string
  hermano: { user: { name: string } }
}

interface HermanoAlerta {
  id: string
  estado: string
  ultimaAsistencia?: string
  user: {
    name: string
    phone?: string
  }
}

interface PeticionUrgente {
  id: string
  descripcion: string
  prioridad: string
  hermano?: { user?: { name?: string; phone?: string } }
}

interface DashboardStats {
  hermanos?: {
    total?: number
    activos?: number
    inactivos?: number
    nuevos?: number
    requierenSeguimiento?: number
  }
  redes?: { total?: number }
  eventos?: {
    proximosSiete?: number
    proximosTreinta?: number
    proximos?: Evento[]
  }
  oracion?: { peticionesPendientes?: number }
  anuncios?: {
    activos?: number
    recientes?: Anuncio[]
  }
  seguimiento?: {
    abiertos?: CasoSeguimiento[]
  }
  finanzas?: {
    cuotasPendientes?: number
    recaudadoUltimo30?: number
  }
}

interface RedSummary {
  id: string
  nombre: string
  tipo: string
  _count?: { miembros: number; eventos: number }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function greetingForHour(h: number): string {
  if (h < 12) return 'Buenos dias'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const EVENT_TYPE_BADGE: Record<string, string> = {
  REUNION: 'badge-blue',
  CULTO: 'badge-gold',
  RETIRO: 'badge-green',
  CAPACITACION: 'badge-purple',
  SOCIAL: 'badge-amber',
}

const PRIORITY_BADGE: Record<string, string> = {
  URGENTE: 'badge-red',
  ALTA: 'badge-amber',
  NORMAL: 'badge-blue',
  BAJA: 'badge-ghost',
}

const CASO_ESTADO_BADGE: Record<string, string> = {
  ABIERTO: 'badge-red',
  EN_PROCESO: 'badge-amber',
  CERRADO: 'badge-green',
}

const RED_TYPE_BADGE: Record<string, { color: string; soft: string }> = {
  MENOR: { color: 'var(--color-accent-green)', soft: 'var(--color-accent-green-soft)' },
  MEDIA: { color: 'var(--color-accent-blue)', soft: 'var(--color-accent-blue-soft)' },
  MAYOR: { color: 'var(--color-accent-purple)', soft: 'var(--color-accent-purple-soft)' },
}

function CasoIcon({ tipo }: { tipo: string }) {
  const props = { size: 14, className: 'shrink-0' }
  switch (tipo) {
    case 'LLAMADA': return <Phone {...props} />
    case 'VISITA': return <Home {...props} />
    case 'NOTA': return <FileText {...props} />
    case 'ALERTA': return <AlertTriangle {...props} />
    default: return <FileText {...props} />
  }
}

function formatShortDate(iso: string): { day: string; month: string } {
  const d = new Date(iso)
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function formatPhone(phone?: string) {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

function daysSince(iso?: string): number | null {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/* ------------------------------------------------------------------ */
/*  Member Dashboard (HERMANO role)                                    */
/* ------------------------------------------------------------------ */

function MemberDashboard({ userName }: { userName: string }) {
  const [events, setEvents] = useState<Evento[]>([])
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [oraciones, setOraciones] = useState<{ id: string; descripcion: string; estado: string }[]>([])
  const [unreadChats, setUnreadChats] = useState(0)
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos dias' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  useEffect(() => {
    Promise.all([
      fetch('/api/eventos?limit=3&upcoming=true').then(r => r.json()).catch(() => []),
      fetch('/api/anuncios?limit=5&activos=true').then(r => r.json()).catch(() => []),
      fetch('/api/oracion?mine=true').then(r => r.json()).catch(() => []),
      fetch('/api/chat/unread').then(r => r.json()).catch(() => ({ total: 0 })),
    ]).then(([evts, anns, oras, unread]) => {
      setEvents((Array.isArray(evts) ? evts : (evts?.data || [])).slice(0, 3))
      setAnuncios((Array.isArray(anns) ? anns : (anns?.data || [])).slice(0, 5))
      setOraciones((Array.isArray(oras) ? oras : (oras?.data || [])).slice(0, 5))
      setUnreadChats(unread?.total || 0)
      setLoading(false)
    })
  }, [])

  const quickActions = [
    { href: '/chat', label: 'Chat', emoji: '💬', badge: unreadChats },
    { href: '/oracion', label: 'Pedir Oracion', emoji: '🙏', badge: 0 },
    { href: '/biblia', label: 'Biblia', emoji: '📖', badge: 0 },
    { href: '/agenda', label: 'Eventos', emoji: '📅', badge: 0 },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--color-bg-elevated)' }} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--color-bg-elevated)' }} />)}
        </div>
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--color-bg-elevated)' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 opacity-5" style={{ background: 'radial-gradient(circle, var(--color-accent-gold) 0%, transparent 70%)' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{greeting},</p>
        <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
          {userName || 'Hermano'}
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Bienvenido a GEDEONES GP</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(action => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-2xl p-4 text-center transition-all duration-200 relative group"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)' }}
          >
            <div className="text-2xl mb-2">{action.emoji}</div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{action.label}</p>
            {action.badge > 0 && (
              <span
                className="absolute top-2 right-2 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1.5"
                style={{ background: 'var(--color-accent-gold)', color: 'var(--color-bg-base)' }}
              >
                {action.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Events */}
      {events.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            Proximos Eventos
          </h2>
          <div className="space-y-2.5">
            {events.map(evt => (
              <div key={evt.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-bg-elevated)' }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-bold leading-tight text-center"
                  style={{ background: 'rgba(201, 168, 76, 0.15)', color: 'var(--color-accent-gold)' }}
                >
                  {new Date(evt.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short' }).replace(' ', '\n').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{evt.titulo}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{evt.hora || ''} {evt.tipo || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements */}
      {anuncios.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            Anuncios
          </h2>
          <div className="space-y-2.5">
            {anuncios.map(a => (
              <div key={a.id} className="px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-bg-elevated)' }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{a.titulo}</p>
                  {a.prioridad === 'URGENTE' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'rgb(239, 68, 68)' }}>
                      URGENTE
                    </span>
                  )}
                </div>
                <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{a.contenido}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Prayer Requests */}
      {oraciones.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            Mis Peticiones de Oracion
          </h2>
          <div className="space-y-2">
            {oraciones.map(o => (
              <div key={o.id} className="flex items-start gap-3 px-3 py-2 rounded-xl" style={{ background: 'var(--color-bg-elevated)' }}>
                <Heart size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent-gold)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{o.descripcion}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{o.estado}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Leader Dashboard (existing)                                        */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [hermanosAlerta, setHermanosAlerta] = useState<HermanoAlerta[]>([])
  const [peticionesUrgentes, setPeticionesUrgentes] = useState<PeticionUrgente[]>([])
  const [redes, setRedes] = useState<RedSummary[]>([])

  // Fetch stats + auto-refresh every 30s
  const fetchStats = () => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)

    // Fetch hermanos that need pastoral attention
    fetch('/api/hermanos?estado=REQUIERE_SEGUIMIENTO&limit=20')
      .then(r => r.json())
      .then(data => {
        const seg = Array.isArray(data) ? data : (data?.data ?? [])
        fetch('/api/hermanos?estado=INACTIVO&limit=10')
          .then(r2 => r2.json())
          .then(data2 => {
            const inac = Array.isArray(data2) ? data2 : (data2?.data ?? [])
            setHermanosAlerta([...seg, ...inac])
          })
          .catch(() => setHermanosAlerta(seg))
      })
      .catch(() => {})

    // Fetch urgent prayer requests
    fetch('/api/oracion?prioridad=URGENTE&limit=5')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        setPeticionesUrgentes(list.filter((p: PeticionUrgente) => p.prioridad === 'URGENTE'))
      })
      .catch(() => {})

    // Fetch redes for summary section
    fetch('/api/redes')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setRedes(data)
      })
      .catch(() => {})
  }, [])

  // HERMANO role -> render member dashboard
  if (session?.user?.role === 'HERMANO') {
    return <MemberDashboard userName={session.user.name || ''} />
  }

  const hour = new Date().getHours()
  const greeting = greetingForHour(hour)
  const todayLabel = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const requierenAtencion =
    (stats?.hermanos?.requierenSeguimiento ?? 0) +
    (stats?.oracion?.peticionesPendientes ?? 0) +
    (stats?.finanzas?.cuotasPendientes ?? 0)

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <GreetingBar greeting={greeting} todayLabel={todayLabel} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="stat-card animate-pulse h-[120px]"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    )
  }

  /* ---- Stat cards config ---- */
  const nuevos = stats?.hermanos?.nuevos ?? 0

  const statCards = [
    {
      label: 'Total Hermanos',
      value: stats?.hermanos?.total ?? 0,
      subtitle: nuevos > 0 ? `${nuevos} nuevo${nuevos > 1 ? 's' : ''} hoy` : `${stats?.hermanos?.activos ?? 0} activos`,
      icon: Users,
      accentColor: nuevos > 0 ? 'var(--color-accent-green)' : 'var(--color-accent-blue)',
      accentSoft: nuevos > 0 ? 'var(--color-accent-green-soft)' : 'var(--color-accent-blue-soft)',
      href: '/hermanos',
    },
    {
      label: 'Eventos esta Semana',
      value: stats?.eventos?.proximosSiete ?? 0,
      subtitle: 'proximos 7 dias',
      icon: Calendar,
      accentColor: 'var(--color-accent-gold)',
      accentSoft: 'var(--color-accent-gold-soft)',
      href: '/agenda',
    },
    {
      label: 'Peticiones Activas',
      value: stats?.oracion?.peticionesPendientes ?? 0,
      subtitle: 'pendientes de oracion',
      icon: Heart,
      accentColor: 'var(--color-accent-purple)',
      accentSoft: 'var(--color-accent-purple-soft)',
      href: '/oracion',
    },
    {
      label: 'Seguimiento',
      value: stats?.hermanos?.requierenSeguimiento ?? 0,
      subtitle: 'requieren atencion',
      icon: UserCheck,
      accentColor: 'var(--color-accent-amber)',
      accentSoft: 'var(--color-accent-amber-soft)',
      href: '/seguimiento',
    },
  ]

  /* ---- Quick actions config ---- */
  const quickActions = [
    { label: 'Nuevo Hermano', icon: UserPlus, color: 'var(--color-accent-blue)', soft: 'var(--color-accent-blue-soft)', href: '/hermanos' },
    { label: 'Crear Evento', icon: CalendarPlus, color: 'var(--color-accent-gold)', soft: 'var(--color-accent-gold-soft)', href: '/agenda' },
    { label: 'Publicar Anuncio', icon: Megaphone, color: 'var(--color-accent-amber)', soft: 'var(--color-accent-amber-soft)', href: '/anuncios' },
    { label: 'Registrar Asistencia', icon: ClipboardCheck, color: 'var(--color-accent-green)', soft: 'var(--color-accent-green-soft)', href: '/asistencia' },
    { label: 'Nueva Peticion', icon: Heart, color: 'var(--color-accent-purple)', soft: 'var(--color-accent-purple-soft)', href: '/oracion' },
    { label: 'Enviar Mensaje', icon: MessageSquare, color: 'var(--color-accent-blue)', soft: 'var(--color-accent-blue-soft)', href: '/whatsapp' },
    { label: 'Leer Biblia', icon: BookOpen, color: 'var(--color-accent-gold)', soft: 'var(--color-accent-gold-soft)', href: '/biblia' },
    { label: 'Nueva Predica', icon: Mic, color: 'var(--color-accent-purple)', soft: 'var(--color-accent-purple-soft)', href: '/predicas/nueva' },
    { label: 'Predica en Vivo', icon: Radio, color: 'var(--color-accent-red)', soft: 'var(--color-accent-red-soft)', href: '/predicas/en-vivo' },
    { label: 'Enviar Versiculo', icon: Send, color: 'var(--color-accent-green)', soft: 'var(--color-accent-green-soft)', href: '/hermanos/enviar-versiculo' },
    { label: 'Crear Flyer', icon: Palette, color: 'var(--color-accent-green)', soft: 'var(--color-accent-green-soft)', href: '/flyers' },
  ]

  const eventos = stats?.eventos?.proximos ?? []
  const anuncios = stats?.anuncios?.recientes ?? []
  const casosAbiertos = Array.isArray(stats?.seguimiento?.abiertos)
    ? stats.seguimiento.abiertos
    : []

  const tieneAtencionPastoral = hermanosAlerta.length > 0 || peticionesUrgentes.length > 0

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {/* ========== LOGO WATERMARK ========== */}
      <div aria-hidden="true" className="logo-watermark">
        <Image
          src="/logo-gedeones.jpg"
          alt=""
          width={400}
          height={400}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          priority={false}
        />
      </div>

      {/* ========== GREETING ========== */}
      <div className="slide-up">
        <GreetingBar greeting={greeting} todayLabel={todayLabel} />
      </div>

      {/* ========== TABLERO DE ANUNCIOS — Laurel Style ========== */}
      <div className="slide-up" style={{ animationDelay: '60ms' }}>
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.02) 50%, rgba(201,168,76,0.06) 100%)',
            border: '1px solid rgba(201,168,76,0.15)',
          }}
        >
          {/* Laurel SVG decorations */}
          <svg className="absolute top-0 left-0 w-16 h-16 opacity-[0.08]" viewBox="0 0 100 100" fill="none">
            <path d="M50 10C30 25 15 45 10 70C25 55 40 45 50 30C60 45 75 55 90 70C85 45 70 25 50 10Z" fill="currentColor" style={{color: 'var(--color-accent-gold)'}} />
          </svg>
          <svg className="absolute top-0 right-0 w-16 h-16 opacity-[0.08] scale-x-[-1]" viewBox="0 0 100 100" fill="none">
            <path d="M50 10C30 25 15 45 10 70C25 55 40 45 50 30C60 45 75 55 90 70C85 45 70 25 50 10Z" fill="currentColor" style={{color: 'var(--color-accent-gold)'}} />
          </svg>
          <svg className="absolute bottom-0 left-0 w-16 h-16 opacity-[0.08] scale-y-[-1]" viewBox="0 0 100 100" fill="none">
            <path d="M50 10C30 25 15 45 10 70C25 55 40 45 50 30C60 45 75 55 90 70C85 45 70 25 50 10Z" fill="currentColor" style={{color: 'var(--color-accent-gold)'}} />
          </svg>
          <svg className="absolute bottom-0 right-0 w-16 h-16 opacity-[0.08] scale-[-1]" viewBox="0 0 100 100" fill="none">
            <path d="M50 10C30 25 15 45 10 70C25 55 40 45 50 30C60 45 75 55 90 70C85 45 70 25 50 10Z" fill="currentColor" style={{color: 'var(--color-accent-gold)'}} />
          </svg>

          <div className="relative z-10 px-6 py-5">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.3))' }} />
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.35em] uppercase font-semibold" style={{ color: 'var(--color-accent-gold)' }}>
                  Tablero Semanal
                </span>
              </div>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.3))' }} />
            </div>

            {/* Announcements */}
            {stats?.anuncios?.recientes && stats.anuncios.recientes.length > 0 ? (
              <div className="space-y-3">
                {stats.anuncios.recientes.slice(0, 3).map((anuncio: { id: string; titulo: string; contenido?: string; prioridad: string }) => (
                  <div key={anuncio.id} className="flex items-start gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{
                        background: anuncio.prioridad === 'URGENTE' ? '#ef4444'
                          : anuncio.prioridad === 'ALTA' ? 'var(--color-accent-gold)'
                          : 'rgba(255,255,255,0.2)',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {anuncio.titulo}
                      </p>
                      {anuncio.contenido && (
                        <p className="text-[12px] mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                          {anuncio.contenido}
                        </p>
                      )}
                    </div>
                    {anuncio.prioridad === 'URGENTE' && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                        Urgente
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-[13px] italic" style={{ color: 'var(--color-text-muted)' }}>
                  Sin anuncios esta semana
                </p>
                <Link href="/anuncios" className="text-[12px] mt-1 inline-block" style={{ color: 'var(--color-accent-gold)' }}>
                  Publicar anuncio
                </Link>
              </div>
            )}

            {/* Footer link */}
            {stats?.anuncios?.recientes && stats.anuncios.recientes.length > 0 && (
              <div className="flex justify-center mt-4 pt-3" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                <Link href="/anuncios" className="text-[11px] tracking-wider uppercase flex items-center gap-1.5" style={{ color: 'var(--color-accent-gold)' }}>
                  Ver todos los anuncios <ChevronRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== ATENCION PASTORAL ========== */}
      {tieneAtencionPastoral && (
        <div className="slide-up" style={{ animationDelay: '80ms' }}>
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-amber-900">Atencion Pastoral</h3>
                <p className="text-[12px] text-amber-700">
                  {hermanosAlerta.length} hermano{hermanosAlerta.length !== 1 ? 's' : ''} requieren contacto
                  {peticionesUrgentes.length > 0 && ` · ${peticionesUrgentes.length} peticion${peticionesUrgentes.length !== 1 ? 'es' : ''} urgente${peticionesUrgentes.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <Link href="/seguimiento" className="ml-auto text-[12px] font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1">
                Ver seguimiento <ChevronRight size={13} />
              </Link>
            </div>

            {hermanosAlerta.length > 0 && (
              <div className="space-y-2 mb-4">
                {hermanosAlerta.slice(0, 6).map(h => {
                  const phone = h.user?.phone
                  const phoneClean = formatPhone(phone)
                  const dias = daysSince(h.ultimaAsistencia)
                  return (
                    <div key={h.id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-amber-200">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-[13px] font-bold text-amber-700 shrink-0">
                        {h.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-gray-900 truncate">{h.user.name}</p>
                        <p className="text-[11px] text-amber-700">
                          {h.estado === 'REQUIERE_SEGUIMIENTO' ? 'Requiere seguimiento' : 'Inactivo'}
                          {dias !== null && ` · ${dias}d sin asistir`}
                        </p>
                      </div>
                      {phone && (
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`tel:${phone}`}
                            title="Llamar"
                            className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            <Phone size={16} />
                          </a>
                          <a
                            href={`https://wa.me/${phoneClean}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp"
                            className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200"
                          >
                            <MessageCircle size={16} />
                          </a>
                          <Link href={`/hermanos/${h.id}`}>
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors border border-gray-200">
                              <ChevronRight size={16} />
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {peticionesUrgentes.length > 0 && (
              <div>
                <p className="text-[12px] font-semibold text-red-700 uppercase tracking-wide mb-2">Peticiones Urgentes</p>
                <div className="space-y-2">
                  {peticionesUrgentes.map(p => {
                    const phone = p.hermano?.user?.phone
                    const phoneClean = formatPhone(phone)
                    return (
                      <div key={p.id} className="flex items-center gap-3 bg-red-50 rounded-lg px-4 py-3 border border-red-200">
                        <Heart size={14} className="text-red-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-gray-900 truncate">{p.hermano?.user?.name}</p>
                          <p className="text-[12px] text-gray-600 line-clamp-1">{p.descripcion}</p>
                        </div>
                        {phone && (
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={`tel:${phone}`}
                              title="Llamar"
                              className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                              <Phone size={14} />
                            </a>
                            <a
                              href={`https://wa.me/${phoneClean}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp"
                              className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200"
                            >
                              <MessageCircle size={14} />
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== QUICK STATS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link key={card.label} href={card.href} className="group">
            <div
              className="stat-card slide-up"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                  style={{ background: card.accentSoft }}
                >
                  <card.icon size={18} style={{ color: card.accentColor }} />
                </div>
                <span
                  className="text-[12px] sm:text-[13px] font-medium text-right leading-tight"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {card.label}
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <span
                  className="text-[28px] sm:text-[32px] font-bold leading-none tracking-tight"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {card.value}
                </span>
                <span
                  className="text-[11px] sm:text-[12px] pb-0.5 text-right"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {card.subtitle}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ========== RESUMEN DE REDES ========== */}
      {redes.length > 0 && (
        <div className="slide-up" style={{ animationDelay: '350ms' }}>
          <h3
            className="text-[16px] font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Resumen de Redes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {redes.map((red) => {
              const badge = RED_TYPE_BADGE[red.tipo] ?? { color: 'var(--color-accent-gold)', soft: 'var(--color-accent-gold-soft)' }
              const miembros = red._count?.miembros ?? 0
              return (
                <Link
                  key={red.id}
                  href={`/redes/${red.id}`}
                  className="dark-card p-4 flex items-center gap-4 transition-all duration-200 hover:border-[var(--color-border-strong)]"
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                    style={{ background: badge.soft }}
                  >
                    <Users size={18} style={{ color: badge.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[14px] font-medium truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {red.nombre}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ background: badge.soft, color: badge.color }}
                      >
                        {red.tipo}
                      </span>
                      <span
                        className="text-[12px]"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {miembros} miembro{miembros !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <Eye
                    size={16}
                    className="shrink-0"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ========== ACTION REQUIRED ========== */}
      {requierenAtencion > 0 && (
        <div
          className="slide-up"
          style={{ animationDelay: '400ms' }}
        >
          <div
            className="rounded-xl px-5 py-4"
            style={{
              background: 'var(--color-accent-red-soft)',
              borderLeft: '3px solid var(--color-accent-red)',
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle
                  size={18}
                  style={{ color: 'var(--color-accent-red)' }}
                />
                <span
                  className="text-[14px] font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {requierenAtencion} asunto{requierenAtencion > 1 ? 's' : ''}{' '}
                  requiere{requierenAtencion > 1 ? 'n' : ''} tu atencion
                </span>
              </div>
              <Link href="/seguimiento" className="btn-ghost text-[12px] py-1.5 px-3">
                Ver casos <ChevronRight size={14} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
              {(stats?.hermanos?.requierenSeguimiento ?? 0) > 0 && (
                <Link
                  href="/seguimiento"
                  className="glass-card flex items-center gap-2 px-3 py-2 text-[13px] font-medium hover:border-[var(--color-border-strong)] transition-colors"
                  style={{ color: 'var(--color-accent-amber)' }}
                >
                  <UserCheck size={14} />
                  {stats?.hermanos?.requierenSeguimiento} hermano
                  {(stats?.hermanos?.requierenSeguimiento ?? 0) > 1 ? 's' : ''}{' '}
                  pendiente{(stats?.hermanos?.requierenSeguimiento ?? 0) > 1 ? 's' : ''}
                </Link>
              )}
              {(stats?.oracion?.peticionesPendientes ?? 0) > 0 && (
                <Link
                  href="/oracion"
                  className="glass-card flex items-center gap-2 px-3 py-2 text-[13px] font-medium hover:border-[var(--color-border-strong)] transition-colors"
                  style={{ color: 'var(--color-accent-purple)' }}
                >
                  <Heart size={14} />
                  {stats?.oracion?.peticionesPendientes} peticion
                  {(stats?.oracion?.peticionesPendientes ?? 0) > 1 ? 'es' : ''}{' '}
                  activa{(stats?.oracion?.peticionesPendientes ?? 0) > 1 ? 's' : ''}
                </Link>
              )}
              {(stats?.finanzas?.cuotasPendientes ?? 0) > 0 && (
                <Link
                  href="/finanzas"
                  className="glass-card flex items-center gap-2 px-3 py-2 text-[13px] font-medium hover:border-[var(--color-border-strong)] transition-colors"
                  style={{ color: 'var(--color-accent-red)' }}
                >
                  <DollarSign size={14} />
                  {stats?.finanzas?.cuotasPendientes} cuota
                  {(stats?.finanzas?.cuotasPendientes ?? 0) > 1 ? 's' : ''}{' '}
                  pendiente{(stats?.finanzas?.cuotasPendientes ?? 0) > 1 ? 's' : ''}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== EVENTS + ANNOUNCEMENTS ========== */}
      <div
        className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 slide-up"
        style={{ animationDelay: '500ms' }}
      >
        {/* Left: Proximos Eventos (3/5 = 60%) */}
        <div className="lg:col-span-3 dark-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3
              className="text-[16px] font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Proximos Eventos
            </h3>
            <Link
              href="/agenda"
              className="text-[13px] font-medium flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: 'var(--color-accent-gold)' }}
            >
              Ver agenda <ChevronRight size={14} />
            </Link>
          </div>

          {eventos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Calendar
                size={32}
                style={{ color: 'var(--color-text-muted)' }}
              />
              <span
                className="text-[13px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                No hay eventos proximos
              </span>
            </div>
          ) : (
            <div className="relative">
              <div
                className="absolute left-[23px] top-6 bottom-6 w-px"
                style={{ background: 'var(--color-border-subtle)' }}
              />

              <div className="space-y-4">
                {eventos.map((evento) => {
                  const { day, month } = formatShortDate(evento.fecha)
                  const typeBadge = EVENT_TYPE_BADGE[evento.tipo ?? ''] ?? 'badge-ghost'
                  return (
                    <div
                      key={evento.id}
                      className="flex items-start gap-4 relative"
                    >
                      <div
                        className="flex flex-col items-center justify-center min-w-[48px] w-12 h-14 rounded-lg z-10 shrink-0"
                        style={{
                          background: 'var(--color-accent-gold-soft)',
                          border: '1px solid rgba(201,168,76,0.15)',
                        }}
                      >
                        <span
                          className="text-[18px] font-bold leading-none"
                          style={{ color: 'var(--color-accent-gold)' }}
                        >
                          {day}
                        </span>
                        <span
                          className="text-[10px] font-semibold uppercase mt-0.5"
                          style={{ color: 'var(--color-accent-gold)' }}
                        >
                          {month}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <p
                          className="text-[14px] font-medium truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {evento.titulo}
                        </p>
                        <div className="flex items-center flex-wrap gap-2 mt-1.5">
                          {evento.hora && (
                            <span
                              className="text-[12px]"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              {evento.hora}
                            </span>
                          )}
                          {evento.tipo && (
                            <span className={typeBadge}>
                              {evento.tipo}
                            </span>
                          )}
                          {evento.red && (
                            <span className="badge-ghost">
                              {evento.red.nombre}
                            </span>
                          )}
                        </div>
                        {(evento.zoomLink || evento.youtubeLink) && (
                          <div className="flex items-center gap-3 mt-2">
                            {evento.zoomLink && (
                              <a
                                href={evento.zoomLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-70"
                                style={{ color: 'var(--color-accent-blue)' }}
                              >
                                <Video size={12} /> Zoom
                                <ExternalLink size={10} />
                              </a>
                            )}
                            {evento.youtubeLink && (
                              <a
                                href={evento.youtubeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-70"
                                style={{ color: 'var(--color-accent-red)' }}
                              >
                                <CirclePlay size={12} /> YouTube
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Anuncios Recientes (2/5 = 40%) */}
        <div className="lg:col-span-2 dark-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3
              className="text-[16px] font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Anuncios Recientes
            </h3>
            <Link
              href="/anuncios"
              className="text-[13px] font-medium flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: 'var(--color-accent-gold)' }}
            >
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>

          {anuncios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Megaphone
                size={32}
                style={{ color: 'var(--color-text-muted)' }}
              />
              <span
                className="text-[13px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                No hay anuncios recientes
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {anuncios.map((anuncio) => {
                const prioClass = PRIORITY_BADGE[anuncio.prioridad] ?? 'badge-ghost'
                return (
                  <div
                    key={anuncio.id}
                    className="rounded-lg p-4 transition-colors"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p
                        className="text-[14px] font-medium truncate flex-1"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {anuncio.titulo}
                      </p>
                      <span className={`${prioClass} shrink-0`}>
                        {anuncio.prioridad}
                      </span>
                    </div>
                    {anuncio.contenido && (
                      <p
                        className="text-[13px] line-clamp-2 mb-2"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {anuncio.contenido}
                      </p>
                    )}
                    <span
                      className="text-[12px]"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {timeAgo(anuncio.createdAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========== SEGUIMIENTO PASTORAL ========== */}
      {casosAbiertos.length > 0 && (
        <div
          className="slide-up"
          style={{ animationDelay: '600ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-[16px] font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Seguimiento Pastoral
            </h3>
            <Link
              href="/seguimiento"
              className="text-[13px] font-medium flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: 'var(--color-accent-gold)' }}
            >
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {casosAbiertos.map((caso) => {
              const estadoClass = CASO_ESTADO_BADGE[caso.estado] ?? 'badge-ghost'
              const initial = caso.hermano?.user?.name?.charAt(0)?.toUpperCase() ?? '?'
              return (
                <Link
                  key={caso.id}
                  href="/seguimiento"
                  className="dark-card-hover p-4 min-w-[240px] sm:min-w-[280px] max-w-[320px] shrink-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0"
                      style={{
                        background: 'var(--color-accent-blue-soft)',
                        color: 'var(--color-accent-blue)',
                      }}
                    >
                      {initial}
                    </div>
                    <span
                      className="text-[14px] font-medium truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {caso.hermano?.user?.name ?? 'Sin nombre'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-ghost flex items-center gap-1">
                      <CasoIcon tipo={caso.tipo} />
                      {caso.tipo}
                    </span>
                    <span className={estadoClass}>{caso.estado}</span>
                  </div>

                  {caso.descripcion && (
                    <p
                      className="text-[13px] line-clamp-2 mb-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {caso.descripcion}
                    </p>
                  )}

                  <span
                    className="text-[12px]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {timeAgo(caso.createdAt)}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ========== QUICK ACTIONS ========== */}
      <div
        className="slide-up"
        style={{ animationDelay: '700ms' }}
      >
        <h3
          className="text-[16px] font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Acciones Rapidas
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group dark-card flex flex-col items-center justify-center gap-3 p-4 text-center transition-all duration-200 hover:border-[var(--color-border-strong)]"
              style={{ minHeight: '96px' }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg transition-transform duration-200 group-hover:scale-110"
                style={{ background: action.soft }}
              >
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <span
                className="text-[13px] font-medium leading-tight"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Greeting Bar                                                       */
/* ------------------------------------------------------------------ */

function GreetingBar({
  greeting,
  todayLabel,
}: {
  greeting: string
  todayLabel: string
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-nuevo-dropdown]')) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [dropdownOpen])

  return (
    <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
      <div className="min-w-0">
        <h2
          className="text-[20px] sm:text-[24px] font-bold tracking-tight"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {greeting},{' '}
          <span className="gold-text">Lider</span>
        </h2>
        <p
          className="text-[12px] sm:text-[13px] mt-0.5 capitalize truncate"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {todayLabel}
        </p>
      </div>

      <div className="relative shrink-0" data-nuevo-dropdown>
        <button
          className="btn-primary flex items-center gap-2 text-[13px]"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <Plus size={16} />
          Nuevo
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-48 rounded-xl p-1.5 z-50 fade-in"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <Link
              href="/hermanos"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-surface)'
                e.currentTarget.style.color = 'var(--color-text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              <UserPlus size={14} /> Nuevo Hermano
            </Link>
            <Link
              href="/agenda"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-surface)'
                e.currentTarget.style.color = 'var(--color-text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              <CalendarPlus size={14} /> Crear Evento
            </Link>
            <Link
              href="/anuncios"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-surface)'
                e.currentTarget.style.color = 'var(--color-text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              <Megaphone size={14} /> Publicar Anuncio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
