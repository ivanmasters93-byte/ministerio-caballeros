'use client'

import { useState, useRef } from 'react'
import { Download, Share2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

// ============================================================
// TEMPLATES
// ============================================================
const TEMPLATES = [
  {
    id: 'elegante',
    label: 'Elegante',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    titleColor: '#c9a84c',
    textColor: '#e0e0e0',
    accentColor: '#c9a84c',
  },
  {
    id: 'fuego',
    label: 'Fuego',
    bg: 'linear-gradient(135deg, #1a0000 0%, #4a0000 40%, #8b0000 100%)',
    titleColor: '#ff6b35',
    textColor: '#ffd5c2',
    accentColor: '#ff6b35',
  },
  {
    id: 'celestial',
    label: 'Celestial',
    bg: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 40%, #2d4059 100%)',
    titleColor: '#a8dadc',
    textColor: '#e0e0e0',
    accentColor: '#457b9d',
  },
  {
    id: 'dorado',
    label: 'Dorado',
    bg: 'linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 50%, #1c1c1c 100%)',
    titleColor: '#d4af37',
    textColor: '#c0c0c0',
    accentColor: '#d4af37',
  },
  {
    id: 'verde',
    label: 'Natural',
    bg: 'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 50%, #0d2b0d 100%)',
    titleColor: '#90ee90',
    textColor: '#d0e8d0',
    accentColor: '#4caf50',
  },
  {
    id: 'blanco',
    label: 'Limpio',
    bg: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #f0f0f0 100%)',
    titleColor: '#1a1a1a',
    textColor: '#333333',
    accentColor: '#c9a84c',
  },
]

export default function FlyersPage() {
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [lugar, setLugar] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [template, setTemplate] = useState(TEMPLATES[0])
  const [downloading, setDownloading] = useState(false)
  const flyerRef = useRef<HTMLDivElement>(null)

  const descargar = async () => {
    if (!flyerRef.current) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(flyerRef.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `flyer-${titulo || 'gedeones'}.png`
      link.href = dataUrl
      link.click()
    } catch {
      // fallback: tell user to screenshot
      alert('Error al descargar. Toma un screenshot de la vista previa.')
    } finally {
      setDownloading(false)
    }
  }

  const compartirWhatsApp = () => {
    const msg = [titulo, subtitulo, fecha && `Fecha: ${fecha}`, hora && `Hora: ${hora}`, lugar && `Lugar: ${lugar}`, descripcion]
      .filter(Boolean).join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(msg + '\n\nGEDEONES GP - Ministerio de Caballeros')}`, '_blank')
  }

  const isDark = template.id !== 'blanco'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Crear Flyer</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Diseña y descarga en segundos. Sin cuenta, sin registro.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-5">
          {/* Templates */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Estilo</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t)}
                  className="rounded-xl p-1 transition-all"
                  style={{
                    border: template.id === t.id ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
                  }}
                >
                  <div
                    className="w-full aspect-square rounded-lg"
                    style={{ background: t.bg }}
                  />
                  <p className="text-[10px] text-center mt-1" style={{ color: template.id === t.id ? 'var(--color-accent-gold)' : 'var(--color-text-muted)' }}>{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <Field label="Titulo *" value={titulo} onChange={setTitulo} placeholder="Retiro Espiritual 2026" />
          <Field label="Subtitulo" value={subtitulo} onChange={setSubtitulo} placeholder="Reconocidos en el Reino del Espiritu" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha" value={fecha} onChange={setFecha} placeholder="Sabado 19 de Abril" />
            <Field label="Hora" value={hora} onChange={setHora} placeholder="7:00 PM" />
          </div>
          <Field label="Lugar" value={lugar} onChange={setLugar} placeholder="Templo Central, Colon" />
          <Field label="Descripcion" value={descripcion} onChange={setDescripcion} placeholder="Un encuentro con Dios..." multiline />

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={descargar} disabled={downloading || !titulo} className="flex-1 flex items-center justify-center gap-2 py-3">
              <Download size={16} />
              {downloading ? 'Generando...' : 'Descargar PNG'}
            </Button>
            <Button variant="outline" onClick={compartirWhatsApp} disabled={!titulo} className="flex items-center gap-2">
              <Share2 size={16} /> WhatsApp
            </Button>
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Eye size={14} style={{ color: 'var(--color-text-muted)' }} />
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Vista Previa</label>
          </div>

          {/* Flyer canvas */}
          <div
            ref={flyerRef}
            className="w-full aspect-square rounded-xl overflow-hidden relative"
            style={{ background: template.bg, maxWidth: 540 }}
          >
            {/* Logo watermark */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.04, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src="/logo-gedeones.jpg" alt="" width={400} height={400} style={{ borderRadius: '50%' }} />
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10%' }}>
              {/* Top: Branding */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Image src="/logo-gedeones.jpg" alt="GEDEONES GP" width={48} height={48} style={{ borderRadius: 10 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: template.accentColor, letterSpacing: 2, textTransform: 'uppercase' }}>GEDEONES GP</p>
                  <p style={{ fontSize: 10, color: template.textColor, opacity: 0.6, letterSpacing: 1 }}>MINISTERIO DE CABALLEROS</p>
                </div>
              </div>

              {/* Center: Title */}
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                <h1 style={{
                  fontSize: titulo.length > 20 ? 36 : 48,
                  fontWeight: 900,
                  color: template.titleColor,
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                }}>
                  {titulo || 'Tu Evento'}
                </h1>
                {subtitulo && (
                  <p style={{ fontSize: 18, color: template.textColor, opacity: 0.8, fontStyle: 'italic' }}>
                    {subtitulo}
                  </p>
                )}
                {descripcion && (
                  <p style={{ fontSize: 14, color: template.textColor, opacity: 0.6, maxWidth: '80%', margin: '0 auto', lineHeight: 1.5 }}>
                    {descripcion}
                  </p>
                )}
              </div>

              {/* Bottom: Details */}
              <div style={{ textAlign: 'center' }}>
                {(fecha || hora) && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ width: 40, height: 2, background: template.accentColor, margin: '0 auto 12px', opacity: 0.5 }} />
                    <p style={{ fontSize: 20, fontWeight: 700, color: template.titleColor }}>
                      {[fecha, hora].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                )}
                {lugar && (
                  <p style={{ fontSize: 14, color: template.textColor, opacity: 0.7 }}>
                    {lugar}
                  </p>
                )}
                <div style={{ width: 40, height: 2, background: template.accentColor, margin: '16px auto 0', opacity: 0.3 }} />
                <p style={{ fontSize: 10, color: isDark ? '#888' : '#999', marginTop: 8, letterSpacing: 2 }}>
                  GEDEONES GP · Ministerio de Caballeros · Colon, Panama
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean
}) {
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <Tag
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 2 : undefined}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
        }}
      />
    </div>
  )
}
