'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Loader2, BookOpen } from 'lucide-react'

interface ResultadoBusqueda {
  libro: string
  capitulo: number
  versiculo: number
  texto: string
  referencia: string
}

function destacarTexto(texto: string, query: string): React.ReactNode {
  if (!query.trim()) return texto
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const partes = texto.split(regex)
  return partes.map((parte, i) =>
    regex.test(parte) ? (
      <mark
        key={i}
        style={{
          background: 'rgba(201,168,76,0.25)',
          color: 'var(--color-accent-gold)',
          borderRadius: '2px',
          padding: '0 2px',
        }}
      >
        {parte}
      </mark>
    ) : (
      parte
    )
  )
}

interface BuscadorBibliaProps {
  onCerrar?: () => void
}

export function BuscadorBiblia({ onCerrar }: BuscadorBibliaProps) {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buscado, setBuscado] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const buscar = useCallback((q: string) => {
    if (q.trim().length < 2) {
      setResultados([])
      setBuscado(false)
      return
    }
    setLoading(true)
    setError(null)
    fetch(`/api/biblia/buscar?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
          setResultados([])
        } else {
          setResultados(data.resultados ?? [])
        }
        setBuscado(true)
        setLoading(false)
      })
      .catch(() => {
        setError('Error al buscar. Intenta de nuevo.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (query.length < 2) {
      setResultados([])
      setBuscado(false)
      setLoading(false)
      return
    }
    setLoading(true)
    timerRef.current = setTimeout(() => buscar(query), 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, buscar])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const limpiar = () => {
    setQuery('')
    setResultados([])
    setBuscado(false)
    setError(null)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="relative mb-4 flex-shrink-0">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar versículos... (ej: amor, fe, paz)"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-[14px] outline-none transition-all duration-200"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-primary)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent-gold)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-default)'
          }}
        />
        {query && (
          <button
            onClick={limpiar}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
          >
            <X size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: 'var(--color-accent-gold)' }}
            />
          </div>
        )}

        {error && !loading && (
          <div
            className="rounded-xl px-4 py-3 text-[13px]"
            style={{
              background: 'var(--color-accent-red-soft)',
              color: 'var(--color-accent-red)',
              border: '1px solid rgba(248,113,113,0.2)',
            }}
          >
            {error}
          </div>
        )}

        {!loading && buscado && resultados.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <BookOpen size={28} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
              No se encontraron versículos para &ldquo;{query}&rdquo;
            </p>
          </div>
        )}

        {!loading && !buscado && !error && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Search size={28} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
              Escribe al menos 2 caracteres para buscar
            </p>
            <p className="text-[12px]" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>
              Ej: amor, gracia, esperanza, salvación
            </p>
          </div>
        )}

        {!loading &&
          resultados.map((r, i) => (
            <div
              key={`${r.referencia}-${i}`}
              className="rounded-xl p-4 transition-all duration-150"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-subtle)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
              }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-wide mb-2"
                style={{ color: 'var(--color-accent-gold)' }}
              >
                {r.referencia}
              </p>
              <p className="text-[13px] leading-6" style={{ color: 'var(--color-text-primary)' }}>
                {destacarTexto(r.texto, query)}
              </p>
            </div>
          ))}

        {!loading && resultados.length > 0 && (
          <p
            className="text-center text-[12px] py-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {onCerrar && (
        <div className="pt-3 flex-shrink-0">
          <button
            onClick={onCerrar}
            className="w-full py-2 text-[13px] rounded-lg transition-all duration-200"
            style={{
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-subtle)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
            }}
          >
            Cerrar búsqueda
          </button>
        </div>
      )}
    </div>
  )
}
