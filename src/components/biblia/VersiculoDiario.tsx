'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Copy, Check } from 'lucide-react'

interface VersiculoDiarioData {
  referencia: string
  texto: string
  fecha: string
}

export function VersiculoDiario() {
  const [data, setData] = useState<VersiculoDiarioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/biblia/diario')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleCopy = async () => {
    if (!data) return
    const text = `"${data.texto}" — ${data.referencia}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div
        className="rounded-xl p-6 animate-pulse"
        style={{
          background: 'var(--color-accent-gold-soft)',
          border: '1px solid rgba(201, 168, 76, 0.2)',
          minHeight: 140,
        }}
      />
    )
  }

  if (!data) return null

  return (
    <div
      className="rounded-xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.04) 100%)',
        border: '1px solid rgba(201, 168, 76, 0.2)',
      }}
    >
      {/* Decorative quote mark */}
      <span
        className="absolute top-2 right-4 text-[80px] font-serif leading-none pointer-events-none select-none"
        style={{ color: 'rgba(201,168,76,0.08)', fontFamily: 'Georgia, serif' }}
      >
        &ldquo;
      </span>

      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ background: 'var(--color-accent-gold-soft)' }}
        >
          <BookOpen size={14} style={{ color: 'var(--color-accent-gold)' }} />
        </div>
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          Versículo del Día
        </span>
      </div>

      <blockquote
        className="text-[15px] leading-relaxed mb-4 italic"
        style={{ color: 'var(--color-text-primary)' }}
      >
        &ldquo;{data.texto}&rdquo;
      </blockquote>

      <div className="flex items-center justify-between">
        <p
          className="text-[13px] font-semibold"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          — {data.referencia}
        </p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md transition-all duration-200"
          style={{
            color: copied ? 'var(--color-accent-green)' : 'var(--color-text-muted)',
            background: 'transparent',
            border: '1px solid var(--color-border-subtle)',
          }}
          onMouseEnter={(e) => {
            if (!copied) e.currentTarget.style.borderColor = 'var(--color-border-default)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
          }}
        >
          {copied ? (
            <>
              <Check size={12} />
              Copiado
            </>
          ) : (
            <>
              <Copy size={12} />
              Copiar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
