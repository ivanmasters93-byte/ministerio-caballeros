'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, BookOpen } from 'lucide-react'
import type { LibroBiblia } from '@/lib/biblia/libros'

interface VersiculoData {
  versiculo: number
  texto: string
}

interface LectorCapituloProps {
  libro: LibroBiblia
  capitulo: number
  onCapituloChange: (n: number) => void
}

export function LectorCapitulo({ libro, capitulo, onCapituloChange }: LectorCapituloProps) {
  const [versiculos, setVersiculos] = useState<VersiculoData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!libro) return
    setLoading(true)
    setError(null)
    setVersiculos([])

    fetch(`/api/biblia/versiculo?libro=${encodeURIComponent(libro.nombre)}&capitulo=${capitulo}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          const vs: VersiculoData[] = (data.versiculos ?? []).map(
            (v: { versiculo: number; texto: string }) => ({
              versiculo: v.versiculo,
              texto: v.texto,
            })
          )
          setVersiculos(vs)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo cargar el capítulo. Verifica tu conexión.')
        setLoading(false)
      })
  }, [libro, capitulo])

  const canPrev = capitulo > 1
  const canNext = capitulo < libro.capitulos

  return (
    <div className="flex flex-col h-full">
      {/* Chapter navigation header */}
      <div
        className="flex items-center justify-between mb-5 pb-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <button
          onClick={() => canPrev && onCapituloChange(capitulo - 1)}
          disabled={!canPrev}
          className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            color: 'var(--color-text-secondary)',
            background: 'transparent',
            border: '1px solid var(--color-border-subtle)',
          }}
          onMouseEnter={(e) => {
            if (canPrev) e.currentTarget.style.borderColor = 'var(--color-border-default)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
          }}
        >
          <ChevronLeft size={14} />
          Anterior
        </button>

        <div className="text-center">
          <p
            className="text-[16px] font-bold"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
          >
            {libro.nombre}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Capítulo {capitulo} de {libro.capitulos}
          </p>
        </div>

        <button
          onClick={() => canNext && onCapituloChange(capitulo + 1)}
          disabled={!canNext}
          className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            color: 'var(--color-text-secondary)',
            background: 'transparent',
            border: '1px solid var(--color-border-subtle)',
          }}
          onMouseEnter={(e) => {
            if (canNext) e.currentTarget.style.borderColor = 'var(--color-border-default)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
          }}
        >
          Siguiente
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={24}
                className="animate-spin"
                style={{ color: 'var(--color-accent-gold)' }}
              />
              <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                Cargando {libro.nombre} {capitulo}...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-xl p-6 text-center"
            style={{
              background: 'var(--color-accent-red-soft)',
              border: '1px solid rgba(248,113,113,0.2)',
            }}
          >
            <p className="text-[14px]" style={{ color: 'var(--color-accent-red)' }}>
              {error}
            </p>
          </div>
        )}

        {!loading && !error && versiculos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BookOpen size={32} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
              Sin resultados para este capítulo
            </p>
          </div>
        )}

        {!loading && !error && versiculos.length > 0 && (
          <div className="space-y-1">
            {versiculos.map((v) => (
              <div key={v.versiculo} className="flex gap-3 group py-1">
                <span
                  className="text-[11px] font-bold mt-1 min-w-[20px] text-right shrink-0 select-none"
                  style={{ color: 'var(--color-accent-gold)', opacity: 0.7 }}
                >
                  {v.versiculo}
                </span>
                <p
                  className="text-[14px] leading-7"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {v.texto}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
