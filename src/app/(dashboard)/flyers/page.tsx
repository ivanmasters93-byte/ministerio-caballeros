'use client'

import { useState, useRef } from 'react'
import { Download, Share2, Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

// ============================================================
// BACKGROUND IMAGES — Free from Unsplash (no API key needed)
// ============================================================
const FONDOS = [
  { id: 'cielo', label: 'Cielo', url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1080&q=80', dark: true },
  { id: 'montanas', label: 'Montañas', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&q=80', dark: true },
  { id: 'atardecer', label: 'Atardecer', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1080&q=80', dark: true },
  { id: 'fuego', label: 'Fuego', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1080&q=80', dark: true },
  { id: 'bosque', label: 'Bosque', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&q=80', dark: true },
  { id: 'estrellas', label: 'Estrellas', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1080&q=80', dark: true },
  { id: 'oceano', label: 'Oceano', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80', dark: true },
  { id: 'iglesia', label: 'Iglesia', url: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1080&q=80', dark: true },
  { id: 'cruz', label: 'Cruz', url: 'https://images.unsplash.com/photo-1445445290350-18a3b86e0b5a?w=1080&q=80', dark: true },
  { id: 'dorado', label: 'Dorado', url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1080&q=80', dark: true },
  { id: 'negro', label: 'Negro', url: '', dark: true },
  { id: 'blanco', label: 'Blanco', url: '', dark: false },
]

export default function FlyersPage() {
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [lugar, setLugar] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fondo, setFondo] = useState(FONDOS[0])
  const [customBgUrl, setCustomBgUrl] = useState('')
  const [showBgSearch, setShowBgSearch] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const flyerRef = useRef<HTMLDivElement>(null)

  const bgUrl = customBgUrl || fondo.url
  const isDark = customBgUrl ? true : fondo.dark
  const titleColor = isDark ? '#ffffff' : '#1a1a1a'
  const textColor = isDark ? 'rgba(255,255,255,0.85)' : '#333333'
  const mutedColor = isDark ? 'rgba(255,255,255,0.5)' : '#888888'
  const accentColor = '#c9a84c'

  const descargar = async () => {
    if (!flyerRef.current) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(flyerRef.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
        cacheBust: true,
      })
      const link = document.createElement('a')
      link.download = `flyer-${titulo || 'gedeones'}.png`
      link.href = dataUrl
      link.click()
    } catch {
      alert('Error al descargar. Toma un screenshot de la vista previa.')
    } finally {
      setDownloading(false)
    }
  }

  const compartirWhatsApp = () => {
    const msg = [titulo, subtitulo, fecha && `📅 ${fecha}`, hora && `🕐 ${hora}`, lugar && `📍 ${lugar}`, descripcion]
      .filter(Boolean).join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(msg + '\n\n✝️ GEDEONES GP - Ministerio de Caballeros')}`, '_blank')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Crear Flyer</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Elige un fondo, escribe los datos y descarga. Listo para compartir.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-5">
          {/* Backgrounds */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
              Fondo
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {FONDOS.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setFondo(f); setCustomBgUrl('') }}
                  className="rounded-lg overflow-hidden transition-all"
                  style={{
                    border: fondo.id === f.id && !customBgUrl ? `2px solid ${accentColor}` : '2px solid transparent',
                    aspectRatio: '1',
                  }}
                >
                  {f.url ? (
                    <img src={f.url.replace('w=1080', 'w=120')} alt={f.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ background: f.dark ? '#111' : '#f5f5f5' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Custom URL */}
            <button
              onClick={() => setShowBgSearch(!showBgSearch)}
              className="flex items-center gap-1.5 mt-2 text-xs"
              style={{ color: 'var(--color-accent-gold)' }}
            >
              <Search size={12} /> {showBgSearch ? 'Cerrar' : 'Usar otra imagen de fondo'}
            </button>
            {showBgSearch && (
              <div className="mt-2 space-y-2">
                <input
                  type="url"
                  value={customBgUrl}
                  onChange={e => setCustomBgUrl(e.target.value)}
                  placeholder="Pega URL de una imagen (Google, Pinterest, etc)"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
                />
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  Busca en Google &ldquo;paisaje iglesia fondo&rdquo; → click derecho → &ldquo;Copiar direccion de imagen&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Fields */}
          <Field label="Titulo *" value={titulo} onChange={setTitulo} placeholder="Retiro Espiritual 2026" />
          <Field label="Subtitulo" value={subtitulo} onChange={setSubtitulo} placeholder="Reconocidos en el Reino del Espiritu" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha" value={fecha} onChange={setFecha} placeholder="Sabado 19 Abril" />
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
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Vista Previa</span>
          </div>

          <div
            ref={flyerRef}
            className="w-full aspect-square rounded-xl overflow-hidden relative"
            style={{ maxWidth: 540, background: bgUrl ? '#000' : (fondo.dark ? '#111' : '#f5f5f5') }}
          >
            {/* Background image */}
            {bgUrl && (
              <img
                src={bgUrl}
                alt=""
                crossOrigin="anonymous"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            {/* Dark overlay for readability */}
            {bgUrl && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
            )}

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8%' }}>
              {/* Top: Logo + branding */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Image src="/logo-gedeones.jpg" alt="" width={44} height={44} style={{ borderRadius: 10 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: accentColor, letterSpacing: 3, textTransform: 'uppercase' }}>GEDEONES GP</p>
                  <p style={{ fontSize: 9, color: mutedColor, letterSpacing: 1.5, textTransform: 'uppercase' }}>Ministerio de Caballeros</p>
                </div>
              </div>

              {/* Center: Main content */}
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, padding: '0 5%' }}>
                {/* Decorative line */}
                <div style={{ width: 50, height: 2, background: accentColor, margin: '0 auto', opacity: 0.6 }} />

                <h1 style={{
                  fontSize: titulo.length > 25 ? 32 : titulo.length > 15 ? 40 : 50,
                  fontWeight: 900,
                  color: titleColor,
                  lineHeight: 1.05,
                  textTransform: 'uppercase',
                  letterSpacing: 3,
                  textShadow: isDark ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
                }}>
                  {titulo || 'Tu Evento'}
                </h1>

                {subtitulo && (
                  <p style={{ fontSize: 17, color: textColor, fontStyle: 'italic', opacity: 0.9, textShadow: isDark ? '0 1px 8px rgba(0,0,0,0.4)' : 'none' }}>
                    {subtitulo}
                  </p>
                )}

                {descripcion && (
                  <p style={{ fontSize: 13, color: mutedColor, maxWidth: '85%', margin: '0 auto', lineHeight: 1.6 }}>
                    {descripcion}
                  </p>
                )}
              </div>

              {/* Bottom: Date, time, place */}
              <div style={{ textAlign: 'center' }}>
                {(fecha || hora) && (
                  <>
                    <div style={{ width: 40, height: 2, background: accentColor, margin: '0 auto 10px', opacity: 0.5 }} />
                    <p style={{ fontSize: 22, fontWeight: 800, color: titleColor, letterSpacing: 1, textShadow: isDark ? '0 1px 10px rgba(0,0,0,0.5)' : 'none' }}>
                      {[fecha, hora].filter(Boolean).join(' · ')}
                    </p>
                  </>
                )}
                {lugar && (
                  <p style={{ fontSize: 13, color: textColor, opacity: 0.8, marginTop: 4 }}>{lugar}</p>
                )}
                <div style={{ width: 40, height: 1, background: accentColor, margin: '14px auto 0', opacity: 0.3 }} />
                <p style={{ fontSize: 9, color: mutedColor, marginTop: 6, letterSpacing: 2 }}>
                  GEDEONES GP · Colon, Panama
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
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 2 : undefined}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
      />
    </div>
  )
}
