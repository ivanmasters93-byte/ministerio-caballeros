'use client'

import { useEffect, useState } from 'react'
import { Video, Copy, Check, Share2, ExternalLink, ChevronDown, ChevronUp, PlayCircle, Clock } from 'lucide-react'
import { getJitsiUrl, generateRoomId } from '@/lib/jitsi/config'

interface Reunion {
  id: string
  titulo: string
  fecha: string
  hora?: string | null
  jitsiRoomId?: string | null
  jitsiEnabled: boolean
  grabacionUrl?: string | null
  red?: { nombre: string } | null
}

export default function ReunionesPage() {
  const [proximas, setProximas] = useState<Reunion[]>([])
  const [anteriores, setAnteriores] = useState<Reunion[]>([])
  const [showAnteriores, setShowAnteriores] = useState(false)
  const [loading, setLoading] = useState(true)
  const [iniciando, setIniciando] = useState(false)
  const [activa, setActiva] = useState<{ url: string; titulo: string } | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/reuniones?tipo=proximas').then(r => r.json()),
      fetch('/api/reuniones?tipo=anteriores').then(r => r.json()),
    ]).then(([prox, ant]) => {
      setProximas(Array.isArray(prox) ? prox : [])
      setAnteriores(Array.isArray(ant) ? ant : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const iniciarReunion = async () => {
    setIniciando(true)
    try {
      const titulo = `Reunión ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
      const res = await fetch('/api/reuniones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo }),
      })
      if (res.ok) {
        const nueva: Reunion = await res.json()
        const url = nueva.jitsiRoomId
          ? getJitsiUrl(nueva.jitsiRoomId)
          : getJitsiUrl(generateRoomId(nueva.id, nueva.titulo))
        setActiva({ url, titulo: nueva.titulo })
        setProximas(prev => [nueva, ...prev])
      }
    } catch {} finally { setIniciando(false) }
  }

  const copiar = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {}
  }

  const compartir = (url: string, titulo: string) => {
    const msg = encodeURIComponent(`📹 *${titulo}*\n\nÚnete aquí:\n${url}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const formatFecha = (f: string) =>
    new Date(f).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })

  const esHoy = (f: string) =>
    new Date().toDateString() === new Date(f).toDateString()

  return (
    <div className="space-y-5 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--color-accent-gold-soft)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <Video size={22} style={{ color: 'var(--color-accent-gold)' }} />
        </div>
        <div>
          <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            Reuniones
          </h1>
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Sin descargas · Funciona en cualquier dispositivo
          </p>
        </div>
      </div>

      {/* ── SALA ACTIVA ── */}
      {activa ? (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
          {/* Title bar */}
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))' }}>
            <div>
              <p className="text-[11px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(201,168,76,0.7)' }}>Sala lista</p>
              <p className="text-[16px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{activa.titulo}</p>
            </div>
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
          </div>

          {/* Link row */}
          <div className="px-5 py-3 flex items-center gap-2"
            style={{ background: 'var(--color-bg-elevated)', borderTop: '1px solid var(--color-border-subtle)' }}>
            <p className="text-[12px] flex-1 truncate" style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
              {activa.url}
            </p>
            <button onClick={() => copiar(activa.url)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium flex-shrink-0 cursor-pointer"
              style={{
                background: copiado ? 'rgba(34,197,94,0.15)' : 'var(--color-bg-surface)',
                color: copiado ? '#22c55e' : 'var(--color-text-secondary)',
                border: `1px solid ${copiado ? 'rgba(34,197,94,0.3)' : 'var(--color-border-default)'}`,
              }}>
              {copiado ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
            </button>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 p-4"
            style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border-subtle)' }}>
            <button
              onClick={() => window.open(activa.url, '_blank')}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[14px] cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #a67c2e)', color: '#0a0e1a' }}>
              <Video size={16} /> Entrar
            </button>
            <button
              onClick={() => compartir(activa.url, activa.titulo)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[14px] cursor-pointer"
              style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366', border: '1px solid rgba(37,211,102,0.25)' }}>
              <Share2 size={16} /> WhatsApp
            </button>
          </div>

          <button onClick={() => setActiva(null)}
            className="w-full py-3 text-[12px] cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}>
            Cerrar
          </button>
        </div>
      ) : (
        /* ── BOTÓN INICIAR ── */
        <button
          onClick={iniciarReunion}
          disabled={iniciando}
          className="w-full rounded-2xl py-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 group disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))',
            border: '2px dashed rgba(201,168,76,0.35)',
          }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
            style={{ background: 'var(--color-accent-gold-soft)' }}>
            {iniciando
              ? <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent-gold)', borderTopColor: 'transparent' }} />
              : <Video size={32} style={{ color: 'var(--color-accent-gold)' }} />
            }
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold" style={{ color: 'var(--color-accent-gold)' }}>
              {iniciando ? 'Creando sala...' : 'Iniciar Reunión'}
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Un toque · Sala lista al instante
            </p>
          </div>
        </button>
      )}

      {/* ── PRÓXIMAS ── */}
      {!loading && proximas.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Próximas
          </p>
          <div className="space-y-2">
            {proximas.map(r => {
              const url = r.jitsiRoomId ? getJitsiUrl(r.jitsiRoomId) : null
              return (
                <div key={r.id} className="rounded-xl p-4"
                  style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {r.titulo}
                        </p>
                        {esHoy(r.fecha) && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--color-accent-gold)' }}>HOY</span>
                        )}
                      </div>
                      <p className="text-[12px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock size={11} /> {formatFecha(r.fecha)}{r.hora && ` · ${r.hora}`}{r.red && ` · ${r.red.nombre}`}
                      </p>
                    </div>
                  </div>
                  {url && (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => window.open(url, '_blank')}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #c9a84c, #a67c2e)', color: '#0a0e1a' }}>
                        <Video size={14} /> Unirme
                      </button>
                      <button onClick={() => compartir(url, r.titulo)}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold cursor-pointer"
                        style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366', border: '1px solid rgba(37,211,102,0.2)' }}>
                        <Share2 size={14} /> Compartir
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── ANTERIORES ── */}
      {anteriores.length > 0 && (
        <div>
          <button onClick={() => setShowAnteriores(!showAnteriores)}
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest mb-3 cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}>
            Anteriores ({anteriores.length})
            {showAnteriores ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showAnteriores && (
            <div className="space-y-2">
              {anteriores.map(r => (
                <div key={r.id} className="rounded-xl p-3 flex items-center justify-between"
                  style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>{r.titulo}</p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{formatFecha(r.fecha)}</p>
                  </div>
                  {r.grabacionUrl && (
                    <a href={r.grabacionUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg" style={{ color: 'var(--color-text-muted)' }}>
                      <PlayCircle size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && proximas.length === 0 && anteriores.length === 0 && !activa && (
        <p className="text-center text-[13px] py-6" style={{ color: 'var(--color-text-muted)' }}>
          No hay reuniones aún. Toca el botón para crear la primera.
        </p>
      )}
    </div>
  )
}
