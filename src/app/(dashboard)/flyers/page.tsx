'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FlyerPreview } from '@/components/flyers/FlyerPreview'
import { FLYER_TEMPLATES, FlyerTemplate, getCategoriaLabel } from '@/lib/flyers/templates'
import { Palette, Plus, Smartphone, Trash2 } from 'lucide-react'

// Dynamic import of the editor to avoid SSR issues
const FlyerEditor = dynamic(
  () => import('@/components/flyers/FlyerEditor').then((m) => ({ default: m.FlyerEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--color-bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-accent-gold)', borderTopColor: 'transparent' }}
          />
          <p style={{ color: 'var(--color-text-muted)' }}>Iniciando editor...</p>
        </div>
      </div>
    ),
  }
)

interface SavedFlyer {
  id: string
  nombre: string
  templateId: string
  creadoEn: string
  thumbnail?: string
}

const CATEGORIAS = ['todas', 'reunion', 'especial', 'evento', 'devocional', 'anuncio', 'social'] as const
type CatFilter = typeof CATEGORIAS[number]

export default function FlyersPage() {
  const [activeTemplate, setActiveTemplate] = useState<FlyerTemplate | null>(null)
  const [catFilter, setCatFilter] = useState<CatFilter>('todas')
  const [savedFlyers, setSavedFlyers] = useState<SavedFlyer[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile
    setIsMobile(window.innerWidth < 768)

    // Load saved flyers from localStorage
    try {
      const raw = localStorage.getItem('ministerio-flyers')
      if (raw) setSavedFlyers(JSON.parse(raw) as SavedFlyer[])
    } catch {
      // ignore
    }
  }, [])

  const filtered = catFilter === 'todas'
    ? FLYER_TEMPLATES
    : FLYER_TEMPLATES.filter((t) => t.categoria === catFilter)

  const handleOpenTemplate = (tmpl: FlyerTemplate) => {
    if (isMobile) return
    setActiveTemplate(tmpl)
  }

  const handleCloseEditor = () => {
    setActiveTemplate(null)
  }

  const handleDeleteSaved = (id: string) => {
    const updated = savedFlyers.filter((f) => f.id !== id)
    setSavedFlyers(updated)
    localStorage.setItem('ministerio-flyers', JSON.stringify(updated))
  }

  return (
    <>
      {/* Editor modal */}
      {activeTemplate && (
        <FlyerEditor
          template={activeTemplate}
          onClose={handleCloseEditor}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Palette size={22} style={{ color: 'var(--color-accent-gold)' }} />
              <h2
                className="text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
              >
                Editor de Flyers
              </h2>
            </div>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Crea y descarga diseños para anuncios y eventos del ministerio
            </p>
          </div>
        </div>

        {/* Mobile warning */}
        {isMobile && (
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <Smartphone size={20} style={{ color: 'var(--color-accent-gold)' }} />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Editor optimizado para escritorio
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Para una mejor experiencia de edición, usa el editor desde una computadora o tablet.
                    Puedes ver las plantillas disponibles desde aquí.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                background: catFilter === cat ? 'var(--color-accent-gold)' : 'var(--color-bg-elevated)',
                color: catFilter === cat ? '#0c0e14' : 'var(--color-text-secondary)',
                border: catFilter === cat ? 'none' : '1px solid var(--color-border-subtle)',
              }}
            >
              {cat === 'todas' ? 'Todas' : getCategoriaLabel(cat as FlyerTemplate['categoria'])}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div>
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Plantillas disponibles
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Blank / from scratch option */}
            <button
              onClick={() => !isMobile && handleOpenTemplate({
                ...FLYER_TEMPLATES[0],
                id: 'scratch',
                nombre: 'Desde cero',
                elementos: [],
                fondoColores: ['#0d1117', '#161b22'],
                fondo: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
              })}
              className="group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 cursor-pointer text-left w-full"
              style={{
                border: '2px dashed var(--color-border-default)',
                background: 'var(--color-bg-surface)',
                opacity: isMobile ? 0.5 : 1,
                cursor: isMobile ? 'not-allowed' : 'pointer',
              }}
            >
              <div
                className="w-full aspect-square flex flex-col items-center justify-center gap-2"
                style={{ background: 'var(--color-bg-elevated)', minHeight: 120 }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)' }}
                >
                  <Plus size={20} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </div>
              <div
                className="px-3 py-2"
                style={{ borderTop: '1px solid var(--color-border-subtle)' }}
              >
                <p
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Desde cero
                </p>
              </div>
            </button>

            {/* Template cards */}
            {filtered.map((tmpl) => (
              <FlyerPreview
                key={tmpl.id}
                template={tmpl}
                onClick={() => handleOpenTemplate(tmpl)}
              />
            ))}
          </div>
        </div>

        {/* Saved flyers */}
        {savedFlyers.length > 0 && (
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Mis flyers guardados
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedFlyers.map((flyer) => {
                const tmpl = FLYER_TEMPLATES.find((t) => t.id === flyer.templateId)
                return (
                  <Card key={flyer.id}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {flyer.nombre}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {tmpl?.nombre ?? 'Plantilla'} &middot; {new Date(flyer.creadoEn).toLocaleDateString('es-PA')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSaved(flyer.id)}
                          className="flex-shrink-0"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Info section */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--color-accent-gold)' }}>✓</span>
                100% gratuito, sin APIs externas
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--color-accent-gold)' }}>✓</span>
                Exporta en PNG de alta resolución (1080x1080)
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--color-accent-gold)' }}>✓</span>
                Edita textos, colores y formas
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--color-accent-gold)' }}>✓</span>
                6 plantillas para diferentes eventos
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
