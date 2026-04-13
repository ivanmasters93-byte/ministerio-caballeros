'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { buildJitsiEmbedUrl } from '@/lib/jitsi/config'
import { Video, Plus, Clock, Radio, PlayCircle, Copy, Check, Share2 } from 'lucide-react'

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

export default function ReunionesPage() {
  const [proximas, setProximas] = useState<Reunion[]>([])
  const [anteriores, setAnteriores] = useState<Reunion[]>([])
  const [loading, setLoading] = useState(true)
  const [showCrear, setShowCrear] = useState(false)
  const [nuevoTitulo, setNuevoTitulo] = useState('')
  const [creando, setCreando] = useState(false)

  const cargarReuniones = async () => {
    setLoading(true)
    try {
      const [rProx, rAnt] = await Promise.all([
        fetch('/api/reuniones?tipo=proximas').then(r => r.json()),
        fetch('/api/reuniones?tipo=anteriores').then(r => r.json()),
      ])
      setProximas(Array.isArray(rProx) ? rProx : [])
      setAnteriores(Array.isArray(rAnt) ? rAnt : [])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarReuniones() }, [])

  const unirseReunion = (reunion: Reunion) => {
    if (!reunion.jitsiRoomId) return
    // Open in new tab — works on mobile without login issues
    const url = buildJitsiEmbedUrl(reunion.jitsiRoomId, { subject: reunion.titulo })
    window.open(url, '_blank', 'noopener')
  }

  const crearReunionInstantanea = async () => {
    if (!nuevoTitulo.trim()) return
    setCreando(true)
    try {
      const res = await fetch('/api/reuniones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nuevoTitulo.trim() }),
      })
      if (res.ok) {
        const nueva = await res.json()
        setShowCrear(false)
        setNuevoTitulo('')
        await cargarReuniones()
        if (nueva.jitsiRoomId) {
          // Open meeting directly
          const url = buildJitsiEmbedUrl(nueva.jitsiRoomId, { subject: nueva.titulo })
          window.open(url, '_blank', 'noopener')
        }
      }
    } catch {
      // silently handle
    } finally {
      setCreando(false)
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const esHoy = (fecha: string) => {
    const hoy = new Date()
    const f = new Date(fecha)
    return f.getFullYear() === hoy.getFullYear() &&
      f.getMonth() === hoy.getMonth() &&
      f.getDate() === hoy.getDate()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-lg w-10 h-10"
            style={{ background: 'var(--color-accent-gold-soft)' }}
          >
            <Video size={20} style={{ color: 'var(--color-accent-gold)' }} />
          </div>
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
            >
              Reuniones en Vivo
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Videollamadas gratuitas con Jitsi Meet - Gedeones 2.0
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCrear(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Reunion Rapida
        </Button>
      </div>

      {/* Instant meeting section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio size={18} style={{ color: 'var(--color-accent-gold)' }} />
            Reunion Rapida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Inicia una videollamada instantanea sin necesidad de programarla. Comparte el enlace con los hermanos.
          </p>
          <Button onClick={() => setShowCrear(true)} variant="outline" className="flex items-center gap-2">
            <Plus size={16} />
            Crear reunion ahora
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming meetings */}
      <div>
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Proximas Reuniones
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div
                key={i}
                className="h-20 rounded-xl animate-pulse"
                style={{ background: 'var(--color-bg-elevated)' }}
              />
            ))}
          </div>
        ) : proximas.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Video size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>
                No hay reuniones con video programadas
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Activa &quot;Habilitar videollamada&quot; al crear un evento en la Agenda
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {proximas.map(r => (
              <Card key={r.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className="font-semibold truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {r.titulo}
                        </p>
                        {esHoy(r.fecha) && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0"
                            style={{
                              background: 'var(--color-accent-gold-soft)',
                              color: 'var(--color-accent-gold)',
                            }}
                          >
                            Hoy
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatFecha(r.fecha)}
                          {r.hora && ` · ${r.hora}`}
                        </span>
                        {r.red && <span>· {r.red.nombre}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.jitsiRoomId && (
                        <CopyLinkButton roomId={r.jitsiRoomId} />
                      )}
                      <Button
                        size="sm"
                        onClick={() => unirseReunion(r)}
                        disabled={!r.jitsiRoomId}
                        className="flex items-center gap-1.5"
                      >
                        <Video size={14} />
                        Unirse
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past meetings */}
      {anteriores.length > 0 && (
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Reuniones Anteriores
          </h3>
          <div className="space-y-3">
            {anteriores.map(r => (
              <Card key={r.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium truncate"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {r.titulo}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {formatFecha(r.fecha)}
                        {r.hora && ` · ${r.hora}`}
                        {r.red && ` · ${r.red.nombre}`}
                      </p>
                    </div>
                    {r.grabacionUrl ? (
                      <a
                        href={r.grabacionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                          <PlayCircle size={14} />
                          Grabacion
                        </Button>
                      </a>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Sin grabacion
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create meeting dialog */}
      <Dialog
        open={showCrear}
        onClose={() => { setShowCrear(false); setNuevoTitulo('') }}
        title="Nueva Reunion Rapida"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Se creara una sala de videollamada gratuita con Jitsi Meet. No se necesita cuenta.
          </p>
          <div>
            <label
              htmlFor="nuevo-titulo"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Nombre de la reunion
            </label>
            <input
              id="nuevo-titulo"
              type="text"
              value={nuevoTitulo}
              onChange={e => setNuevoTitulo(e.target.value)}
              placeholder="Ej: Reunion Liderazgo Abril"
              onKeyDown={e => { if (e.key === 'Enter') crearReunionInstantanea() }}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => { setShowCrear(false); setNuevoTitulo('') }}
            >
              Cancelar
            </Button>
            <Button
              onClick={crearReunionInstantanea}
              disabled={creando || !nuevoTitulo.trim()}
              className="flex items-center gap-2"
            >
              <Video size={14} />
              {creando ? 'Creando...' : 'Iniciar reunion'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

function CopyLinkButton({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined' ? `${window.location.origin}/sala/${roomId}` : `/sala/${roomId}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={copy} title="Copiar link de invitacion">
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </Button>
  )
}
