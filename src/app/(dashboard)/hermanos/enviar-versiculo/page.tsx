'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  BookOpen,
  Users,
  MessageCircle,
  Send,
  Check,
  ChevronRight,
  Search,
} from 'lucide-react'
import { LIBROS_BIBLIA, LibroBiblia } from '@/lib/biblia/libros'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Hermano {
  id: string
  estado: string
  user?: {
    name?: string
    phone?: string
    redes?: Array<{ red?: { nombre?: string; tipo?: string } }>
  }
  red?: { nombre?: string; tipo?: string }
}

interface Red {
  id: string
  nombre: string
  tipo: string
}

interface Versiculo {
  libro: string
  capitulo: number
  versiculo: number
  texto: string
  referencia: string
}

type Paso = 1 | 2 | 3

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPhone(phone?: string) {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

function buildWaUrl(phone: string, texto: string): string {
  const clean = formatPhone(phone)
  if (!clean) return ''
  return `https://wa.me/${clean}?text=${encodeURIComponent(texto)}`
}

function buildMensaje(versiculo: Versiculo | null, mensajeCustom: string): string {
  if (mensajeCustom.trim()) return mensajeCustom.trim()
  if (!versiculo) return ''
  return `"${versiculo.texto}" — ${versiculo.referencia}`
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EnviarVersiculoPage() {
  const searchParams = useSearchParams()
  const hermanoIdParam = searchParams.get('hermanoId')

  const [paso, setPaso] = useState<Paso>(1)

  // Step 1: Verse selection
  const [libroSeleccionado, setLibroSeleccionado] = useState<LibroBiblia | null>(null)
  const [capitulo, setCapitulo] = useState<number>(1)
  const [versiculos, setVersiculos] = useState<Versiculo[]>([])
  const [versiculoSeleccionado, setVersiculoSeleccionado] = useState<Versiculo | null>(null)
  const [mensajeCustom, setMensajeCustom] = useState('')
  const [cargandoVersiculos, setCargandoVersiculos] = useState(false)
  const [filtroLibro, setFiltroLibro] = useState('')
  const [testamentoFiltro, setTestamentoFiltro] = useState<'todos' | 'AT' | 'NT'>('todos')

  // Step 2: Recipients
  const [hermanos, setHermanos] = useState<Hermano[]>([])
  const [redes, setRedes] = useState<Red[]>([])
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [modoSeleccion, setModoSeleccion] = useState<'individual' | 'red' | 'todos'>('individual')
  const [redFiltro, setRedFiltro] = useState('')
  const [cargandoHermanos, setCargandoHermanos] = useState(false)

  // Step 3: Preview & send
  const [enviados, setEnviados] = useState<Set<string>>(new Set())
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)

  /* ---- Load hermanos & redes ---- */
  useEffect(() => {
    setCargandoHermanos(true)
    Promise.all([
      fetch('/api/hermanos').then((r) => r.json()),
      fetch('/api/redes').then((r) => r.json()),
    ])
      .then(([hData, rData]) => {
        const hList: Hermano[] = Array.isArray(hData) ? hData : hData?.data ?? []
        setHermanos(hList)
        setRedes(Array.isArray(rData) ? rData : rData?.data ?? [])

        // Pre-select if navigated from hermano detail
        if (hermanoIdParam) {
          setSeleccionados(new Set([hermanoIdParam]))
          setModoSeleccion('individual')
        }
      })
      .catch(() => {})
      .finally(() => setCargandoHermanos(false))
  }, [hermanoIdParam])

  /* ---- Load versiculos when libro+capitulo changes ---- */
  const cargarVersiculos = useCallback(
    async (libro: LibroBiblia, cap: number) => {
      setCargandoVersiculos(true)
      setVersiculos([])
      setVersiculoSeleccionado(null)
      try {
        const res = await fetch(
          `/api/biblia/versiculo?libro=${encodeURIComponent(libro.nombre)}&capitulo=${cap}`
        )
        const data = await res.json()
        setVersiculos(Array.isArray(data.versiculos) ? data.versiculos : [])
      } catch {
        setVersiculos([])
      } finally {
        setCargandoVersiculos(false)
      }
    },
    []
  )

  const handleSelectLibro = (libro: LibroBiblia) => {
    setLibroSeleccionado(libro)
    setCapitulo(1)
    setVersiculoSeleccionado(null)
    cargarVersiculos(libro, 1)
  }

  const handleCapituloChange = (cap: number) => {
    setCapitulo(cap)
    if (libroSeleccionado) cargarVersiculos(libroSeleccionado, cap)
  }

  /* ---- Recipient helpers ---- */
  const hermanosFiltrados = hermanos.filter((h) => {
    if (!redFiltro) return true
    const redNombre =
      h.user?.redes?.[0]?.red?.nombre ?? h.red?.nombre ?? ''
    return redNombre.toLowerCase().includes(redFiltro.toLowerCase())
  })

  const toggleHermano = (id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const seleccionarTodos = () => {
    setSeleccionados(new Set(hermanosFiltrados.map((h) => h.id)))
  }

  const deseleccionarTodos = () => {
    setSeleccionados(new Set())
  }

  const seleccionarPorRed = (nombreRed: string) => {
    const ids = hermanos
      .filter((h) => {
        const rn = h.user?.redes?.[0]?.red?.nombre ?? h.red?.nombre ?? ''
        return rn.toLowerCase() === nombreRed.toLowerCase()
      })
      .map((h) => h.id)
    setSeleccionados(new Set(ids))
  }

  /* ---- Send helpers ---- */
  const destinatarios = hermanos.filter((h) => seleccionados.has(h.id))
  const mensajeFinal = buildMensaje(versiculoSeleccionado, mensajeCustom)

  const puedeIrAPaso2 = mensajeFinal.trim().length > 0
  const puedeIrAPaso3 = seleccionados.size > 0

  const marcarEnviado = (id: string) => {
    setEnviados((prev) => new Set([...prev, id]))
  }

  const guardarComoNotificacion = async () => {
    if (!mensajeFinal || destinatarios.length === 0) return
    setGuardando(true)
    try {
      // Save as an anuncio (notification to the group)
      await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: versiculoSeleccionado
            ? `Versículo: ${versiculoSeleccionado.referencia}`
            : 'Mensaje enviado',
          contenido: mensajeFinal,
          prioridad: 'NORMAL',
          activo: true,
        }),
      })
      setGuardadoOk(true)
    } catch {
      // silent — WhatsApp links still work
    } finally {
      setGuardando(false)
    }
  }

  /* ---- Book list filtered ---- */
  const librosFiltrados = LIBROS_BIBLIA.filter((l) => {
    const matchTestamento =
      testamentoFiltro === 'todos' || l.testamento === testamentoFiltro
    const matchNombre = l.nombre
      .toLowerCase()
      .includes(filtroLibro.toLowerCase())
    return matchTestamento && matchNombre
  })

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/hermanos" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Enviar Versículo
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Comparte la Palabra con uno o varios hermanos
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: 'Versículo' },
          { n: 2, label: 'Destinatarios' },
          { n: 3, label: 'Enviar' },
        ].map(({ n, label }, i, arr) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                paso === n
                  ? 'text-white'
                  : paso > n
                  ? 'text-white'
                  : 'text-gray-400'
              }`}
              style={{
                background:
                  paso === n
                    ? 'var(--color-accent-gold)'
                    : paso > n
                    ? 'var(--color-accent-green)'
                    : 'var(--color-bg-elevated)',
                border:
                  paso <= n ? '2px solid var(--color-border-subtle)' : 'none',
              }}
            >
              {paso > n ? <Check size={14} /> : n}
            </div>
            <span
              className="text-sm font-medium hidden sm:inline"
              style={{
                color:
                  paso === n
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-muted)',
              }}
            >
              {label}
            </span>
            {i < arr.length - 1 && (
              <ChevronRight
                size={14}
                style={{ color: 'var(--color-border-subtle)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* =============================== PASO 1 =============================== */}
      {paso === 1 && (
        <div className="space-y-4">
          {/* Custom message option */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen size={18} style={{ color: 'var(--color-accent-gold)' }} />
                Mensaje personalizado (opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={mensajeCustom}
                onChange={(e) => setMensajeCustom(e.target.value)}
                placeholder="Escribe un versículo de memoria o un mensaje personalizado..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                }}
              />
              {mensajeCustom.trim() && (
                <p className="mt-2 text-xs" style={{ color: 'var(--color-accent-green)' }}>
                  Se enviará este mensaje personalizado
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bible selector */}
          {!mensajeCustom.trim() && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">O selecciona un versículo bíblico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                    <Input
                      placeholder="Buscar libro..."
                      value={filtroLibro}
                      onChange={(e) => setFiltroLibro(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="flex gap-1">
                    {(['todos', 'AT', 'NT'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTestamentoFiltro(t)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background:
                            testamentoFiltro === t
                              ? 'var(--color-accent-gold)'
                              : 'var(--color-bg-elevated)',
                          color:
                            testamentoFiltro === t
                              ? '#fff'
                              : 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        {t === 'todos' ? 'Todos' : t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Book list */}
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {librosFiltrados.map((libro) => (
                    <button
                      key={libro.id}
                      onClick={() => handleSelectLibro(libro)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all"
                      style={{
                        background:
                          libroSeleccionado?.id === libro.id
                            ? 'var(--color-accent-gold-soft)'
                            : 'var(--color-bg-elevated)',
                        border:
                          libroSeleccionado?.id === libro.id
                            ? '1px solid var(--color-accent-gold)'
                            : '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <span className="truncate font-medium">{libro.nombre}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto shrink-0">
                        {libro.abreviatura}
                      </Badge>
                    </button>
                  ))}
                </div>

                {/* Chapter selector */}
                {libroSeleccionado && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Capítulo — {libroSeleccionado.nombre}
                    </p>
                    <div
                      className="flex flex-wrap gap-1 max-h-32 overflow-y-auto"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {Array.from({ length: libroSeleccionado.capitulos }, (_, i) => i + 1).map(
                        (c) => (
                          <button
                            key={c}
                            onClick={() => handleCapituloChange(c)}
                            className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                            style={{
                              background:
                                capitulo === c
                                  ? 'var(--color-accent-gold)'
                                  : 'var(--color-bg-elevated)',
                              color: capitulo === c ? '#fff' : 'var(--color-text-secondary)',
                              border: '1px solid var(--color-border-subtle)',
                            }}
                          >
                            {c}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Verse selector */}
                {libroSeleccionado && versiculos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Versículo
                    </p>
                    <div
                      className="space-y-1.5 max-h-64 overflow-y-auto pr-1"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {versiculos.map((v) => (
                        <button
                          key={v.versiculo}
                          onClick={() => setVersiculoSeleccionado(v)}
                          className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                          style={{
                            background:
                              versiculoSeleccionado?.versiculo === v.versiculo
                                ? 'var(--color-accent-gold-soft)'
                                : 'var(--color-bg-elevated)',
                            border:
                              versiculoSeleccionado?.versiculo === v.versiculo
                                ? '1px solid var(--color-accent-gold)'
                                : '1px solid var(--color-border-subtle)',
                          }}
                        >
                          <span
                            className="text-xs font-bold mt-0.5 shrink-0 w-5"
                            style={{ color: 'var(--color-accent-gold)' }}
                          >
                            {v.versiculo}
                          </span>
                          <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                            {v.texto}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {cargandoVersiculos && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                    Cargando versículos...
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {(versiculoSeleccionado || mensajeCustom.trim()) && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Vista previa del mensaje
                </p>
                <div
                  className="rounded-lg px-4 py-3 text-sm leading-relaxed italic"
                  style={{
                    background: 'var(--color-accent-gold-soft)',
                    border: '1px solid var(--color-accent-gold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {mensajeFinal}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              disabled={!puedeIrAPaso2}
              onClick={() => setPaso(2)}
              className="flex items-center gap-2"
            >
              Elegir destinatarios <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* =============================== PASO 2 =============================== */}
      {paso === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users size={18} style={{ color: 'var(--color-accent-blue)' }} />
                Seleccionar destinatarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode selector */}
              <div className="flex gap-2 flex-wrap">
                {(['individual', 'red', 'todos'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setModoSeleccion(m)
                      if (m === 'todos') seleccionarTodos()
                      else if (m === 'individual') deseleccionarTodos()
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                    style={{
                      background:
                        modoSeleccion === m
                          ? 'var(--color-accent-blue)'
                          : 'var(--color-bg-elevated)',
                      color: modoSeleccion === m ? '#fff' : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    {m === 'individual' ? 'Individual' : m === 'red' ? 'Por Red' : 'Todos'}
                  </button>
                ))}
              </div>

              {/* By red */}
              {modoSeleccion === 'red' && redes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {redes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => seleccionarPorRed(r.nombre)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      Red {r.nombre}
                    </button>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <Input
                  placeholder="Filtrar por red..."
                  value={redFiltro}
                  onChange={(e) => setRedFiltro(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Select/Deselect all */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={seleccionarTodos}
                    className="text-xs underline"
                    style={{ color: 'var(--color-accent-blue)' }}
                  >
                    Todos
                  </button>
                  <button
                    onClick={deseleccionarTodos}
                    className="text-xs underline"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Ninguno
                  </button>
                </div>
              </div>

              {/* Hermano list */}
              {cargandoHermanos ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                  Cargando hermanos...
                </p>
              ) : (
                <div
                  className="space-y-1.5 max-h-72 overflow-y-auto pr-1"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {hermanosFiltrados.map((h) => {
                    const nombre = h.user?.name ?? 'Sin nombre'
                    const phone = h.user?.phone
                    const redNombre =
                      h.user?.redes?.[0]?.red?.nombre ?? h.red?.nombre ?? ''
                    const isSelected = seleccionados.has(h.id)
                    return (
                      <button
                        key={h.id}
                        onClick={() => toggleHermano(h.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                        style={{
                          background: isSelected
                            ? 'var(--color-accent-blue-soft)'
                            : 'var(--color-bg-elevated)',
                          border: isSelected
                            ? '1px solid var(--color-accent-blue)'
                            : '1px solid var(--color-border-subtle)',
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                          style={{
                            background: isSelected ? 'var(--color-accent-blue)' : 'transparent',
                            border: isSelected
                              ? 'none'
                              : '2px solid var(--color-border-subtle)',
                          }}
                        >
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {nombre}
                          </p>
                          {(redNombre || phone) && (
                            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                              {[redNombre, phone ? `+${formatPhone(phone).slice(0, 4)}...` : '']
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          )}
                        </div>
                        {!phone && (
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            Sin tel.
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setPaso(1)}>
              Atrás
            </Button>
            <Button disabled={!puedeIrAPaso3} onClick={() => setPaso(3)} className="flex items-center gap-2">
              Vista previa <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* =============================== PASO 3 =============================== */}
      {paso === 3 && (
        <div className="space-y-4">
          {/* Message preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mensaje a enviar</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg px-4 py-3 text-sm leading-relaxed italic"
                style={{
                  background: 'var(--color-accent-gold-soft)',
                  border: '1px solid var(--color-accent-gold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {mensajeFinal}
              </div>
            </CardContent>
          </Card>

          {/* Recipients with WhatsApp links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {destinatarios.length} destinatario{destinatarios.length !== 1 ? 's' : ''}
                </CardTitle>
                {destinatarios.every((h) => h.user?.phone) && (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {enviados.size} enviado{enviados.size !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {destinatarios.map((h) => {
                  const nombre = h.user?.name ?? 'Sin nombre'
                  const phone = h.user?.phone
                  const waUrl = phone ? buildWaUrl(phone, mensajeFinal) : null
                  const isEnviado = enviados.has(h.id)
                  return (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                      style={{
                        background: isEnviado
                          ? 'var(--color-accent-green-soft)'
                          : 'var(--color-bg-elevated)',
                        border: isEnviado
                          ? '1px solid var(--color-accent-green)'
                          : '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: 'var(--color-accent-gold-soft)',
                          color: 'var(--color-accent-gold)',
                        }}
                      >
                        {nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {nombre}
                        </p>
                        {phone ? (
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {phone}
                          </p>
                        ) : (
                          <p className="text-xs" style={{ color: 'var(--color-accent-amber)' }}>
                            Sin número de teléfono
                          </p>
                        )}
                      </div>
                      {waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => marcarEnviado(h.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: isEnviado ? 'var(--color-accent-green)' : '#25D366',
                            color: '#fff',
                          }}
                        >
                          {isEnviado ? (
                            <>
                              <Check size={13} /> Enviado
                            </>
                          ) : (
                            <>
                              <MessageCircle size={13} /> WhatsApp
                            </>
                          )}
                        </a>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Sin tel.
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Bulk open all */}
              {destinatarios.length > 1 && (
                <p className="text-xs mt-3 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  Haz clic en cada botón de WhatsApp para abrir el chat individual.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Save as notification */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Guardar en el sistema
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Registra este mensaje como anuncio interno
                  </p>
                </div>
                {guardadoOk ? (
                  <div
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background: 'var(--color-accent-green-soft)',
                      color: 'var(--color-accent-green)',
                    }}
                  >
                    <Check size={14} /> Guardado
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={guardarComoNotificacion}
                    disabled={guardando}
                    className="flex items-center gap-2"
                  >
                    <Send size={14} />
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setPaso(2)}>
              Atrás
            </Button>
            <Link href="/hermanos">
              <Button variant="outline">Volver a Hermanos</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
