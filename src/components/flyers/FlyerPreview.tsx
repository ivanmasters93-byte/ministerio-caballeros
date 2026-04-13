'use client'

import { FlyerTemplate, getCategoriaLabel } from '@/lib/flyers/templates'
import { cn } from '@/lib/utils'

interface FlyerPreviewProps {
  template: FlyerTemplate
  selected?: boolean
  onClick?: () => void
}

const CATEGORIA_COLORS: Record<string, string> = {
  reunion: '#c9a84c',
  especial: '#d4af37',
  evento: '#7ec850',
  devocional: '#e8c56a',
  anuncio: '#3b82f6',
  social: '#ff6b35',
}

export function FlyerPreview({ template, selected, onClick }: FlyerPreviewProps) {
  const accentColor = CATEGORIA_COLORS[template.categoria] ?? '#c9a84c'
  const [bg1, bg2] = template.fondoColores

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 cursor-pointer text-left w-full',
        'border-2',
        selected
          ? 'border-[var(--color-accent-gold)] shadow-lg shadow-[rgba(201,168,76,0.2)]'
          : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]',
      )}
      style={{ background: 'var(--color-bg-surface)' }}
    >
      {/* Mini canvas preview */}
      <div
        className="w-full aspect-square flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${bg1} 0%, ${bg2 ?? bg1} 100%)`,
          minHeight: 120,
        }}
      >
        {/* Decorative lines mimicking template layout */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: accentColor, opacity: 0.4 }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: accentColor, opacity: 0.4 }}
        />

        {/* Title preview */}
        <div className="px-3 text-center space-y-1.5">
          <p
            className="text-[9px] font-medium tracking-widest uppercase"
            style={{ color: accentColor, opacity: 0.85 }}
          >
            Ministerio Gedeones
          </p>
          <p
            className="text-sm font-bold leading-tight"
            style={{ color: '#ffffff' }}
          >
            {template.nombre.toUpperCase()}
          </p>
          <div
            className="mx-auto h-px w-12"
            style={{ background: accentColor, opacity: 0.7 }}
          />
          <p
            className="text-[8px]"
            style={{ color: accentColor, opacity: 0.75 }}
          >
            {template.descripcion.slice(0, 42)}...
          </p>
        </div>

        {/* Selection overlay */}
        {selected && (
          <div
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: accentColor, color: '#0c0e14' }}
          >
            ✓
          </div>
        )}
      </div>

      {/* Info bar */}
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <p
          className="text-xs font-medium truncate"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {template.nombre}
        </p>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-1"
          style={{
            background: `${accentColor}22`,
            color: accentColor,
          }}
        >
          {getCategoriaLabel(template.categoria)}
        </span>
      </div>
    </button>
  )
}
