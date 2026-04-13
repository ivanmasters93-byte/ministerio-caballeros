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
  BookOpen,
  Mic,
  Palette,
  Sparkles,
  Copy,
  Check,
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
    { label: 'Leer Biblia', icon: BookOpen, color: 'var(--color-accent-gold)', soft: 'var(--color-accent-gold-soft)', href: '/biblia' },
    { label: 'Nueva Predica', icon: Mic, color: 'var(--color-accent-purple)', soft: 'var(--color-accent-purple-soft)', href: '/predicas/nueva' },
    { label: 'Crear Flyer', icon: Palette, color: 'var(--color-accent-green)', soft: 'var(--color-accent-green-soft)', href: '/flyers' },
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

      {/* ========== SECTION 5: GEDEONES 2.0 — NUEVAS HERRAMIENTAS ========== */}
      <div
        className="slide-up"
        style={{ animationDelay: '550ms' }}
      >
        {/* Versículo del Día */}
        <VersiculoDelDiaCard />

        {/* Quick access to new features */}
        <div className="mt-6">
          <h3
            className="text-[16px] font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Gedeones 2.0
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GedeoneFeatureCard
              href="/biblia"
              icon={BookOpen}
              title="Biblia"
              description="Lee, busca versiculos y sigue tu plan de lectura diaria"
              accentColor="var(--color-accent-gold)"
              accentSoft="var(--color-accent-gold-soft)"
            />
            <GedeoneFeatureCard
              href="/reuniones"
              icon={Video}
              title="Reuniones en Vivo"
              description="Videollamadas gratis con Jitsi Meet integrado"
              accentColor="var(--color-accent-blue)"
              accentSoft="var(--color-accent-blue-soft)"
            />
            <GedeoneFeatureCard
              href="/predicas"
              icon={Mic}
              title="Predicas"
              description="Transcripcion y resumenes automaticos de sermones"
              accentColor="var(--color-accent-purple)"
              accentSoft="var(--color-accent-purple-soft)"
            />
            <GedeoneFeatureCard
              href="/flyers"
              icon={Palette}
              title="Editor de Flyers"
              description="Crea afiches profesionales para tus eventos en minutos"
              accentColor="var(--color-accent-green)"
              accentSoft="var(--color-accent-green-soft)"
            />
          </div>
        </div>
      </div>

      {/* ========== SECTION 6: SEGUIMIENTO PASTORAL ========== */}
      {casosAbiertos.length > 0 && (
        <div
          className="slide-up"
          style={{ animationDelay: '650ms' }}
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

      {/* ========== SECTION 7: QUICK ACTIONS ========== */}
      <div
        className="slide-up"
        style={{ animationDelay: '750ms' }}
      >
        <h3
          className="text-[16px] font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Acciones Rapidas
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-3">
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

/* ------------------------------------------------------------------ */
/*  Gedeones 2.0 Feature Card                                         */
/* ------------------------------------------------------------------ */

function GedeoneFeatureCard({
  href,
  icon: Icon,
  title,
  description,
  accentColor,
  accentSoft,
}: {
  href: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  title: string
  description: string
  accentColor: string
  accentSoft: string
}) {
  return (
    <Link href={href} className="group">
      <div
        className="dark-card p-5 transition-all duration-200 hover:border-[var(--color-border-strong)] h-full"
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{ background: accentSoft }}
          >
            <Icon size={20} style={{ color: accentColor }} />
          </div>
          <div className="flex items-center gap-1.5">
            <h4
              className="text-[14px] font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
            </h4>
            <Sparkles size={12} style={{ color: accentColor }} />
          </div>
        </div>
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {description}
        </p>
        <div
          className="mt-3 flex items-center gap-1 text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: accentColor }}
        >
          Abrir <ChevronRight size={12} />
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/*  Versículo del Día Card                                             */
/* ------------------------------------------------------------------ */

function VersiculoDelDiaCard() {
  const [copied, setCopied] = useState(false)

  // Deterministic verse of the day (same algorithm as the API)
  const today = new Date()
  const start = new Date(today.getFullYear(), 0, 0)
  const diff = today.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / 86400000)

  // Curated verses inline (subset — full list is in the biblia module)
  const versiculos = [
    { referencia: 'Juan 3:16', texto: 'Porque de tal manera amo Dios al mundo, que ha dado a su Hijo unigenito, para que todo aquel que en el cree, no se pierda, mas tenga vida eterna.' },
    { referencia: 'Salmos 23:1', texto: 'Jehova es mi pastor; nada me faltara.' },
    { referencia: 'Filipenses 4:13', texto: 'Todo lo puedo en Cristo que me fortalece.' },
    { referencia: 'Jeremias 29:11', texto: 'Porque yo se los pensamientos que tengo acerca de vosotros, dice Jehova, pensamientos de paz, y no de mal, para daros el fin que esperais.' },
    { referencia: 'Romanos 8:28', texto: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su proposito son llamados.' },
    { referencia: 'Proverbios 3:5-6', texto: 'Fiate de Jehova de todo tu corazon, y no te apoyes en tu propia prudencia. Reconocelo en todos tus caminos, y el enderezara tus veredas.' },
    { referencia: 'Isaias 40:31', texto: 'Pero los que esperan a Jehova tendran nuevas fuerzas; levantaran alas como las aguilas; correran, y no se cansaran; caminaran, y no se fatigaran.' },
    { referencia: 'Josue 1:9', texto: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehova tu Dios estara contigo en dondequiera que vayas.' },
    { referencia: '2 Timoteo 1:7', texto: 'Porque no nos ha dado Dios espiritu de cobardía, sino de poder, de amor y de dominio propio.' },
    { referencia: 'Salmos 46:10', texto: 'Estad quietos, y conoced que yo soy Dios; sere exaltado entre las naciones; enaltecido sere en la tierra.' },
    { referencia: 'Mateo 11:28', texto: 'Venid a mi todos los que estais trabajados y cargados, y yo os hare descansar.' },
    { referencia: 'Salmos 119:105', texto: 'Lampara es a mis pies tu palabra, y lumbrera a mi camino.' },
  ]

  const verse = versiculos[dayOfYear % versiculos.length]

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${verse.texto}" — ${verse.referencia}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(30,64,175,0.06) 100%)',
        border: '1px solid rgba(201,168,76,0.15)',
      }}
    >
      {/* Decorative element */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04]"
        style={{
          background: 'var(--color-accent-gold)',
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} style={{ color: 'var(--color-accent-gold)' }} />
            <span
              className="text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-accent-gold)' }}
            >
              Versiculo del Dia
            </span>
          </div>
          <p
            className="text-[15px] leading-relaxed italic"
            style={{ color: 'var(--color-text-primary)' }}
          >
            &ldquo;{verse.texto}&rdquo;
          </p>
          <p
            className="text-[13px] font-semibold mt-2"
            style={{ color: 'var(--color-accent-gold)' }}
          >
            — {verse.referencia}
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all"
          style={{
            background: copied ? 'var(--color-accent-green-soft)' : 'rgba(201,168,76,0.1)',
            color: copied ? 'var(--color-accent-green)' : 'var(--color-accent-gold)',
          }}
          title="Copiar versiculo"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <div className="mt-3 relative z-10">
        <Link
          href="/biblia"
          className="text-[12px] font-medium flex items-center gap-1 transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          Abrir Biblia <ChevronRight size={12} />
        </Link>
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
