'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GrabadorEnVivo } from '@/components/predicas/GrabadorEnVivo'
import { ArrowLeft, Mic, Save, Upload } from 'lucide-react'

interface Red {
  id: string
  nombre: string
}

interface Evento {
  id: string
  titulo: string
}

export default function NuevaPredicaPage() {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [redes, setRedes] = useState<Red[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [modoTranscripcion, setModoTranscripcion] = useState<'manual' | 'voz' | 'archivo'>('manual')

  const [form, setForm] = useState({
    titulo: '',
    predicador: '',
    fecha: new Date().toISOString().split('T')[0],
    duracion: '',
    redId: '',
    eventoId: '',
    transcripcion: '',
  })

  const [audioFile, setAudioFile] = useState<File | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/redes').then((r) => r.json()),
      fetch('/api/eventos?limit=50').then((r) => r.json()),
    ]).then(([redesData, eventosData]) => {
      setRedes(Array.isArray(redesData) ? redesData : redesData?.data ?? [])
      const evList = Array.isArray(eventosData) ? eventosData : eventosData?.data ?? []
      setEventos(evList)
    }).catch(() => {})
  }, [])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.titulo.trim()) {
      setError('El título es requerido')
      return
    }
    if (!form.predicador.trim()) {
      setError('El nombre del predicador es requerido')
      return
    }

    setGuardando(true)
    try {
      // 1. Crear la prédica
      const res = await fetch('/api/predicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          predicador: form.predicador.trim(),
          fecha: form.fecha,
          duracion: form.duracion ? parseInt(form.duracion) : null,
          redId: form.redId || null,
          eventoId: form.eventoId || null,
          transcripcion: form.transcripcion || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? 'Error al guardar la prédica')
        return
      }

      const predica = await res.json()

      // 2. Si hay archivo de audio, subirlo para transcripción
      if (audioFile && modoTranscripcion === 'archivo') {
        const audioForm = new FormData()
        audioForm.append('audio', audioFile)

        await fetch(`/api/predicas/${predica.id}/transcribir`, {
          method: 'POST',
          body: audioForm,
        })
      }

      router.push('/predicas')
    } catch {
      setError('Error inesperado al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-1" /> Volver
        </Button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Nueva Prédica
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Registra un sermón o prédica
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Datos básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mic size={16} style={{ color: 'var(--color-accent-gold)' }} />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={set('titulo')}
                placeholder="Ej: El Poder de la Fe"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="predicador">Predicador *</Label>
              <Input
                id="predicador"
                value={form.predicador}
                onChange={set('predicador')}
                placeholder="Nombre del predicador"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={form.fecha}
                  onChange={set('fecha')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duracion">Duración (minutos)</Label>
                <Input
                  id="duracion"
                  type="number"
                  min="1"
                  value={form.duracion}
                  onChange={set('duracion')}
                  placeholder="Ej: 45"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="redId">Red (opcional)</Label>
                <select
                  id="redId"
                  value={form.redId}
                  onChange={set('redId')}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="">Sin red específica</option>
                  {redes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eventoId">Evento asociado (opcional)</Label>
                <select
                  id="eventoId"
                  value={form.eventoId}
                  onChange={set('eventoId')}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="">Sin evento</option>
                  {eventos.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcripción */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transcripción (opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selector de modo */}
            <div className="flex gap-2">
              {[
                { value: 'manual', label: 'Texto manual' },
                { value: 'voz', label: 'Grabar en vivo' },
                { value: 'archivo', label: 'Subir audio' },
              ].map((modo) => (
                <button
                  key={modo.value}
                  type="button"
                  onClick={() => setModoTranscripcion(modo.value as typeof modoTranscripcion)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background:
                      modoTranscripcion === modo.value
                        ? 'var(--color-accent-gold)'
                        : 'var(--color-bg-elevated)',
                    color:
                      modoTranscripcion === modo.value
                        ? '#0c0e14'
                        : 'var(--color-text-secondary)',
                    border: '1px solid transparent',
                  }}
                >
                  {modo.label}
                </button>
              ))}
            </div>

            {modoTranscripcion === 'manual' && (
              <Textarea
                placeholder="Pega o escribe la transcripción completa de la prédica aquí..."
                value={form.transcripcion}
                onChange={set('transcripcion')}
                rows={10}
                className="font-mono text-sm resize-y"
              />
            )}

            {modoTranscripcion === 'voz' && (
              <GrabadorEnVivo
                onTranscripcion={(texto) =>
                  setForm((prev) => ({ ...prev, transcripcion: texto }))
                }
              />
            )}

            {modoTranscripcion === 'archivo' && (
              <div className="space-y-3">
                <div
                  className="rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--color-border-default)' }}
                  onClick={() => document.getElementById('audio-input')?.click()}
                >
                  <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {audioFile ? audioFile.name : 'Selecciona un archivo de audio'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    MP3, WAV, M4A, OGG, WebM (requiere GROQ_API_KEY)
                  </p>
                </div>
                <input
                  id="audio-input"
                  type="file"
                  accept="audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/webm,audio/flac,.mp3,.wav,.m4a,.ogg,.webm,.flac"
                  className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                />
              </div>
            )}

            {form.transcripcion && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {form.transcripcion.length.toLocaleString()} caracteres capturados
              </p>
            )}
          </CardContent>
        </Card>

        {error && (
          <div
            className="rounded-lg px-4 py-3 text-sm"
            style={{
              background: 'var(--color-accent-red-soft)',
              color: 'var(--color-accent-red)',
              border: '1px solid var(--color-accent-red)',
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={guardando}>
            <Save size={14} className="mr-1" />
            {guardando ? 'Guardando...' : 'Guardar Prédica'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
