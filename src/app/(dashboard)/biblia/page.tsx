'use client'

import { useState } from 'react'
import { BookOpen, Search, X } from 'lucide-react'
import { VersiculoDiario } from '@/components/biblia/VersiculoDiario'
import { SelectorLibro } from '@/components/biblia/SelectorLibro'
import { LectorCapitulo } from '@/components/biblia/LectorCapitulo'
import { BuscadorBiblia } from '@/components/biblia/BuscadorBiblia'
import type { LibroBiblia } from '@/lib/biblia/libros'

type Vista = 'lector' | 'buscar'

export default function BibliaPage() {
  const [libroSeleccionado, setLibroSeleccionado] = useState<LibroBiblia | null>(null)
  const [capitulo, setCapitulo] = useState(1)
  const [vista, setVista] = useState<Vista>('lector')
  const [capituloSelector, setCapituloSelector] = useState(false)

  const handleSeleccionarLibro = (libro: LibroBiblia) => {
    setLibroSeleccionado(libro)
    setCapitulo(1)
    setCapituloSelector(false)
  }

  const handleCapituloChange = (n: number) => {
    setCapitulo(n)
    setCapituloSelector(false)
  }

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'var(--color-accent-gold-soft)',
              border: '1px solid rgba(201,168,76,0.2)',
            }}
          >
            <BookOpen size={20} style={{ color: 'var(--color-accent-gold)' }} />
          </div>
          <div>
            <h1
              className="text-[22px] font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
            >
              Biblia
            </h1>
            <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              Reina-Valera 1960 &middot; Dominio público
            </p>
          </div>
        </div>

        {/* Vista toggle */}
        <div
          className="flex rounded-lg p-1"
          style={{ background: 'var(--color-bg-elevated)' }}
        >
          {(['lector', 'buscar'] as Vista[]).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200"
              style={{
                background: vista === v ? 'var(--color-accent-gold-soft)' : 'transparent',
                color: vista === v ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                border: vista === v ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
              }}
            >
              {v === 'lector' ? (
                <>
                  <BookOpen size={12} />
                  Leer
                </>
              ) : (
                <>
                  <Search size={12} />
                  Buscar
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== VERSE OF THE DAY ===== */}
      <div className="slide-up">
        <VersiculoDiario />
      </div>

      {/* ===== SEARCH VIEW ===== */}
      {vista === 'buscar' && (
        <div
          className="dark-card p-6 slide-up"
          style={{ minHeight: 480 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Search size={16} style={{ color: 'var(--color-accent-gold)' }} />
            <h2
              className="text-[15px] font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Buscar en la Biblia
            </h2>
          </div>
          <div style={{ height: 420 }}>
            <BuscadorBiblia />
          </div>
        </div>
      )}

      {/* ===== READER VIEW ===== */}
      {vista === 'lector' && (
        <div
          className="grid gap-4 slide-up"
          style={{ gridTemplateColumns: 'minmax(0, 280px) 1fr' }}
        >
          {/* Left: Book selector */}
          <div
            className="dark-card p-4"
            style={{ height: 600 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={14} style={{ color: 'var(--color-accent-gold)' }} />
              <h2
                className="text-[13px] font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Libros
              </h2>
            </div>
            <div style={{ height: 'calc(100% - 36px)' }}>
              <SelectorLibro
                libroSeleccionado={libroSeleccionado}
                onSeleccionar={handleSeleccionarLibro}
              />
            </div>
          </div>

          {/* Right: Chapter reader / chapter selector */}
          <div className="dark-card p-6" style={{ height: 600 }}>
            {!libroSeleccionado ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-2xl"
                  style={{ background: 'var(--color-accent-gold-soft)' }}
                >
                  <BookOpen size={28} style={{ color: 'var(--color-accent-gold)', opacity: 0.6 }} />
                </div>
                <div className="text-center">
                  <p
                    className="text-[15px] font-semibold mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Selecciona un libro
                  </p>
                  <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    Elige un libro de la lista para comenzar a leer
                  </p>
                </div>
              </div>
            ) : capituloSelector ? (
              /* Chapter grid */
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h2
                    className="text-[15px] font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {libroSeleccionado.nombre} — Elige un capítulo
                  </h2>
                  <button
                    onClick={() => setCapituloSelector(false)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-2 sm:grid-cols-10 lg:grid-cols-12">
                    {Array.from({ length: libroSeleccionado.capitulos }, (_, i) => i + 1).map(
                      (n) => (
                        <button
                          key={n}
                          onClick={() => handleCapituloChange(n)}
                          className="aspect-square rounded-lg text-[13px] font-medium transition-all duration-150"
                          style={{
                            background:
                              n === capitulo
                                ? 'var(--color-accent-gold-soft)'
                                : 'var(--color-bg-elevated)',
                            color:
                              n === capitulo
                                ? 'var(--color-accent-gold)'
                                : 'var(--color-text-secondary)',
                            border:
                              n === capitulo
                                ? '1px solid rgba(201,168,76,0.3)'
                                : '1px solid var(--color-border-subtle)',
                          }}
                          onMouseEnter={(e) => {
                            if (n !== capitulo) {
                              e.currentTarget.style.borderColor = 'var(--color-border-default)'
                              e.currentTarget.style.color = 'var(--color-text-primary)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (n !== capitulo) {
                              e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
                              e.currentTarget.style.color = 'var(--color-text-secondary)'
                            }
                          }}
                        >
                          {n}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Chapter reader */
              <div className="flex flex-col h-full">
                {/* "Go to chapter" button above reader */}
                <div className="flex-shrink-0 mb-3">
                  <button
                    onClick={() => setCapituloSelector(true)}
                    className="text-[12px] px-3 py-1.5 rounded-lg transition-all duration-200"
                    style={{
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border-subtle)',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent-gold)'
                      e.currentTarget.style.color = 'var(--color-accent-gold)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
                      e.currentTarget.style.color = 'var(--color-text-muted)'
                    }}
                  >
                    Ir al capítulo &rarr;
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <LectorCapitulo
                    libro={libroSeleccionado}
                    capitulo={capitulo}
                    onCapituloChange={handleCapituloChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
