'use client'

import { useState, useRef } from 'react'
import { Download, Share2, Eye, Search, Sparkles, RefreshCw, ExternalLink, Wand2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

// ============================================================
// PLANTILLAS REALES — Guardadas en Canva, listas para editar
// Generadas por IA de Canva para GEDEONES GP
// ============================================================
const PLANTILLAS_CANVA = [
  {
    id: 'ayuno',
    categoria: '🔥 Ayuno y Oración',
    titulo: 'Ayuno y Oración',
    thumbnail: 'https://design.canva.ai/DGrgB1xHUTKdSrb',
    edit_url: 'https://www.canva.com/d/3WMthCatzf_mPz8',
    opciones: [
      { thumbnail: 'https://design.canva.ai/DGrgB1xHUTKdSrb', url: 'https://www.canva.com/d/3WMthCatzf_mPz8' },
      { thumbnail: 'https://design.canva.ai/Nzlvr1G19TiUkwe', url: 'https://www.canva.com/d/5f-xVU4cIb_TfAN' },
      { thumbnail: 'https://design.canva.ai/r-k4OCgOzXhUxpC', url: 'https://www.canva.com/d/_7MwTSYIRiSgjgf' },
      { thumbnail: 'https://design.canva.ai/FVl8uqao54bhZEY', url: 'https://www.canva.com/d/f90wkdlbPtd_D8A' },
    ],
  },
  {
    id: 'revival',
    categoria: '⚡ Revival / Avivamiento',
    titulo: 'Revival / Avivamiento',
    thumbnail: 'https://design.canva.ai/-vFUqmxVO-tU6ni',
    edit_url: 'https://www.canva.com/d/3hBkU-GnxtvcSaL',
    opciones: [
      { thumbnail: 'https://design.canva.ai/-vFUqmxVO-tU6ni', url: 'https://www.canva.com/d/3hBkU-GnxtvcSaL' },
      { thumbnail: 'https://design.canva.ai/drILi8uZjsP8Ibo', url: 'https://www.canva.com/d/mPdUB-c6642LV5V' },
      { thumbnail: 'https://design.canva.ai/zuM-uVcXfFpM2xP', url: 'https://www.canva.com/d/ktIlC2hardaYhnA' },
      { thumbnail: 'https://design.canva.ai/5SKFINqGxjJ5NHJ', url: 'https://www.canva.com/d/eAo_jmY6xqDHewC' },
    ],
  },
  {
    id: 'culto',
    categoria: '✝️ Culto Especial',
    titulo: 'Culto / Domingo Especial',
    thumbnail: 'https://design.canva.ai/MmJ6VezP3JiG17S',
    edit_url: 'https://www.canva.com/d/sMlqJctp3701s_e',
    opciones: [
      { thumbnail: 'https://design.canva.ai/MmJ6VezP3JiG17S', url: 'https://www.canva.com/d/sMlqJctp3701s_e' },
      { thumbnail: 'https://design.canva.ai/ddaXU9WzwQ-pYS7', url: 'https://www.canva.com/d/8PRBjI7msJRByEo' },
      { thumbnail: 'https://design.canva.ai/cZE5F7xx1imH4b2', url: 'https://www.canva.com/d/fQ_nFQ4cqADAOUn' },
      { thumbnail: 'https://design.canva.ai/6nTTZ-5gQU2p7gW', url: 'https://www.canva.com/d/C4n4j8MjG5j0FaV' },
    ],
  },
  {
    id: 'transporte',
    categoria: '🚌 Transporte Gratis',
    titulo: 'Transporte / Bus Gratis',
    thumbnail: 'https://design.canva.ai/ytvvZJ26brUaNMF',
    edit_url: 'https://www.canva.com/d/JDwHTfoiZU-XJLh',
    opciones: [
      { thumbnail: 'https://design.canva.ai/ytvvZJ26brUaNMF', url: 'https://www.canva.com/d/JDwHTfoiZU-XJLh' },
      { thumbnail: 'https://design.canva.ai/SlZFSWgQei7n-je', url: 'https://www.canva.com/d/eaIBK7YaaETm3BF' },
      { thumbnail: 'https://design.canva.ai/gpuE7no2S0ML8jJ', url: 'https://www.canva.com/d/xvH2nTJpym_6BLy' },
      { thumbnail: 'https://design.canva.ai/S1mpPJbiPT7Ry9O', url: 'https://www.canva.com/d/ePrDVGw3FaYV9iw' },
    ],
  },
  {
    id: 'pascua',
    categoria: '☀️ Pascua / Resurrección',
    titulo: 'Pascua / Él Vive',
    thumbnail: 'https://design.canva.ai/nKEXlhxhaWbQm_8',
    edit_url: 'https://www.canva.com/d/0YsLxuj3WDPtO1n',
    opciones: [
      { thumbnail: 'https://design.canva.ai/nKEXlhxhaWbQm_8', url: 'https://www.canva.com/d/0YsLxuj3WDPtO1n' },
      { thumbnail: 'https://design.canva.ai/p0wgle2ZBrQAQ4c', url: 'https://www.canva.com/d/RrMvc1FNkGupRKo' },
      { thumbnail: 'https://design.canva.ai/Q65C9z5EsXm3k9o', url: 'https://www.canva.com/d/rpI9se7bUaBBtD2' },
      { thumbnail: 'https://design.canva.ai/X4MwrwacU1rl1si', url: 'https://www.canva.com/d/EIcYlBeQV66E_KL' },
    ],
  },
  {
    id: 'retiro',
    categoria: '⛺ Retiro Espiritual',
    titulo: 'Retiro Espiritual',
    thumbnail: 'https://design.canva.ai/y3ld3tSNE9t7zq7',
    edit_url: 'https://www.canva.com/d/vcBBUm47K5ajUhY',
    opciones: [
      { thumbnail: 'https://design.canva.ai/y3ld3tSNE9t7zq7', url: 'https://www.canva.com/d/vcBBUm47K5ajUhY' },
      { thumbnail: 'https://design.canva.ai/9fZU56SrUEByyrI', url: 'https://www.canva.com/d/lIYf3n_w6yXoqi7' },
      { thumbnail: 'https://design.canva.ai/8waAtPX11K8eMNp', url: 'https://www.canva.com/d/jM5BvwsHzxz9KqY' },
      { thumbnail: 'https://design.canva.ai/m28_-TZuq9ZoEzd', url: 'https://www.canva.com/d/NrOas_UrR5oiLIB' },
    ],
  },
]

// ============================================================
// FONDOS — Unsplash (tab Plantilla)
// ============================================================
const FONDOS = [
  { id: 'cielo',     label: 'Cielo',     url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1080&q=80', dark: true },
  { id: 'montanas',  label: 'Montañas',  url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&q=80', dark: true },
  { id: 'atardecer', label: 'Atardecer', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1080&q=80', dark: true },
  { id: 'fuego',     label: 'Fuego',     url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1080&q=80', dark: true },
  { id: 'bosque',    label: 'Bosque',    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&q=80', dark: true },
  { id: 'estrellas', label: 'Estrellas', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1080&q=80', dark: true },
  { id: 'oceano',    label: 'Océano',    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80', dark: true },
  { id: 'iglesia',   label: 'Iglesia',   url: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1080&q=80', dark: true },
  { id: 'cruz',      label: 'Cruz',      url: 'https://images.unsplash.com/photo-1445445290350-18a3b86e0b5a?w=1080&q=80', dark: true },
  { id: 'dorado',    label: 'Dorado',    url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1080&q=80', dark: true },
  { id: 'negro',     label: 'Negro',     url: '', dark: true },
  { id: 'blanco',    label: 'Blanco',    url: '', dark: false },
]

const CATEGORIAS_IA = [
  { id: 'ayuno',      label: '🔥 Ayuno y Oración' },
  { id: 'culto',      label: '✝️ Culto Especial'   },
  { id: 'revival',    label: '⚡ Revival'           },
  { id: 'retiro',     label: '⛺ Retiro'            },
  { id: 'alabanza',   label: '🎵 Alabanza'          },
  { id: 'transporte', label: '🚌 Transporte'        },
  { id: 'general',    label: '📢 General'           },
]

interface GeneratedDesign {
  candidate_id: string
  url: string
  thumbnail: { url: string }
}

// ============================================================
// FIELD
// ============================================================
function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; multiline?: boolean
}) {
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
        style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <Tag
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 2 : undefined}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
      />
    </div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function FlyersPage() {
  const [tab, setTab] = useState<'canva' | 'plantilla' | 'ia'>('canva')

  // --- Galería Canva state ---
  const [selectedPlantilla, setSelectedPlantilla] = useState(PLANTILLAS_CANVA[0])
  const [selectedOpcion, setSelectedOpcion] = useState(0)

  // --- Plantilla state ---
  const [titulo,       setTitulo]       = useState('')
  const [subtitulo,    setSubtitulo]    = useState('')
  const [fecha,        setFecha]        = useState('')
  const [hora,         setHora]         = useState('')
  const [lugar,        setLugar]        = useState('')
  const [descripcion,  setDescripcion]  = useState('')
  const [fondo,        setFondo]        = useState(FONDOS[0])
  const [customBgUrl,  setCustomBgUrl]  = useState('')
  const [showBgSearch, setShowBgSearch] = useState(false)
  const [downloading,  setDownloading]  = useState(false)
  const flyerRef = useRef<HTMLDivElement>(null)

  // --- Canva IA state ---
  const [iaTitulo,      setIaTitulo]      = useState('')
  const [iaSubtitulo,   setIaSubtitulo]   = useState('')
  const [iaFecha,       setIaFecha]       = useState('')
  const [iaHora,        setIaHora]        = useState('')
  const [iaLugar,       setIaLugar]       = useState('')
  const [iaDescripcion, setIaDescripcion] = useState('')
  const [iaCategoria,   setIaCategoria]   = useState('culto')
  const [iaGenerating,  setIaGenerating]  = useState(false)
  const [iaDesigns,     setIaDesigns]     = useState<GeneratedDesign[]>([])
  const [iaSelected,    setIaSelected]    = useState<GeneratedDesign | null>(null)
  const [iaError,       setIaError]       = useState<string | null>(null)
  const [iaSetupNeeded, setIaSetupNeeded] = useState(false)

  // ---- Plantilla helpers ----
  const bgUrl      = customBgUrl || fondo.url
  const isDark     = customBgUrl ? true : fondo.dark
  const titleColor = isDark ? '#ffffff' : '#1a1a1a'
  const textColor  = isDark ? 'rgba(255,255,255,0.85)' : '#333333'
  const mutedColor = isDark ? 'rgba(255,255,255,0.5)'  : '#888888'
  const accentColor = '#c9a84c'

  const descargar = async () => {
    if (!flyerRef.current) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(flyerRef.current, { width: 1080, height: 1080, pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.download = `flyer-${titulo || 'gedeones'}.png`
      a.href = dataUrl
      a.click()
    } catch { alert('Error al descargar. Toma un screenshot.') }
    finally { setDownloading(false) }
  }

  const compartirWA = (t: string, s: string, f: string, h: string, l: string, d: string) => {
    const msg = [t, s, f && `📅 ${f}`, h && `🕐 ${h}`, l && `📍 ${l}`, d]
      .filter(Boolean).join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(msg + '\n\n✝️ GEDEONES GP - Ministerio de Caballeros')}`, '_blank')
  }

  // ---- IA Canva ----
  const generarConIA = async () => {
    if (!iaTitulo.trim()) return
    setIaGenerating(true); setIaError(null); setIaDesigns([]); setIaSelected(null); setIaSetupNeeded(false)
    try {
      const res  = await fetch('/api/flyers/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: iaTitulo, subtitulo: iaSubtitulo, fechaHora: [iaFecha, iaHora].filter(Boolean).join(' · '), lugar: iaLugar, descripcion: iaDescripcion, categoria: iaCategoria }),
      })
      const data = await res.json()
      if (data.setup_required) { setIaSetupNeeded(true); return }
      if (!data.success)       { setIaError(data.error ?? 'Error generando'); return }
      setIaDesigns(data.designs ?? [])
    } catch (e) { setIaError(e instanceof Error ? e.message : 'Error') }
    finally { setIaGenerating(false) }
  }

  // ============================================================
  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Flyers</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Crea y comparte flyers para el ministerio</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl p-1 gap-1 w-fit" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)' }}>
        {[
          { id: 'canva'    as const, label: '✨ Canva IA' },
          { id: 'plantilla'as const, label: '🎨 Plantilla' },
          { id: 'ia'       as const, label: '🤖 Generar Nuevo' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: tab === t.id ? 'var(--color-accent-gold)' : 'transparent', color: tab === t.id ? '#0c0e14' : 'var(--color-text-muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ======================================================
          TAB: CANVA IA — Galería de plantillas reales
         ====================================================== */}
      {tab === 'canva' && (
        <div className="space-y-5">

          {/* Info banner */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <Sparkles size={16} style={{ color: 'var(--color-accent-gold)', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Plantillas profesionales generadas con IA y guardadas en Canva. Haz clic en cualquiera para editarla y descargarla.
            </p>
          </div>

          {/* Category row */}
          <div className="flex gap-2 flex-wrap">
            {PLANTILLAS_CANVA.map(p => (
              <button key={p.id} onClick={() => { setSelectedPlantilla(p); setSelectedOpcion(0) }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: selectedPlantilla.id === p.id ? 'var(--color-accent-gold)' : 'var(--color-bg-elevated)',
                  color:      selectedPlantilla.id === p.id ? '#0c0e14' : 'var(--color-text-muted)',
                  border: `1px solid ${selectedPlantilla.id === p.id ? 'var(--color-accent-gold)' : 'var(--color-border-subtle)'}`,
                }}>
                {p.categoria}
              </button>
            ))}
          </div>

          {/* Main display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: variant strip */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                4 variantes — {selectedPlantilla.titulo}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {selectedPlantilla.opciones.map((op, i) => (
                  <button key={i} onClick={() => setSelectedOpcion(i)}
                    className="rounded-xl overflow-hidden transition-all group"
                    style={{ border: `2px solid ${selectedOpcion === i ? 'var(--color-accent-gold)' : 'var(--color-border-subtle)'}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={op.thumbnail} alt={`Variante ${i + 1}`}
                      className="w-full block" style={{ aspectRatio: '1/1', objectFit: 'cover' }} />
                    <div className="flex items-center justify-between px-2.5 py-1.5"
                      style={{ background: 'var(--color-bg-elevated)' }}>
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        Opción {i + 1}
                      </span>
                      {selectedOpcion === i && (
                        <span style={{ color: 'var(--color-accent-gold)', fontSize: 10, fontWeight: 700 }}>✓ Seleccionada</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: preview + actions */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Vista previa</p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border-subtle)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPlantilla.opciones[selectedOpcion].thumbnail}
                  alt={selectedPlantilla.titulo}
                  className="w-full block"
                  style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                />
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <a href={selectedPlantilla.opciones[selectedOpcion].url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full flex items-center justify-center gap-2 py-3">
                    <ExternalLink size={16} />
                    Abrir en Canva y Editar
                  </Button>
                </a>
                <button
                  onClick={() => compartirWA(selectedPlantilla.titulo, 'GEDEONES GP', '', '', 'Colón, Panamá', '')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                  style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)', color: '#4ade80' }}>
                  <Share2 size={15} /> Compartir evento por WhatsApp
                </button>
              </div>

              {/* Tip */}
              <div className="rounded-xl p-3" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Cómo usar</p>
                <ol className="text-xs space-y-0.5 list-decimal list-inside" style={{ color: 'var(--color-text-muted)' }}>
                  <li>Haz clic en <strong style={{ color: 'var(--color-text-primary)' }}>Abrir en Canva</strong></li>
                  <li>Cambia el texto del evento (título, fecha, lugar)</li>
                  <li>Descarga como PNG o JPG</li>
                  <li>Comparte en el grupo de WhatsApp</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          TAB: PLANTILLA — Editor local con fondos
         ====================================================== */}
      {tab === 'plantilla' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">

            {/* Fondos */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Fondo</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {FONDOS.map(f => (
                  <button key={f.id} onClick={() => { setFondo(f); setCustomBgUrl('') }}
                    className="rounded-lg overflow-hidden transition-all"
                    style={{ border: fondo.id === f.id && !customBgUrl ? `2px solid ${accentColor}` : '2px solid transparent', aspectRatio: '1' }}>
                    {f.url
                      ? <img src={f.url.replace('w=1080', 'w=120')} alt={f.label} className="w-full h-full object-cover" />
                      : <div className="w-full h-full" style={{ background: f.dark ? '#111' : '#f5f5f5' }} />}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowBgSearch(!showBgSearch)}
                className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: 'var(--color-accent-gold)' }}>
                <Search size={12} /> {showBgSearch ? 'Cerrar' : 'Usar otra imagen'}
              </button>
              {showBgSearch && (
                <div className="mt-2 space-y-1">
                  <input type="url" value={customBgUrl} onChange={e => setCustomBgUrl(e.target.value)}
                    placeholder="Pega URL de imagen"
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }} />
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Google → busca imagen → click derecho → Copiar dirección de imagen</p>
                </div>
              )}
            </div>

            <Field label="Título *"      value={titulo}      onChange={setTitulo}      placeholder="Retiro Espiritual 2026" />
            <Field label="Subtítulo"     value={subtitulo}   onChange={setSubtitulo}   placeholder="Reconocidos en el Reino" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha" value={fecha} onChange={setFecha} placeholder="Sábado 19 Abril" />
              <Field label="Hora"  value={hora}  onChange={setHora}  placeholder="7:00 PM" />
            </div>
            <Field label="Lugar"       value={lugar}       onChange={setLugar}       placeholder="Templo Central, Colón" />
            <Field label="Descripción" value={descripcion} onChange={setDescripcion} placeholder="Un encuentro con Dios..." multiline />

            <div className="flex gap-3">
              <Button onClick={descargar} disabled={downloading || !titulo} className="flex-1 flex items-center justify-center gap-2 py-3">
                <Download size={16} /> {downloading ? 'Generando...' : 'Descargar PNG'}
              </Button>
              <Button variant="outline" onClick={() => compartirWA(titulo, subtitulo, fecha, hora, lugar, descripcion)} disabled={!titulo} className="flex items-center gap-2">
                <Share2 size={16} /> WhatsApp
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Vista Previa</span>
            </div>
            <div ref={flyerRef} className="w-full aspect-square rounded-xl overflow-hidden relative"
              style={{ maxWidth: 540, background: bgUrl ? '#000' : (fondo.dark ? '#111' : '#f5f5f5') }}>
              {bgUrl && <img src={bgUrl} alt="" crossOrigin="anonymous" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              {bgUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />}
              <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Image src="/logo-gedeones.jpg" alt="" width={44} height={44} style={{ borderRadius: 10 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: accentColor, letterSpacing: 3, textTransform: 'uppercase' }}>GEDEONES GP</p>
                    <p style={{ fontSize: 9, color: mutedColor, letterSpacing: 1.5, textTransform: 'uppercase' }}>Ministerio de Caballeros</p>
                  </div>
                </div>
                <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, padding: '0 5%' }}>
                  <div style={{ width: 50, height: 2, background: accentColor, margin: '0 auto', opacity: 0.6 }} />
                  <h1 style={{ fontSize: titulo.length > 25 ? 32 : titulo.length > 15 ? 40 : 50, fontWeight: 900, color: titleColor, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: 3, textShadow: isDark ? '0 2px 20px rgba(0,0,0,0.5)' : 'none' }}>
                    {titulo || 'Tu Evento'}
                  </h1>
                  {subtitulo && <p style={{ fontSize: 17, color: textColor, fontStyle: 'italic', opacity: 0.9 }}>{subtitulo}</p>}
                  {descripcion && <p style={{ fontSize: 13, color: mutedColor, maxWidth: '85%', margin: '0 auto', lineHeight: 1.6 }}>{descripcion}</p>}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {(fecha || hora) && (
                    <>
                      <div style={{ width: 40, height: 2, background: accentColor, margin: '0 auto 10px', opacity: 0.5 }} />
                      <p style={{ fontSize: 22, fontWeight: 800, color: titleColor, letterSpacing: 1 }}>{[fecha, hora].filter(Boolean).join(' · ')}</p>
                    </>
                  )}
                  {lugar && <p style={{ fontSize: 13, color: textColor, opacity: 0.8, marginTop: 4 }}>{lugar}</p>}
                  <div style={{ width: 40, height: 1, background: accentColor, margin: '14px auto 0', opacity: 0.3 }} />
                  <p style={{ fontSize: 9, color: mutedColor, marginTop: 6, letterSpacing: 2 }}>GEDEONES GP · Colón, Panamá</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          TAB: GENERAR NUEVO — IA bajo demanda
         ====================================================== */}
      {tab === 'ia' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Tipo de Evento</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS_IA.map(c => (
                  <button key={c.id} onClick={() => setIaCategoria(c.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{ background: iaCategoria === c.id ? 'var(--color-accent-gold)' : 'var(--color-bg-elevated)', color: iaCategoria === c.id ? '#0c0e14' : 'var(--color-text-muted)', border: `1px solid ${iaCategoria === c.id ? 'var(--color-accent-gold)' : 'var(--color-border-subtle)'}` }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Título *"    value={iaTitulo}      onChange={setIaTitulo}      placeholder="AYUNO Y ORACIÓN · 7 DÍAS" />
            <Field label="Subtítulo"   value={iaSubtitulo}   onChange={setIaSubtitulo}   placeholder="Ministerio de Caballeros" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha" value={iaFecha} onChange={setIaFecha} placeholder="Domingo 20 Abril" />
              <Field label="Hora"  value={iaHora}  onChange={setIaHora}  placeholder="10:00 AM" />
            </div>
            <Field label="Lugar"       value={iaLugar}       onChange={setIaLugar}       placeholder="4 Altos, Colón" />
            <Field label="Descripción" value={iaDescripcion} onChange={setIaDescripcion} placeholder="No se lo pierda..." multiline />

            <Button onClick={generarConIA} disabled={iaGenerating || !iaTitulo.trim()} className="w-full py-3 flex items-center justify-center gap-2">
              {iaGenerating ? <><RefreshCw size={16} className="animate-spin" /> Generando...</> : <><Wand2 size={16} /> Generar con IA de Canva</>}
            </Button>

            {iaSetupNeeded && (
              <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}>
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} style={{ color: 'var(--color-accent-gold)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-accent-gold)' }}>Activa tu token de Canva</p>
                </div>
                <ol className="text-xs space-y-1 list-decimal list-inside" style={{ color: 'var(--color-text-muted)' }}>
                  <li>Ve a <a href="https://www.canva.com/developers/" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--color-accent-gold)' }}>canva.com/developers</a></li>
                  <li>Genera un <strong style={{ color: 'var(--color-text-primary)' }}>Personal Access Token</strong></li>
                  <li>Agrégalo en <code className="px-1 rounded text-[10px]" style={{ background: 'var(--color-bg-elevated)' }}>.env.local</code></li>
                </ol>
                <code className="block px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--color-bg-elevated)', color: '#86efac' }}>
                  CANVA_API_TOKEN=tu_token_aqui
                </code>
              </div>
            )}
            {iaError && (
              <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400">{iaError}</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div>
            {iaGenerating && (
              <div className="flex flex-col items-center justify-center h-72 gap-4 rounded-xl"
                style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
                  <Wand2 size={22} style={{ color: 'var(--color-accent-gold)' }} className="animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Canva IA generando...</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>4 variantes profesionales</p>
                </div>
              </div>
            )}

            {!iaGenerating && iaDesigns.length === 0 && !iaSetupNeeded && (
              <div className="flex flex-col items-center justify-center h-72 gap-3 rounded-xl text-center px-8"
                style={{ background: 'var(--color-bg-elevated)', border: '1px dashed var(--color-border-subtle)' }}>
                <Sparkles size={28} style={{ color: 'var(--color-accent-gold)', opacity: 0.4 }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Los diseños aparecerán aquí</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Escribe el título, elige el tipo y haz clic en <strong style={{ color: 'var(--color-accent-gold)' }}>Generar</strong></p>
              </div>
            )}

            {iaDesigns.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Elige tu diseño</p>
                  <button onClick={generarConIA} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={11} /> Regenerar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {iaDesigns.map((d, i) => (
                    <button key={d.candidate_id} onClick={() => setIaSelected(d)}
                      className="rounded-xl overflow-hidden transition-all text-left"
                      style={{ border: `2px solid ${iaSelected?.candidate_id === d.candidate_id ? 'var(--color-accent-gold)' : 'var(--color-border-subtle)'}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={d.thumbnail.url} alt={`Diseño ${i + 1}`} className="w-full block" style={{ aspectRatio: '1/1', objectFit: 'cover' }} />
                      <div className="flex items-center justify-between px-2.5 py-1.5" style={{ background: 'var(--color-bg-elevated)' }}>
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Opción {i + 1}</span>
                        {iaSelected?.candidate_id === d.candidate_id && <span style={{ color: 'var(--color-accent-gold)', fontSize: 10, fontWeight: 700 }}>✓</span>}
                      </div>
                    </button>
                  ))}
                </div>
                {iaSelected && (
                  <div className="flex gap-2">
                    <a href={iaSelected.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full flex items-center justify-center gap-2">
                        <ExternalLink size={14} /> Abrir en Canva
                      </Button>
                    </a>
                    <Button variant="outline" onClick={() => compartirWA(iaTitulo, iaSubtitulo, iaFecha, iaHora, iaLugar, iaDescripcion)} className="flex items-center gap-1.5">
                      <Share2 size={14} /> WA
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
