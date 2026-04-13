'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-2xl mb-6"
        style={{
          width: 80,
          height: 80,
          background: 'var(--color-accent-blue-soft)',
          border: '1px solid rgba(91,141,239,0.2)',
        }}
      >
        <WifiOff size={36} style={{ color: 'var(--color-accent-blue)' }} />
      </div>

      {/* Heading */}
      <h1
        className="text-2xl font-bold mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text-primary)',
        }}
      >
        Sin conexion
      </h1>

      {/* Description */}
      <p
        className="text-sm max-w-xs leading-relaxed mb-8"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        No hay conexion a internet en este momento. Algunas secciones estan disponibles sin conexion.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: 'var(--color-accent-blue)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} />
          Reintentar
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          Ir al inicio
        </Link>
      </div>

      {/* Footer hint */}
      <p
        className="text-xs mt-10"
        style={{ color: 'var(--color-text-muted)' }}
      >
        GEDEONES &middot; Ministerio de Caballeros
      </p>
    </div>
  )
}
