'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Radio,
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  Sparkles,
  Save,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function extractYoutubeId(url: string): string | null {
  if (!url.trim()) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PredicaEnVivoPage() {
  const router = useRouter()

  // YouTube
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const videoId = extractYoutubeId(youtubeUrl)

  // Transcription
  const [transcripcion, setTranscripcion] = useState('')
  const [textoInterino, setTextoInterino] = useState('')
  const [grabando, setGrabando] = useState(false)
  const [pausado, setPausado] = useState(false)
  const [soportado, setSoportado] = useState(false)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reconocimientoRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Summary
  const [resumen, setResumen] = useState('')
  const [generandoResumen, setGenerandoResumen] = useState(false)
  const [errorResumen, setErrorResumen] = useState('')

  // Save
  const [titulo, setTitulo] = useState('')
  const [predicador, setPredicador] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState('')

  // Copy state
  const [copiado, setCopiado] = useState(false)

  /* ---- Check speech API support ---- */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      setSoportado(!!(w.SpeechRecognition || w.webkitSpeechRecognition))
    }
  }, [])

  /* ---- Auto scroll textarea ---- */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [transcripcion, textoInterino])

  /* ---- Timer ---- */
  const startTimer = () => {
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
  }
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }
  const resetTimer = () => {
    stopTimer()
    setTimer(0)
  }

  /* ---- Stop recognition ---- */
  const detener = useCallback(() => {
    reconocimientoRef.current?.stop()
    reconocimientoRef.current = null
    setGrabando(false)
    setPausado(false)
    setTextoInterino('')
    stopTimer()
  }, [])

  /* ---- Start recognition ---- */
  const iniciar = useCallback(() => {
    if (typeof window === 'undefined') return
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
        setTranscripcion((prev) => prev + definitivo)
      }
      setTextoInterino(interino)
    }

    rec.onerror = () => {
      detener()
    }

    rec.onend = () => {
      // If still supposed to be recording, restart (browser auto-stops after silence)
      if (grabando && !pausado) {
        try {
          rec.start()
        } catch {
          setGrabando(false)
          stopTimer()
        }
      } else {
        setGrabando(false)
        setTextoInterino('')
        stopTimer()
      }
    }

    reconocimientoRef.current = rec
    rec.start()
    setGrabando(true)
    setPausado(false)
    startTimer()
  }, [detener, grabando, pausado])

  const pausar = useCallback(() => {
    reconocimientoRef.current?.stop()
    setPausado(true)
    setGrabando(false)
    setTextoInterino('')
    stopTimer()
  }, [])

  const reanudar = useCallback(() => {
    setPausado(false)
    iniciar()
  }, [iniciar])

  /* ---- Copy transcription ---- */
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(transcripcion)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // ignore
    }
  }

  /* ---- Generate summary ---- */
  const generarResumen = async () => {
    if (!transcripcion.trim()) return
    setGenerandoResumen(true)
    setErrorResumen('')
    setResumen('')
    try {
      const prompt = `Resume esta predica en puntos clave, versículos citados, y aplicación práctica:\n\n${transcripcion.trim()}`
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      })
      if (res.ok) {
        const data = await res.json()
        setResumen(data.response ?? '')
      } else {
        setErrorResumen('no_api')
      }
    } catch {
      setErrorResumen('no_api')
    } finally {
      setGenerandoResumen(false)
    }
  }

  /* ---- Save ---- */
  const guardar = async () => {
    if (!titulo.trim() || !predicador.trim()) {
      setErrorGuardar('Título y predicador son requeridos')
      return
    }
    setGuardando(true)
    setErrorGuardar('')
    try {
      const res = await fetch('/api/predicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          predicador: predicador.trim(),
          fecha: new Date().toISOString().split('T')[0],
          transcripcion: transcripcion.trim() || null,
          resumen: resumen || null,
          estado: 'COMPLETA',
        }),
      })
      if (res.ok) {
        setGuardadoOk(true)
        setTimeout(() => router.push('/predicas'), 1500)
      } else {
        const body = await res.json().catch(() => ({}))
        setErrorGuardar(body?.error ?? 'Error al guardar')
      }
    } catch {
      setErrorGuardar('Error de conexión')
    } finally {
      setGuardando(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/predicas" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Radio size={22} style={{ color: 'var(--color-accent-red)' }} />
            Prédica en Vivo
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Transcripción en tiempo real y resumen con IA
          </p>
        </div>
      </div>

      {/* ===== SECTION 1: YouTube Player ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ExternalLink size={16} style={{ color: 'var(--color-accent-red)' }} />
            Transmisión de YouTube (opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Pega el enlace de YouTube (live o normal)..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1"
            />
            {youtubeUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setYoutubeUrl('')}
              >
                Limpiar
              </Button>
            )}
          </div>

          {videoId && (
            <div
              className="rounded-xl overflow-hidden"
              style={{ aspectRatio: '16/9', background: '#000' }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          {youtubeUrl && !videoId && (
            <p className="text-xs" style={{ color: 'var(--color-accent-amber)' }}>
              No se pudo extraer el ID del video. Verifica el enlace.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ===== SECTION 2: Live Transcription ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mic size={16} style={{ color: 'var(--color-accent-green)' }} />
            Transcripción en Vivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!soportado ? (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-muted)',
              }}
            >
              Tu navegador no soporta reconocimiento de voz en tiempo real. Usa Chrome, Edge o Safari para esta función.
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {!grabando && !pausado && (
                  <Button
                    onClick={iniciar}
                    className="flex items-center gap-2 font-semibold"
                    style={{ background: 'var(--color-accent-green)', color: '#fff' }}
                  >
                    <Mic size={16} />
                    Iniciar Escucha Activa
                  </Button>
                )}

                {grabando && (
                  <>
                    <Button
                      onClick={pausar}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Pause size={15} /> Pausar
                    </Button>
                    <Button
                      onClick={detener}
                      className="flex items-center gap-2"
                      style={{ background: 'var(--color-accent-red)', color: '#fff' }}
                    >
                      <Square size={15} /> Detener
                    </Button>
                  </>
                )}

                {pausado && (
                  <>
                    <Button
                      onClick={reanudar}
                      className="flex items-center gap-2"
                      style={{ background: 'var(--color-accent-green)', color: '#fff' }}
                    >
                      <Play size={15} /> Reanudar
                    </Button>
                    <Button
                      onClick={detener}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Square size={15} /> Detener
                    </Button>
                  </>
                )}

                {/* Timer */}
                {(grabando || pausado || timer > 0) && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                      color: grabando
                        ? 'var(--color-accent-red)'
                        : 'var(--color-text-muted)',
                    }}
                  >
                    {grabando && (
                      <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: 'var(--color-accent-red)' }}
                      />
                    )}
                    {formatTimer(timer)}
                  </div>
                )}

                {grabando && (
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--color-accent-red)' }}
                  >
                    Escuchando...
                  </span>
                )}
                {pausado && (
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--color-accent-amber)' }}
                  >
                    En pausa
                  </span>
                )}
              </div>

              {/* Transcription text area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    Transcripción (editable)
                  </label>
                  {transcripcion && (
                    <button
                      onClick={copiar}
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--color-accent-blue)' }}
                    >
                      {copiado ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                    </button>
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  value={transcripcion + (textoInterino ? ` ${textoInterino}` : '')}
                  onChange={(e) => {
                    // Allow editing: strip interim portion on change
                    setTranscripcion(e.target.value)
                    setTextoInterino('')
                  }}
                  placeholder={
                    grabando
                      ? 'El texto aparecerá aquí mientras hablas...'
                      : 'La transcripción aparecerá aquí. Puedes editar el texto manualmente.'
                  }
                  rows={10}
                  className="w-full px-3 py-2.5 rounded-lg text-sm leading-relaxed resize-none"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: grabando
                      ? '1px solid var(--color-accent-green)'
                      : '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'inherit',
                  }}
                />
                {transcripcion && (
                  <p className="text-xs text-right" style={{ color: 'var(--color-text-muted)' }}>
                    {transcripcion.split(/\s+/).filter(Boolean).length} palabras
                  </p>
                )}
              </div>

              {/* Tip */}
              <div
                className="rounded-lg px-3 py-2.5 text-xs"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <strong>Consejo:</strong> Asegúrate de que el audio de la transmisión llegue al micrófono de tu dispositivo. En computadoras, puedes usar auriculares cerca del parlante.
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ===== SECTION 3: AI Summary ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles size={16} style={{ color: 'var(--color-accent-purple)' }} />
            Resumen con IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!transcripcion.trim() ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Genera una transcripción primero para poder resumirla.
            </p>
          ) : (
            <>
              <Button
                onClick={generarResumen}
                disabled={generandoResumen}
                className="flex items-center gap-2"
                style={{ background: 'var(--color-accent-purple)', color: '#fff' }}
              >
                <Sparkles size={15} />
                {generandoResumen ? 'Generando resumen...' : 'Generar Resumen'}
              </Button>

              {errorResumen === 'no_api' && (
                <div
                  className="rounded-lg px-4 py-3 text-sm space-y-2"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <p className="font-medium">Sin conexión al asistente de IA</p>
                  <p>Copia el texto de la transcripción y pégalo en ChatGPT con este prompt:</p>
                  <div
                    className="rounded px-3 py-2 text-xs font-mono select-all"
                    style={{
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Resume esta predica en puntos clave, versículos citados, y aplicación práctica:
                  </div>
                </div>
              )}

              {resumen && (
                <div
                  className="rounded-xl px-5 py-4 space-y-2"
                  style={{
                    background: 'var(--color-accent-purple-soft, rgba(139,92,246,0.08))',
                    border: '1px solid var(--color-accent-purple)',
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-accent-purple)' }}
                  >
                    Resumen generado
                  </p>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {resumen}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ===== SECTION 4: Save ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Save size={16} style={{ color: 'var(--color-accent-blue)' }} />
            Guardar Prédica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo-predica">Título *</Label>
              <Input
                id="titulo-predica"
                placeholder="Ej: Prédica del domingo 13 de abril"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="predicador">Predicador *</Label>
              <Input
                id="predicador"
                placeholder="Ej: Pastor Javier Rodríguez"
                value={predicador}
                onChange={(e) => setPredicador(e.target.value)}
              />
            </div>
          </div>

          {errorGuardar && (
            <p className="text-sm" style={{ color: 'var(--color-accent-red)' }}>
              {errorGuardar}
            </p>
          )}

          {guardadoOk ? (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
              style={{
                background: 'var(--color-accent-green-soft)',
                color: 'var(--color-accent-green)',
                border: '1px solid var(--color-accent-green)',
              }}
            >
              <Check size={16} /> Prédica guardada. Redirigiendo...
            </div>
          ) : (
            <Button
              onClick={guardar}
              disabled={guardando || !titulo.trim() || !predicador.trim()}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Save size={15} />
              {guardando ? 'Guardando...' : 'Guardar Prédica'}
            </Button>
          )}

          {!transcripcion.trim() && (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Puedes guardar la prédica aunque no haya transcripción.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
