'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, HelpCircle, BookOpen, Copy, Check } from 'lucide-react'

interface ResumenPredicaProps {
  resumen: string
  puntosClave: string[]
  preguntasReflexion: string[]
  versiculosCitados: string[]
  titulo: string
  predicador: string
}

export function ResumenPredica({
  resumen,
  puntosClave,
  preguntasReflexion,
  versiculosCitados,
  titulo,
  predicador,
}: ResumenPredicaProps) {
  const [copiado, setCopiado] = useState(false)

  const copiarResumen = () => {
    const texto = [
      `Prédica: ${titulo}`,
      `Predicador: ${predicador}`,
      '',
      '--- RESUMEN ---',
      resumen,
      '',
      '--- PUNTOS CLAVE ---',
      ...puntosClave.map((p, i) => `${i + 1}. ${p}`),
      '',
      '--- PREGUNTAS DE REFLEXIÓN ---',
      ...preguntasReflexion.map((q, i) => `${i + 1}. ${q}`),
      '',
      '--- VERSÍCULOS ---',
      ...versiculosCitados,
    ].join('\n')

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Resumen</CardTitle>
            <Button size="sm" variant="ghost" onClick={copiarResumen}>
              {copiado ? (
                <>
                  <Check size={13} className="mr-1" /> Copiado
                </>
              ) : (
                <>
                  <Copy size={13} className="mr-1" /> Copiar todo
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text-secondary)' }}>
            {resumen.split('\n').map((paragraph, i) =>
              paragraph.trim() ? (
                <p key={i} className="mb-3 leading-relaxed">
                  {paragraph}
                </p>
              ) : null
            )}
          </div>
        </CardContent>
      </Card>

      {/* Puntos clave */}
      {puntosClave.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle size={16} style={{ color: 'var(--color-accent-green)' }} />
              Puntos Clave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {puntosClave.map((punto, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{
                      background: 'var(--color-accent-gold-soft)',
                      color: 'var(--color-accent-gold)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {punto}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Preguntas de reflexión */}
      {preguntasReflexion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle size={16} style={{ color: 'var(--color-accent-blue)' }} />
              Preguntas de Reflexión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {preguntasReflexion.map((pregunta, i) => (
                <li
                  key={i}
                  className="p-3 rounded-lg text-sm leading-relaxed"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-secondary)',
                    borderLeft: '3px solid var(--color-accent-blue)',
                  }}
                >
                  {pregunta}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Versículos citados */}
      {versiculosCitados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen size={16} style={{ color: 'var(--color-accent-amber)' }} />
              Versículos Citados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {versiculosCitados.map((versiculo, i) => (
                <a
                  key={i}
                  href={`/biblia?q=${encodeURIComponent(versiculo)}`}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  style={{
                    background: 'var(--color-accent-amber-soft)',
                    color: 'var(--color-accent-amber)',
                  }}
                >
                  {versiculo}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
