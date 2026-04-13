'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, FileText } from 'lucide-react'

interface TranscripcionViewerProps {
  transcripcion: string
}

export function TranscripcionViewer({ transcripcion }: TranscripcionViewerProps) {
  const [busqueda, setBusqueda] = useState('')

  const parrafos = transcripcion.split(/\n+/).filter((p) => p.trim().length > 0)

  const resaltarTexto = (texto: string, query: string) => {
    if (!query.trim()) return texto

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const partes = texto.split(regex)

    return partes.map((parte, i) =>
      regex.test(parte) ? (
        <mark
          key={i}
          style={{
            background: 'var(--color-accent-gold-soft)',
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

  const parrafosFiltrados = busqueda
    ? parrafos.filter((p) => p.toLowerCase().includes(busqueda.toLowerCase()))
    : parrafos

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText size={16} style={{ color: 'var(--color-accent-gold)' }} />
            Transcripción completa
          </CardTitle>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {transcripcion.length.toLocaleString()} caracteres
          </span>
        </div>
        <div className="relative mt-2">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <Input
            placeholder="Buscar en la transcripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {busqueda && (
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {parrafosFiltrados.length} párrafo(s) encontrado(s)
          </p>
        )}
        <div
          className="space-y-3 max-h-[500px] overflow-y-auto pr-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {parrafosFiltrados.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
              No se encontraron coincidencias
            </p>
          ) : (
            parrafosFiltrados.map((parrafo, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {busqueda ? resaltarTexto(parrafo, busqueda) : parrafo}
              </p>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
