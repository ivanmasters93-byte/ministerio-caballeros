'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateShort } from '@/lib/utils'
import { Mic, Clock, Eye, Wand2, FileText, Trash2, CheckCircle } from 'lucide-react'

export interface PredicaCardData {
  id: string
  titulo: string
  predicador: string
  fecha: string
  duracion?: number | null
  estado: string
  red?: { nombre: string } | null
  evento?: { titulo: string } | null
  transcripcion?: string | null
  resumen?: string | null
}

interface PredicaCardProps {
  predica: PredicaCardData
  onView: (id: string) => void
  onTranscribir: (id: string) => void
  onResumir: (id: string) => void
  onEliminar: (id: string) => void
  procesando?: boolean
}

const estadoConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline' }> = {
  PENDIENTE: { label: 'Pendiente', variant: 'secondary' },
  TRANSCRIBIENDO: { label: 'Transcribiendo...', variant: 'warning' },
  TRANSCRITA: { label: 'Transcrita', variant: 'default' },
  PROCESANDO: { label: 'Generando resumen...', variant: 'warning' },
  COMPLETA: { label: 'Completa', variant: 'success' },
  ERROR: { label: 'Error', variant: 'danger' },
}

export function PredicaCard({
  predica,
  onView,
  onTranscribir,
  onResumir,
  onEliminar,
  procesando = false,
}: PredicaCardProps) {
  const config = estadoConfig[predica.estado] ?? estadoConfig.PENDIENTE
  const puedeTranscribir = predica.estado === 'PENDIENTE' || predica.estado === 'ERROR'
  const puedeResumir = predica.estado === 'TRANSCRITA'
  const tieneTranscripcion = !!predica.transcripcion
  const tieneResumen = !!predica.resumen

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{
              width: 40,
              height: 40,
              background: 'var(--color-accent-gold-soft)',
              border: '1px solid rgba(201, 168, 76, 0.2)',
            }}
          >
            <Mic size={18} style={{ color: 'var(--color-accent-gold)' }} />
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>

        <h3
          className="font-semibold text-base leading-snug line-clamp-2 mb-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {predica.titulo}
        </h3>

        <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          {predica.predicador}
        </p>

        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          <span>{formatDateShort(predica.fecha)}</span>
          {predica.duracion && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {predica.duracion} min
            </span>
          )}
          {predica.red && <span>{predica.red.nombre}</span>}
        </div>

        {/* Indicators */}
        <div className="flex gap-2 mb-4">
          {tieneTranscripcion && (
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--color-accent-blue-soft)',
                color: 'var(--color-accent-blue)',
              }}
            >
              <FileText size={10} /> Transcripción
            </span>
          )}
          {tieneResumen && (
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--color-accent-green-soft)',
                color: 'var(--color-accent-green)',
              }}
            >
              <CheckCircle size={10} /> Resumen
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => onView(predica.id)}>
            <Eye size={13} className="mr-1" /> Ver
          </Button>

          {puedeTranscribir && !tieneTranscripcion && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onTranscribir(predica.id)}
              disabled={procesando}
            >
              <FileText size={13} className="mr-1" /> Transcribir
            </Button>
          )}

          {puedeResumir && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onResumir(predica.id)}
              disabled={procesando}
            >
              <Wand2 size={13} className="mr-1" /> Resumir
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEliminar(predica.id)}
            className="ml-auto"
            style={{ color: 'var(--color-accent-red)' }}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
