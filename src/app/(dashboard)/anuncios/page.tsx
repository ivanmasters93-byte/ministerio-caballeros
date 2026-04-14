'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import {
  Plus, Megaphone, AlertTriangle, Bell, Calendar, Globe,
  ImageIcon, X, Upload, Loader2, Clock, CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'

interface Anuncio {
  id: string
  titulo: string
  contenido: string
  tipo: string
  prioridad: string
  activo: boolean
  paraTodasRedes?: boolean
  publicadoEn: string
  expiraEn?: string
  imagenUrl?: string
  red?: { nombre: string }
}

interface Red {
  id: string
  nombre: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TIPO_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  GENERAL:      { icon: Megaphone,      color: 'var(--color-accent-blue)',   bg: 'var(--color-accent-blue-soft)',   label: 'General' },
  URGENTE:      { icon: AlertTriangle,  color: 'var(--color-accent-red)',    bg: 'var(--color-accent-red-soft)',    label: 'Urgente' },
  RECORDATORIO: { icon: Bell,           color: 'var(--color-accent-amber)',  bg: 'var(--color-accent-amber-soft)',  label: 'Recordatorio' },
  EVENTO:       { icon: Calendar,       color: 'var(--color-accent-green)',  bg: 'var(--color-accent-green-soft)',  label: 'Evento' },
}

const PRIORIDAD_META: Record<string, { color: string; bg: string; label: string }> = {
  URGENTE: { color: 'var(--color-accent-red)',    bg: 'var(--color-accent-red-soft)',    label: 'Urgente' },
  ALTA:    { color: 'var(--color-accent-amber)',  bg: 'var(--color-accent-amber-soft)',  label: 'Alta' },
  NORMAL:  { color: 'var(--color-accent-blue)',   bg: 'var(--color-accent-blue-soft)',   label: 'Normal' },
  BAJA:    { color: 'var(--color-text-muted)',    bg: 'var(--color-bg-elevated)',        label: 'Baja' },
}

/* ------------------------------------------------------------------ */
/*  Image Upload Zone                                                  */
/* ------------------------------------------------------------------ */

