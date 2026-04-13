'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

interface DashboardStats {
  hermanos?: {
    total?: number
    activos?: number
    inactivos?: number
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

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
      <div className="space-y-8">
        {/* Greeting - renders immediately */}
        <GreetingBar greeting={greeting} todayLabel={todayLabel} />

        {/* Skeleton stat cards */}
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
  const statCards = [
    {
      label: 'Hermanos Activos',
      value: stats?.hermanos?.activos ?? 0,
      subtitle: `de ${stats?.hermanos?.total ?? 0} totales`,
      icon: Users,
      accentColor: 'var(--color-accent-blue)',
      accentSoft: 'var(--color-accent-blue-soft)',
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
  ]

  const eventos = stats?.eventos?.proximos ?? []
  const anuncios = stats?.anuncios?.recientes ?? []
  const casosAbiertos = Array.isArray(stats?.seguimiento?.abiertos)
    ? stats.seguimiento.abiertos
    : []

  return (
    <div className="space-y-8">
      {/* ========== SECTION 1: GREETING ========== */}
      <div className="slide-up">
        <GreetingBar greeting={greeting} todayLabel={todayLabel} />
      </div>

      {/* ========== SECTION 2: QUICK STATS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link key={card.label} href={card.href} className="group">
            <div
              className="stat-card slide-up"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{ background: card.accentSoft }}
                >
                  <card.icon size={18} style={{ color: card.accentColor }} />
                </div>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {card.label}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span
                  className="text-[32px] font-bold leading-none tracking-tight"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {card.value}
                </span>
                <span
                  className="text-[12px] pb-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {card.subtitle}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ========== SECTION 3: ACTION REQUIRED ========== */}
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

            {/* Action items row */}
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

      {/* ========== SECTION 4: EVENTS + ANNOUNCEMENTS ========== */}
      <div
        className="grid grid-cols-1 lg:grid-cols-5 gap-6 slide-up"
        style={{ animationDelay: '500ms' }}
      >
        {/* Left: Proximos Eventos (3/5 = 60%) */}
        <div className="lg:col-span-3 dark-card p-6">
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
              {/* Connecting line */}
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
                      {/* Date pill */}
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

                      {/* Event details */}
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
        <div className="lg:col-span-2 dark-card p-6">
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

      {/* ========== SECTION 5: SEGUIMIENTO PASTORAL ========== */}
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

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {casosAbiertos.map((caso) => {
              const estadoClass = CASO_ESTADO_BADGE[caso.estado] ?? 'badge-ghost'
              const initial = caso.hermano?.user?.name?.charAt(0)?.toUpperCase() ?? '?'
              return (
                <Link
                  key={caso.id}
                  href="/seguimiento"
                  className="dark-card-hover p-4 min-w-[280px] max-w-[320px] shrink-0"
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

      {/* ========== SECTION 6: QUICK ACTIONS ========== */}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function GreetingBar({
  greeting,
  todayLabel,
}: {
  greeting: string
  todayLabel: string
}) {
  return (
    <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
      <div>
        <h2
          className="text-[24px] font-bold tracking-tight"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {greeting},{' '}
          <span className="gold-text">Lider</span>
        </h2>
        <p
          className="text-[13px] mt-0.5 capitalize"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {todayLabel}
        </p>
      </div>

      <div className="relative group">
        <button className="btn-primary flex items-center gap-2 text-[13px]">
          <Plus size={16} />
          Nuevo
        </button>

        {/* Dropdown */}
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-xl p-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <Link
            href="/hermanos"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors"
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
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors"
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
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors"
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
      </div>
    </div>
  )
}
