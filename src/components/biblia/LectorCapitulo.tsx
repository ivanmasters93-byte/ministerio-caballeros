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
          setVersiculos(
            (data.versiculos ?? []).map((v: { versiculo: number; texto: string }) => ({
              versiculo: v.versiculo,
              texto: v.texto,
            }))
          )
        }
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo cargar el capitulo.')
        setLoading(false)
      })
  }, [libro, capitulo])

  const canPrev = capitulo > 1
  const canNext = capitulo < libro.capitulos

  return (
    <div className="flex flex-col h-full">
      {/* Chapter navigation header */}
      <div
        className="flex items-center justify-between mb-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <button
          onClick={() => canPrev && onCapituloChange(capitulo - 1)}
          disabled={!canPrev}
          className="flex items-center gap-1 text-[13px] px-3 py-2 rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          style={{
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-subtle)',
            minHeight: 40,
          }}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="text-center px-2">
          <p
            className="text-[15px] sm:text-[16px] font-bold"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
          >
            {libro.nombre}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Capitulo {capitulo} de {libro.capitulos}
          </p>
        </div>

        <button
          onClick={() => canNext && onCapituloChange(capitulo + 1)}
          disabled={!canNext}
          className="flex items-center gap-1 text-[13px] px-3 py-2 rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          style={{
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-subtle)',
            minHeight: 40,
          }}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: 'var(--color-accent-gold)' }}
            />
          </div>
        )}

        {error && (
          <div
            className="rounded-xl p-5 text-center"
            style={{
              background: 'var(--color-accent-red-soft)',
              border: '1px solid rgba(248,113,113,0.2)',
            }}
          >
            <p className="text-[14px]" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
          </div>
        )}

        {!loading && !error && versiculos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BookOpen size={32} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
              Sin resultados
            </p>
          </div>
        )}

        {!loading && !error && versiculos.length > 0 && (
          <div className="space-y-4">
            {versiculos.map((v) => (
              <div key={v.versiculo} className="flex gap-3">
                <span
                  className="text-[12px] font-bold mt-1.5 min-w-[24px] text-right shrink-0 select-none"
                  style={{ color: 'var(--color-accent-gold)', opacity: 0.8 }}
                >
                  {v.versiculo}
                </span>
                <p
                  className="text-[15px] sm:text-[16px] leading-8"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {v.texto}
                </p>
              </div>
            ))}

            {/* Bottom nav for mobile convenience */}
            <div
              className="flex items-center justify-between pt-6 mt-4"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              <button
                onClick={() => canPrev && onCapituloChange(capitulo - 1)}
                disabled={!canPrev}
                className="text-[13px] px-4 py-2.5 rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  color: 'var(--color-accent-gold)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  background: 'var(--color-accent-gold-soft)',
                  minHeight: 44,
                }}
              >
                <ChevronLeft size={14} className="inline mr-1" />
                Cap. {capitulo - 1}
              </button>
              <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                {versiculos.length} versiculos
              </span>
              <button
                onClick={() => canNext && onCapituloChange(capitulo + 1)}
                disabled={!canNext}
                className="text-[13px] px-4 py-2.5 rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  color: 'var(--color-accent-gold)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  background: 'var(--color-accent-gold-soft)',
                  minHeight: 44,
                }}
              >
                Cap. {capitulo + 1}
                <ChevronRight size={14} className="inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
