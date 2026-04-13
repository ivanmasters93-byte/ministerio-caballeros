'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, RotateCcw } from 'lucide-react'

interface GrabadorEnVivoProps {
  onTranscripcion: (texto: string) => void
}

export function GrabadorEnVivo({ onTranscripcion }: GrabadorEnVivoProps) {
  const [soportado, setSoportado] = useState(false)
  const [grabando, setGrabando] = useState(false)
  const [textoAcumulado, setTextoAcumulado] = useState('')
  const [textoInterino, setTextoInterino] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reconocimientoRef = useRef<any>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition: any =
      (typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null

    setSoportado(!!SpeechRecognition)
  }, [])

  const detener = useCallback(() => {
    reconocimientoRef.current?.stop()
    setGrabando(false)
    setTextoInterino('')
  }, [])

  const iniciar = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SpeechRecognitionImpl = w.SpeechRecognition || w.webkitSpeechRecognition

    if (!SpeechRecognitionImpl) return

    const rec = new SpeechRecognitionImpl()
    rec.lang = 'es-ES'
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      let definitivo = ''
      let interino = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultado = event.results[i]
        if (resultado.isFinal) {
          definitivo += resultado[0].transcript + ' '
        } else {
          interino += resultado[0].transcript
        }
      }

      if (definitivo) {
        setTextoAcumulado((prev) => {
          const nuevo = prev + definitivo
          onTranscripcion(nuevo)
          return nuevo
        })
      }
      setTextoInterino(interino)
    }

    rec.onerror = () => {
      detener()
    }

    rec.onend = () => {
      setGrabando(false)
      setTextoInterino('')
    }

    reconocimientoRef.current = rec
    rec.start()
    setGrabando(true)
  }, [detener, onTranscripcion])

  const limpiar = () => {
    setTextoAcumulado('')
    setTextoInterino('')
    onTranscripcion('')
  }

  if (!soportado) {
    return (
      <div
        className="rounded-lg p-4 text-sm"
        style={{
          background: 'var(--color-bg-elevated)',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        Tu navegador no soporta grabación de voz en tiempo real. Usa Chrome, Edge o Safari para esta función.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={grabando ? 'destructive' : 'default'}
          onClick={grabando ? detener : iniciar}
        >
          {grabando ? (
            <>
              <MicOff size={14} className="mr-1" /> Detener grabación
            </>
          ) : (
            <>
              <Mic size={14} className="mr-1" /> Grabar en vivo
            </>
          )}
        </Button>

        {textoAcumulado && (
          <Button type="button" size="sm" variant="ghost" onClick={limpiar}>
            <RotateCcw size={13} className="mr-1" /> Limpiar
          </Button>
        )}

        {grabando && (
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: 'var(--color-accent-red)' }}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            Grabando...
          </span>
        )}
      </div>

      {(textoAcumulado || textoInterino) && (
        <div
          className="rounded-lg p-3 min-h-[80px] text-sm leading-relaxed"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {textoAcumulado}
          {textoInterino && (
            <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              {textoInterino}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
