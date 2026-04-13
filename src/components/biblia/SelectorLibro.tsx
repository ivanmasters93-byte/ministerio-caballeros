'use client'

import { useState } from 'react'
import { LIBROS_AT, LIBROS_NT, type LibroBiblia } from '@/lib/biblia/libros'

interface SelectorLibroProps {
  libroSeleccionado: LibroBiblia | null
  onSeleccionar: (libro: LibroBiblia) => void
}

export function SelectorLibro({ libroSeleccionado, onSeleccionar }: SelectorLibroProps) {
  const [testamento, setTestamento] = useState<'AT' | 'NT'>('AT')

  const libros = testamento === 'AT' ? LIBROS_AT : LIBROS_NT

  return (
    <div className="flex flex-col h-full">
      {/* Testament tabs */}
      <div
        className="flex rounded-lg p-1 mb-4 flex-shrink-0"
        style={{ background: 'var(--color-bg-elevated)' }}
      >
        {(['AT', 'NT'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTestamento(t)}
            className="flex-1 py-1.5 px-3 rounded-md text-[12px] font-semibold transition-all duration-200"
            style={{
              background: testamento === t ? 'var(--color-accent-gold-soft)' : 'transparent',
              color: testamento === t ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
              border: testamento === t ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
            }}
          >
            {t === 'AT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
          </button>
        ))}
      </div>

      {/* Book list */}
      <div className="overflow-y-auto flex-1 space-y-0.5 pr-1">
        {libros.map((libro) => {
          const isActive = libroSeleccionado?.id === libro.id
          return (
            <button
              key={libro.id}
              onClick={() => onSeleccionar(libro)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-150"
              style={{
                background: isActive ? 'var(--color-accent-gold-soft)' : 'transparent',
                color: isActive ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
                borderLeft: isActive
                  ? '2px solid var(--color-accent-gold)'
                  : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--color-bg-elevated)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }
              }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-wide min-w-[28px]"
                style={{ color: isActive ? 'var(--color-accent-gold)' : 'var(--color-text-muted)' }}
              >
                {libro.abreviatura}
              </span>
              <span className="text-[13px] font-medium flex-1 truncate">{libro.nombre}</span>
              <span
                className="text-[10px] shrink-0"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {libro.capitulos} cap.
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
