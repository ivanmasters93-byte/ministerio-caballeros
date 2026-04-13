'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { buildJitsiEmbedUrl } from '@/lib/jitsi/config'
import {
  Video, Clock, Copy, Check, Share2, Users, Network,
  PlayCircle, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react'

interface Reunion {
  id: string
  titulo: string
  descripcion?: string | null
  fecha: string
  hora?: string | null
  jitsiRoomId?: string | null
  jitsiEnabled: boolean
  grabacionUrl?: string | null
  red?: { nombre: string } | null
}

interface Hermano {
  id: string
  user: { name: string; phone?: string | null }
}

interface Red {
  id: string
  nombre: string
  tipo: string
  _count?: { miembros: number }
}

type Paso = 'inicio' | 'crear' | 'compartir'

export default function ReunionesPage() {
  const [proximas, setProximas] = useState<Reunion[]>([])
  const [anteriores, setAnteriores] = useState<Reunion[]>([])
  const [loading, setLoading] = useState(true)
  const [redes, setRedes] = useState<Red[]>([])
  const [hermanos, setHermanos] = useState<Hermano[]>([])
  const [showAnteriores, setShowAnteriores] = useState(false)

  // Crear reunion state
  const [paso, setPaso] = useState<Paso>('inicio')
  const [titulo, setTitulo] = useState('')
  const [destino, setDestino] = useState<'todos' | 'red' | 'seleccionar'>('todos')
  const [redSeleccionada, setRedSeleccionada] = useState('')
  const [hermanosSeleccionados, setHermanosSeleccionados] = useState<Set<string>>(new Set())
  const [creando, setCreando] = useState(false)
  const [reunionCreada, setReunionCreada] = useState<Reunion | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/reuniones?tipo=proximas').then(r => r.json()),
      fetch('/api/reuniones?tipo=anteriores').then(r => r.json()),
      fetch('/api/redes').then(r => r.json()),
      fetch('/api/hermanos?limit=200').then(r => r.json()),
    ]).then(([prox, ant, redesData, hermanosData]) => {
      setProximas(Array.isArray(prox) ? prox : [])
      setAnteriores(Array.isArray(ant) ? ant : [])
      setRedes(Array.isArray(redesData) ? redesData : [])
      const lista = Array.isArray(hermanosData) ? hermanosData
        : Array.isArray(hermanosData?.data) ? hermanosData.data : []
      setHermanos(lista)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const crearReunion = async () => {
    const nombre = titulo.trim() || `Reunion ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
    setCreando(true)
    try {
      const res = await fetch('/api/reuniones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nombre }),
      })
      if (res.ok) {
        const nueva = await res.json()
        setReunionCreada(nueva)
        setProximas(prev => [nueva, ...prev])
        setPaso('compartir')
      }
    } catch {} finally { setCreando(false) }
  }

  const getMeetingUrl = (r: Reunion) => {
    if (!r.jitsiRoomId) return ''
    return buildJitsiEmbedUrl(r.jitsiRoomId, { subject: r.titulo })
  }

  const compartirWhatsApp = (url: string, titulo: string, phones: string[]) => {
    const msg = encodeURIComponent(`Reunion GEDEONES: ${titulo}\n\nUnete aqui:\n${url}`)
    if (phones.length === 1) {
      window.open(`https://wa.me/${phones[0].replace(/\D/g, '')}?text=${msg}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${msg}`, '_blank')
    }
  }

  const getDestinatariosPhones = (): string[] => {
    if (destino === 'todos') {
      return hermanos.filter(h => h.user.phone).map(h => h.user.phone!)
    }
    if (destino === 'red') {
      // For now share to all (API doesn't filter by red in hermanos list)
      return hermanos.filter(h => h.user.phone).map(h => h.user.phone!)
    }
    return hermanos
      .filter(h => hermanosSeleccionados.has(h.id) && h.user.phone)
      .map(h => h.user.phone!)
  }

  const toggleHermano = (id: string) => {
    setHermanosSeleccionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const resetCrear = () => {
    setPaso('inicio')
    setTitulo('')
    setDestino('todos')
    setRedSeleccionada('')
    setHermanosSeleccionados(new Set())
    setReunionCreada(null)
  }

  const formatFecha = (f: string) =>
    new Date(f).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })

  const esHoy = (f: string) => {
    const h = new Date(), d = new Date(f)
    return h.toDateString() === d.toDateString()
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl w-11 h-11"
          style={{ background: 'var(--color-accent-gold-soft)', border: '1px solid rgba(201,168,76,0.2)' }}
        >
          <Video size={22} style={{ color: 'var(--color-accent-gold)' }} />
        </div>
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            Reuniones
          </h1>
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Videollamadas instantaneas &middot; Sin descargar nada
          </p>
        </div>
      </div>

      {/* ===== PASO: INICIO ===== */}
      {paso === 'inicio' && (
        <>
          {/* Big create button */}
          <button
            onClick={() => setPaso('crear')}
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200 cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))',
              border: '2px dashed rgba(201,168,76,0.3)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
              style={{ background: 'var(--color-accent-gold-soft)' }}
            >
              <Video size={32} style={{ color: 'var(--color-accent-gold)' }} />
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                Crear Reunion
              </p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Toca para iniciar y compartir el link
              </p>
            </div>
          </button>

          {/* Proximas */}
          {proximas.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Proximas
              </p>
              <div className="space-y-2">
                {proximas.map(r => (
                  <ReunionCard key={r.id} reunion={r} onUnirse={() => {
                    const url = getMeetingUrl(r)
                    if (url) window.open(url, '_blank')
                  }} onCompartir={() => {
                    const url = getMeetingUrl(r)
                    if (url) compartirWhatsApp(url, r.titulo, [])
                  }} esHoy={esHoy(r.fecha)} formatFecha={formatFecha} />
                ))}
              </div>
            </div>
          )}

          {/* Anteriores (colapsable) */}
          {anteriores.length > 0 && (
            <div>
              <button
                onClick={() => setShowAnteriores(!showAnteriores)}
                className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest mb-3 cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Anteriores ({anteriores.length})
                {showAnteriores ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {showAnteriores && (
                <div className="space-y-2">
                  {anteriores.map(r => (
                    <div
                      key={r.id}
                      className="rounded-xl p-3 flex items-center justify-between"
                      style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>{r.titulo}</p>
                        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{formatFecha(r.fecha)}</p>
                      </div>
                      {r.grabacionUrl && (
                        <a href={r.grabacionUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm"><PlayCircle size={14} /></Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && proximas.length === 0 && anteriores.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                Aun no hay reuniones. Crea la primera.
              </p>
            </div>
          )}
        </>
      )}

      {/* ===== PASO: CREAR ===== */}
      {paso === 'crear' && (
        <div className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="text-[13px] font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
              Nombre de la reunion (opcional)
            </label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder={`Reunion ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
              className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
          </div>

          {/* A quienes invitar */}
          <div>
            <label className="text-[13px] font-medium mb-3 block" style={{ color: 'var(--color-text-secondary)' }}>
              Invitar a:
            </label>
            <div className="space-y-2">
              {/* Todos */}
              <button
                onClick={() => setDestino('todos')}
                className="w-full rounded-xl p-4 flex items-center gap-3 text-left cursor-pointer transition-all"
                style={{
                  background: destino === 'todos' ? 'var(--color-accent-gold-soft)' : 'var(--color-bg-surface)',
                  border: destino === 'todos' ? '2px solid var(--color-accent-gold)' : '1px solid var(--color-border-subtle)',
                }}
              >
                <Users size={20} style={{ color: destino === 'todos' ? 'var(--color-accent-gold)' : 'var(--color-text-muted)' }} />
                <div>
                  <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Todos los hermanos</p>
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{hermanos.length} personas</p>
                </div>
              </button>

              {/* Por Red */}
              <button
                onClick={() => setDestino('red')}
                className="w-full rounded-xl p-4 flex items-center gap-3 text-left cursor-pointer transition-all"
                style={{
                  background: destino === 'red' ? 'var(--color-accent-blue-soft)' : 'var(--color-bg-surface)',
                  border: destino === 'red' ? '2px solid var(--color-accent-blue)' : '1px solid var(--color-border-subtle)',
                }}
              >
                <Network size={20} style={{ color: destino === 'red' ? 'var(--color-accent-blue)' : 'var(--color-text-muted)' }} />
                <div>
                  <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Solo una red</p>
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Elige cual red invitar</p>
                </div>
              </button>

              {/* Red selector */}
              {destino === 'red' && (
                <div className="grid grid-cols-3 gap-2 pl-2">
                  {redes.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRedSeleccionada(r.id)}
                      className="rounded-lg p-3 text-center cursor-pointer transition-all"
                      style={{
                        background: redSeleccionada === r.id ? 'var(--color-accent-blue-soft)' : 'var(--color-bg-elevated)',
                        border: redSeleccionada === r.id ? '2px solid var(--color-accent-blue)' : '1px solid var(--color-border-subtle)',
                        color: redSeleccionada === r.id ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                      }}
                    >
                      <p className="text-[13px] font-semibold">{r.nombre}</p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{r._count?.miembros ?? '?'}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Seleccionar individuales */}
              <button
                onClick={() => setDestino('seleccionar')}
                className="w-full rounded-xl p-4 flex items-center gap-3 text-left cursor-pointer transition-all"
                style={{
                  background: destino === 'seleccionar' ? 'var(--color-accent-purple-soft)' : 'var(--color-bg-surface)',
                  border: destino === 'seleccionar' ? '2px solid var(--color-accent-purple)' : '1px solid var(--color-border-subtle)',
                }}
              >
                <Share2 size={20} style={{ color: destino === 'seleccionar' ? 'var(--color-accent-purple)' : 'var(--color-text-muted)' }} />
                <div>
                  <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Elegir personas</p>
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                    {hermanosSeleccionados.size > 0 ? `${hermanosSeleccionados.size} seleccionados` : 'Selecciona quienes invitar'}
                  </p>
                </div>
              </button>

              {/* Individual selector */}
              {destino === 'seleccionar' && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border-subtle)', maxHeight: 240, overflowY: 'auto' }}>
                  {hermanos.map(h => (
                    <button
                      key={h.id}
                      onClick={() => toggleHermano(h.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors"
                      style={{
                        background: hermanosSeleccionados.has(h.id) ? 'var(--color-accent-purple-soft)' : 'transparent',
                        borderBottom: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background: hermanosSeleccionados.has(h.id) ? 'var(--color-accent-purple)' : 'var(--color-bg-elevated)',
                          border: hermanosSeleccionados.has(h.id) ? 'none' : '1px solid var(--color-border-default)',
                        }}
                      >
                        {hermanosSeleccionados.has(h.id) && <Check size={12} color="#fff" />}
                      </div>
                      <span className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>{h.user.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={resetCrear} className="flex-1">Cancelar</Button>
            <Button onClick={crearReunion} disabled={creando} className="flex-1 flex items-center justify-center gap-2">
              <Video size={16} />
              {creando ? 'Creando...' : 'Crear y Compartir'}
            </Button>
          </div>
        </div>
      )}

      {/* ===== PASO: COMPARTIR ===== */}
      {paso === 'compartir' && reunionCreada && (
        <div className="space-y-5">
          {/* Success card */}
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.03))',
              border: '1px solid rgba(201,168,76,0.2)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--color-accent-gold-soft)' }}
            >
              <Video size={32} style={{ color: 'var(--color-accent-gold)' }} />
            </div>
            <p className="text-[18px] font-bold mb-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              {reunionCreada.titulo}
            </p>
            <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
              Reunion creada. Comparte el link.
            </p>
          </div>

          {/* Link display */}
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)' }}
          >
            <p className="text-[13px] flex-1 truncate" style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
              {getMeetingUrl(reunionCreada)}
            </p>
            <CopyButton text={getMeetingUrl(reunionCreada)} />
          </div>

          {/* Share buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                const url = getMeetingUrl(reunionCreada)
                const phones = getDestinatariosPhones()
                compartirWhatsApp(url, reunionCreada.titulo, phones)
              }}
              className="w-full rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all"
              style={{
                background: 'rgba(37, 211, 102, 0.1)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37,211,102,0.2)' }}>
                <Share2 size={20} style={{ color: '#25D366' }} />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-semibold" style={{ color: '#25D366' }}>Compartir por WhatsApp</p>
                <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                  Enviar link a {destino === 'seleccionar' ? `${hermanosSeleccionados.size} personas` : destino === 'red' ? 'la red' : 'todos'}
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                const url = getMeetingUrl(reunionCreada)
                window.open(url, '_blank')
              }}
              className="w-full rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all"
              style={{
                background: 'var(--color-accent-gold-soft)',
                border: '1px solid rgba(201,168,76,0.3)',
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.2)' }}>
                <ExternalLink size={20} style={{ color: 'var(--color-accent-gold)' }} />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-semibold" style={{ color: 'var(--color-accent-gold)' }}>Unirme ahora</p>
                <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Abrir la reunion en otra ventana</p>
              </div>
            </button>
          </div>

          <Button variant="ghost" onClick={resetCrear} className="w-full">
            Volver a Reuniones
          </Button>
        </div>
      )}
    </div>
  )
}

/* --- Sub-components --- */

function ReunionCard({ reunion, onUnirse, onCompartir, esHoy, formatFecha }: {
  reunion: Reunion; onUnirse: () => void; onCompartir: () => void; esHoy: boolean; formatFecha: (f: string) => string
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {reunion.titulo}
            </p>
            {esHoy && <span className="badge-gold text-[10px]">HOY</span>}
          </div>
          <p className="text-[12px] flex items-center gap-1 mt-1" style={{ color: 'var(--color-text-muted)' }}>
            <Clock size={11} /> {formatFecha(reunion.fecha)} {reunion.hora && `· ${reunion.hora}`}
            {reunion.red && ` · ${reunion.red.nombre}`}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onUnirse} disabled={!reunion.jitsiRoomId} className="flex-1 flex items-center justify-center gap-1.5">
          <Video size={14} /> Unirme
        </Button>
        <Button size="sm" variant="outline" onClick={onCompartir} disabled={!reunion.jitsiRoomId} className="flex items-center gap-1.5">
          <Share2 size={14} /> Compartir
        </Button>
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button
      onClick={copy}
      className="p-2 rounded-lg cursor-pointer transition-colors flex-shrink-0"
      style={{ color: copied ? 'var(--color-accent-green)' : 'var(--color-text-muted)' }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  )
}