function ImageUploadZone({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const upload = async (file: File) => {
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir')
      onChange(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }
    upload(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/7' }}>
        <Image src={value} alt="Banner" fill style={{ objectFit: 'cover' }} />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <button
            onClick={() => onChange('')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-accent-red)', color: '#fff' }}
          >
            <X size={14} /> Quitar imagen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
        style={{
          minHeight: '140px',
          borderColor: dragging ? 'var(--color-accent-gold)' : 'var(--color-border-default)',
          background: dragging ? 'var(--color-accent-gold-soft)' : 'var(--color-bg-elevated)',
        }}
      >
        {uploading ? (
          <>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent-gold)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Subiendo imagen...</p>
          </>
        ) : (
          <>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-accent-gold-soft)' }}
            >
              <ImageIcon size={20} style={{ color: 'var(--color-accent-gold)' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Arrastra una imagen o{' '}
                <span style={{ color: 'var(--color-accent-gold)' }}>haz clic aquí</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                JPG, PNG, WebP — máx. 5MB
              </p>
            </div>
          </>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Anuncio Card                                                       */
/* ------------------------------------------------------------------ */

function AnuncioCard({ a }: { a: Anuncio }) {
  const tipo = TIPO_META[a.tipo] ?? TIPO_META['GENERAL']
  const prio = PRIORIDAD_META[a.prioridad] ?? PRIORIDAD_META['NORMAL']
  const TipoIcon = tipo.icon

  const isUrgente = a.prioridad === 'URGENTE'

  return (
    <div
      className="group rounded-xl overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
      style={{
        background: 'var(--color-bg-surface)',
        border: `1px solid ${isUrgente ? 'rgba(248,113,113,0.25)' : 'var(--color-border-subtle)'}`,
        boxShadow: isUrgente ? '0 0 0 1px rgba(248,113,113,0.1)' : undefined,
        opacity: a.activo ? 1 : 0.55,
      }}
    >
      {/* Banner image */}
      {a.imagenUrl && (
        <div className="relative w-full" style={{ aspectRatio: '16/6' }}>
          <Image
            src={a.imagenUrl}
            alt={a.titulo}
            fill
            style={{ objectFit: 'cover' }}
          />
          {/* Gradient overlay at bottom for text readability */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(19,22,30,0.85) 100%)' }}
          />
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: tipo.bg, color: tipo.color }}
          >
            <TipoIcon size={17} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3
                className="font-semibold leading-snug"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontSize: '0.9375rem' }}
              >
                {a.titulo}
              </h3>

              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                  style={{ background: prio.bg, color: prio.color }}
                >
                  {prio.label}
                </span>
                {a.paraTodasRedes && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
                    style={{ background: 'var(--color-accent-gold-soft)', color: 'var(--color-accent-gold)' }}
                  >
                    <Globe size={10} /> Todas
                  </span>
                )}
                {a.red && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                    style={{ background: 'var(--color-accent-blue-soft)', color: 'var(--color-accent-blue)' }}
                  >
                    {a.red.nombre}
                  </span>
                )}
                {!a.activo && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[11px]"
                    style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
                  >
                    Inactivo
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <p
              className="text-sm mt-1.5 leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {a.contenido}
            </p>

            {/* Footer meta */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <CheckCircle2 size={11} /> {formatDate(a.publicadoEn)}
              </span>
              {a.expiraEn && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-accent-amber)' }}>
                  <Clock size={11} /> Expira {formatDate(a.expiraEn)}
                </span>
              )}
              <span
                className="flex items-center gap-1 text-xs ml-auto"
                style={{ color: tipo.color }}
              >
                {tipo.label} <ChevronRight size={11} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AnunciosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTipo, setFilterTipo] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [redes, setRedes] = useState<Red[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm] = useState({
    titulo: '',
    contenido: '',
    tipo: 'GENERAL',
    prioridad: 'NORMAL',
    paraTodasRedes: 'true',
    redId: '',
    expiraEn: '',
    imagenUrl: '',
  })

  const loadAnuncios = () => {
    setLoading(true)
    fetch('/api/anuncios')
      .then(r => r.json())
      .then(data => {
        setAnuncios(Array.isArray(data) ? data : (data?.data ?? []))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadAnuncios() }, [])

  const openModal = () => {
    if (redes.length === 0) {
      fetch('/api/redes')
        .then(r => r.json())
        .then(data => setRedes(Array.isArray(data) ? data : (data?.data ?? [])))
        .catch(() => {})
    }
    setForm({ titulo: '', contenido: '', tipo: 'GENERAL', prioridad: 'NORMAL', paraTodasRedes: 'true', redId: '', expiraEn: '', imagenUrl: '' })
    setSaveError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      const body: Record<string, unknown> = {
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        tipo: form.tipo,
        prioridad: form.prioridad,
        paraTodasRedes: form.paraTodasRedes === 'true',
      }
      if (form.paraTodasRedes !== 'true' && form.redId) body.redId = form.redId
      if (form.expiraEn) body.expiraEn = form.expiraEn
      if (form.imagenUrl) body.imagenUrl = form.imagenUrl

      const res = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setModalOpen(false)
        loadAnuncios()
      } else {
        const err = await res.json()
        setSaveError(err.error ?? 'Error al publicar')
      }
    } catch {
      setSaveError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  // Derived
  const activos = anuncios.filter(a => a.activo)
  const filtered = filterTipo
    ? anuncios.filter(a => a.tipo === filterTipo)
    : anuncios

  const stats = {
    total:        activos.length,
    urgentes:     activos.filter(a => a.prioridad === 'URGENTE').length,
    conBanner:    activos.filter(a => a.imagenUrl).length,
    todasRedes:   activos.filter(a => a.paraTodasRedes).length,
  }

  return (
    <div className="space-y-6" style={{ animation: 'var(--animate-fade-in)' }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Anuncios
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {loading ? 'Cargando...' : `${stats.total} anuncios activos`}
          </p>
        </div>
        <Button size="sm" onClick={openModal} className="gap-1.5">
          <Plus size={15} /> Nuevo Anuncio
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Activos',     value: stats.total,       color: 'var(--color-accent-gold)',   bg: 'var(--color-accent-gold-soft)' },
          { label: 'Urgentes',    value: stats.urgentes,    color: 'var(--color-accent-red)',     bg: 'var(--color-accent-red-soft)' },
          { label: 'Con Banner',  value: stats.conBanner,   color: 'var(--color-accent-purple)',  bg: 'var(--color-accent-purple-soft)' },
          { label: 'Todas Redes', value: stats.todasRedes,  color: 'var(--color-accent-green)',   bg: 'var(--color-accent-green-soft)' },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
          >
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>
              {loading ? '—' : s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter chips ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { value: '',             label: 'Todos' },
          { value: 'GENERAL',      label: 'General' },
          { value: 'URGENTE',      label: 'Urgente' },
          { value: 'RECORDATORIO', label: 'Recordatorio' },
          { value: 'EVENTO',       label: 'Evento' },
        ].map(chip => (
          <button
            key={chip.value}
            onClick={() => setFilterTipo(chip.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: filterTipo === chip.value ? 'var(--color-accent-gold-soft)' : 'var(--color-bg-surface)',
              color: filterTipo === chip.value ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
              border: `1px solid ${filterTipo === chip.value ? 'var(--color-accent-gold)' : 'var(--color-border-subtle)'}`,
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl animate-pulse"
              style={{ height: '100px', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl p-12 flex flex-col items-center gap-3 text-center"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-bg-elevated)' }}
          >
            <Megaphone size={22} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>No hay anuncios</p>
          <button onClick={openModal} className="text-xs underline" style={{ color: 'var(--color-accent-gold)' }}>
            Publicar el primero
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => <AnuncioCard key={a.id} a={a} />)}
        </div>
      )}

      {/* ── Modal ── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Anuncio">
        <div className="space-y-4">

          {/* Banner image upload */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Banner (opcional)
            </label>
            <ImageUploadZone
              value={form.imagenUrl}
              onChange={url => setForm(f => ({ ...f, imagenUrl: url }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Título *</label>
            <Input
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Título del anuncio..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Contenido *</label>
            <textarea
              value={form.contenido}
              onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
              rows={3}
              placeholder="Escribe el contenido del anuncio..."
              className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none transition-colors"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border-default)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Tipo</label>
              <Select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                <option value="GENERAL">General</option>
                <option value="URGENTE">Urgente</option>
                <option value="RECORDATORIO">Recordatorio</option>
                <option value="EVENTO">Evento</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Prioridad</label>
              <Select value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}>
                <option value="BAJA">Baja</option>
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Destinatario</label>
            <Select value={form.paraTodasRedes} onChange={e => setForm(f => ({ ...f, paraTodasRedes: e.target.value }))}>
              <option value="true">Todas las redes</option>
              <option value="false">Red específica</option>
            </Select>
          </div>

          {form.paraTodasRedes === 'false' && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Red</label>
              <Select value={form.redId} onChange={e => setForm(f => ({ ...f, redId: e.target.value }))}>
                <option value="">Seleccionar red...</option>
                {redes.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Expira el (opcional)</label>
            <Input
              type="date"
              value={form.expiraEn}
              onChange={e => setForm(f => ({ ...f, expiraEn: e.target.value }))}
            />
          </div>

          {saveError && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ color: 'var(--color-accent-red)', background: 'var(--color-accent-red-soft)' }}>
              {saveError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.titulo.trim() || !form.contenido.trim()}
              className="flex-1 gap-2"
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Publicando...</>
                : <><Upload size={14} /> Publicar</>}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
