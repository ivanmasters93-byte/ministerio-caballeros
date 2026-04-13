'use client'

import { useState } from 'react'
import { BookOpen, Search, ChevronLeft } from 'lucide-react'
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

  // Mobile: show book list OR reader (not both)
  const showingReader = libroSeleccionado !== null

  return (
    <div className="space-y-5">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* Back button on mobile when reading */}
          {vista === 'lector' && showingReader && (
            <button
              onClick={() => setLibroSeleccionado(null)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer"
              style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
            >
              <ChevronLeft size={20} />
            </button>
          )}
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
              className="text-[20px] sm:text-[22px] font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
            >
              Biblia
            </h1>
            <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              Reina-Valera &middot; 66 libros
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: vista === v ? 'var(--color-accent-gold-soft)' : 'transparent',
                color: vista === v ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                border: vista === v ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
              }}
            >
              {v === 'lector' ? (
                <><BookOpen size={14} /> Leer</>
              ) : (
                <><Search size={14} /> Buscar</>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== VERSE OF THE DAY ===== */}
      <VersiculoDiario />

      {/* ===== SEARCH VIEW ===== */}
      {vista === 'buscar' && (
        <div className="dark-card p-4 sm:p-6" style={{ minHeight: 400 }}>
          <div className="flex items-center gap-2 mb-4">
            <Search size={16} style={{ color: 'var(--color-accent-gold)' }} />
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Buscar en la Biblia
            </h2>
          </div>
          <BuscadorBiblia />
        </div>
      )}

      {/* ===== READER VIEW ===== */}
      {vista === 'lector' && (
        <>
          {/* MOBILE: Show either book list or reader */}
          <div className="lg:hidden">
            {!showingReader ? (
              <div className="dark-card p-4" style={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={14} style={{ color: 'var(--color-accent-gold)' }} />
                  <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Selecciona un libro
                  </h2>
                </div>
                <SelectorLibro
                  libroSeleccionado={libroSeleccionado}
                  onSeleccionar={handleSeleccionarLibro}
                />
              </div>
            ) : capituloSelector ? (
              <MobileChapterGrid
                libro={libroSeleccionado}
                capitulo={capitulo}
                onSelect={handleCapituloChange}
                onClose={() => setCapituloSelector(false)}
              />
            ) : (
              <div className="dark-card p-4" style={{ minHeight: 400 }}>
                <div className="mb-3">
                  <button
                    onClick={() => setCapituloSelector(true)}
                    className="text-[13px] px-3 py-2 rounded-lg cursor-pointer"
                    style={{
                      color: 'var(--color-accent-gold)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      background: 'var(--color-accent-gold-soft)',
                    }}
                  >
                    Cap. {capitulo} de {libroSeleccionado.capitulos} &mdash; Cambiar
                  </button>
                </div>
                <LectorCapitulo
                  libro={libroSeleccionado}
                  capitulo={capitulo}
                  onCapituloChange={handleCapituloChange}
                />
              </div>
            )}
          </div>

          {/* DESKTOP: Side by side */}
          <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-4">
            <div className="dark-card p-4" style={{ height: 'calc(100vh - 300px)', minHeight: 500 }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} style={{ color: 'var(--color-accent-gold)' }} />
                <h2 className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
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

            <div className="dark-card p-6" style={{ height: 'calc(100vh - 300px)', minHeight: 500 }}>
              {!libroSeleccionado ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl"
                    style={{ background: 'var(--color-accent-gold-soft)' }}
                  >
                    <BookOpen size={28} style={{ color: 'var(--color-accent-gold)', opacity: 0.6 }} />
                  </div>
                  <p className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Selecciona un libro
                  </p>
                  <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    Elige un libro de la lista para comenzar a leer
                  </p>
                </div>
              ) : capituloSelector ? (
                <DesktopChapterGrid
                  libro={libroSeleccionado}
                  capitulo={capitulo}
                  onSelect={handleCapituloChange}
                  onClose={() => setCapituloSelector(false)}
                />
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex-shrink-0 mb-3">
                    <button
                      onClick={() => setCapituloSelector(true)}
                      className="text-[12px] px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                      style={{
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      Ir al capitulo &rarr;
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
        </>
      )}
    </div>
  )
}

/* ---- Chapter Grid Components ---- */

function MobileChapterGrid({ libro, capitulo, onSelect, onClose }: {
  libro: LibroBiblia; capitulo: number; onSelect: (n: number) => void; onClose: () => void
}) {
  return (
    <div className="dark-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {libro.nombre}
        </h2>
        <button onClick={onClose} className="text-[13px] px-3 py-1.5 rounded-lg cursor-pointer"
          style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border-subtle)' }}>
          Cancelar
        </button>
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
        {Array.from({ length: libro.capitulos }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className="aspect-square rounded-lg text-[14px] font-medium flex items-center justify-center cursor-pointer"
            style={{
              minHeight: 44,
              background: n === capitulo ? 'var(--color-accent-gold-soft)' : 'var(--color-bg-elevated)',
              color: n === capitulo ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
              border: n === capitulo ? '1px solid rgba(201,168,76,0.3)' : '1px solid var(--color-border-subtle)',
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function DesktopChapterGrid({ libro, capitulo, onSelect, onClose }: {
  libro: LibroBiblia; capitulo: number; onSelect: (n: number) => void; onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {libro.nombre} — Elige un capitulo
        </h2>
        <button onClick={onClose} className="text-[13px] px-3 py-1.5 rounded-lg cursor-pointer"
          style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border-subtle)' }}>
          Cerrar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 gap-2">
          {Array.from({ length: libro.capitulos }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => onSelect(n)}
              className="aspect-square rounded-lg text-[13px] font-medium flex items-center justify-center cursor-pointer"
              style={{
                background: n === capitulo ? 'var(--color-accent-gold-soft)' : 'var(--color-bg-elevated)',
                color: n === capitulo ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
                border: n === capitulo ? '1px solid rgba(201,168,76,0.3)' : '1px solid var(--color-border-subtle)',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
