'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, X } from 'lucide-react'

interface Notificacion {
  id: string
  tipo: string
  titulo?: string
  mensaje: string
  leida: boolean
  createdAt: string
  metadatos?: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notificacion[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/notificaciones')
      const data = await r.json()
      setNotifs(data.notificaciones || [])
      setUnread(data.unread || 0)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [load])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const markAllRead = async () => {
    setLoading(true)
    await fetch('/api/notificaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marcarTodas: true }),
    })
    setUnread(0)
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
    setLoading(false)
  }

  const markOne = async (id: string) => {
    await fetch('/api/notificaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  const TIPO_ICON: Record<string, string> = {
    versiculo:    '📖',
    anuncio:      '📢',
    ausencia:     '⚠️',
    seguimiento:  '👁️',
    evento:       '📅',
    financiero:   '💰',
    info:         '💬',
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) load() }}
        className="relative p-2 rounded-lg transition-colors duration-200 cursor-pointer"
        style={{ color: open ? 'var(--color-accent-gold)' : 'var(--color-text-muted)' }}
        title="Notificaciones"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full min-w-[16px] h-4 px-0.5"
            style={{ background: '#ef4444', fontFamily: 'var(--font-display)' }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-default)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              Notificaciones
            </span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="text-xs transition-colors cursor-pointer"
                  style={{ color: 'var(--color-accent-gold)' }}
                >
                  {loading ? 'Marcando...' : 'Marcar todas'}
                </button>
              )}
              <button onClick={() => setOpen(false)} className="cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {notifs.length === 0 ? (
              <div className="py-8 text-center">
                <Bell size={24} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sin notificaciones</p>
              </div>
            ) : (
              notifs.map(n => {
                const icon = TIPO_ICON[n.tipo] || TIPO_ICON['info']
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.leida && markOne(n.id)}
                    className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                    style={{
                      background: n.leida ? 'transparent' : 'rgba(201,168,76,0.04)',
                      borderBottom: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{icon}</span>
                    <div className="flex-1 min-w-0">
                      {n.titulo && (
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {n.titulo}
                        </p>
                      )}
                      <p
                        className="text-xs leading-relaxed line-clamp-2"
                        style={{ color: n.leida ? 'var(--color-text-muted)' : 'var(--color-text-secondary)' }}
                      >
                        {n.mensaje}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.leida && (
                      <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--color-accent-gold)' }} />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
