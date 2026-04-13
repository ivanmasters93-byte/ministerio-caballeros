'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PredicaCard, PredicaCardData } from '@/components/predicas/PredicaCard'
import { ResumenPredica } from '@/components/predicas/ResumenPredica'
import { TranscripcionViewer } from '@/components/predicas/TranscripcionViewer'
import {
  Mic,
  Plus,
  Search,
  X,
  ArrowLeft,
  FileText,
  CheckCircle,
  Wand2,
  Calendar,
} from 'lucide-react'

interface PredicaDetalle extends PredicaCardData {
  transcripcion?: string | null
  resumen?: string | null
  puntosClave?: string | null
  preguntasReflexion?: string | null
  versiculosCitados?: string | null
  creador?: { name: string } | null
}

interface PaginatedResponse {
  data: PredicaDetalle[]
  pagination: {
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

type Tab = 'lista' | 'detalle'

export default function PredicasPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('lista')
  const [predicas, setPredicas] = useState<PredicaDetalle[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [predicaActiva, setPredicaActiva] = useState<PredicaDetalle | null>(null)
  const [procesandoId, setProcesandoId] = useState<string | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null)

  const fetchPredicas = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filtroEstado) params.set('estado', filtroEstado)
      params.set('limit', '50')

      const res = await fetch(`/api/predicas?${params}`)
      if (!res.ok) throw new Error('Error cargando prédicas')
      const data: PaginatedResponse = await res.json()
      setPredicas(data.data)
      setTotal(data.pagination.total)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredicas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPredicas()
  }

  const handleView = async (id: string) => {
    try {
      const res = await fetch(`/api/predicas/${id}`)
      if (!res.ok) return
      const data: PredicaDetalle = await res.json()
      setPredicaActiva(data)
      setTab('detalle')
    } catch {
      // silent
    }
  }

  const handleTranscribir = async (id: string) => {
    setProcesandoId(id)
    try {
      const res = await fetch(`/api/predicas/${id}/transcribir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcripcion: '' }),
      })
      if (res.ok) {
        await fetchPredicas()
      }
    } catch {
      // silent
    } finally {
      setProcesandoId(null)
    }
  }

  const handleResumir = async (id: string) => {
    setProcesandoId(id)
    try {
      const res = await fetch(`/api/predicas/${id}/resumir`, { method: 'POST' })
      if (res.ok) {
        const updated: PredicaDetalle = await res.json()
        if (predicaActiva?.id === id) {
          setPredicaActiva(updated)
        }
        await fetchPredicas()
      }
    } catch {
      // silent
    } finally {
      setProcesandoId(null)
    }
  }

  const handleEliminar = async (id: string) => {
    if (confirmEliminar !== id) {
      setConfirmEliminar(id)
      return
    }
    try {
      const res = await fetch(`/api/predicas/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPredicas((prev) => prev.filter((p) => p.id !== id))
        setTotal((t) => t - 1)
        if (predicaActiva?.id === id) {
          setPredicaActiva(null)
          setTab('lista')
        }
      }
    } catch {
      // silent
    } finally {
      setConfirmEliminar(null)
    }
  }

  // Stats
  const totalTranscritas = predicas.filter((p) =>
    ['TRANSCRITA', 'PROCESANDO', 'COMPLETA'].includes(p.estado)
  ).length
  const totalCompletas = predicas.filter((p) => p.estado === 'COMPLETA').length
  const esteMes = predicas.filter((p) => {
    const fecha = new Date(p.fecha)
    const ahora = new Date()
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
  }).length

  const estadoFiltros = [
    { value: '', label: 'Todos' },
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'TRANSCRITA', label: 'Transcritas' },
    { value: 'COMPLETA', label: 'Completas' },
  ]

  // Parse JSON fields safely
  const parseJson = (str?: string | null): string[] => {
    if (!str) return []
    try {
      const parsed = JSON.parse(str)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  if (tab === 'detalle' && predicaActiva) {
    return (
      <div className="space-y-6">
        {/* Header detalle */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTab('lista')
              setPredicaActiva(null)
            }}
          >
            <ArrowLeft size={16} className="mr-1" /> Volver
          </Button>
          <div className="flex-1 min-w-0">
            <h2
              className="text-xl font-bold truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {predicaActiva.titulo}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {predicaActiva.predicador}
            </p>
          </div>
          <Badge
            variant={
              predicaActiva.estado === 'COMPLETA'
                ? 'success'
                : predicaActiva.estado === 'TRANSCRITA'
                ? 'default'
                : 'secondary'
            }
          >
            {predicaActiva.estado}
          </Badge>
        </div>

        {/* Acciones del detalle */}
        {(predicaActiva.estado === 'PENDIENTE' || predicaActiva.estado === 'ERROR') && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Esta prédica aún no tiene transcripción. Puedes subirla manualmente desde la página de edición o usar la transcripción por voz.
              </p>
            </CardContent>
          </Card>
        )}

        {predicaActiva.estado === 'TRANSCRITA' && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleResumir(predicaActiva.id)}
              disabled={procesandoId === predicaActiva.id}
            >
              <Wand2 size={14} className="mr-1" />
              {procesandoId === predicaActiva.id ? 'Generando...' : 'Generar Resumen con IA'}
            </Button>
          </div>
        )}

        {/* Resumen */}
        {predicaActiva.resumen && (
          <ResumenPredica
            resumen={predicaActiva.resumen}
            puntosClave={parseJson(predicaActiva.puntosClave)}
            preguntasReflexion={parseJson(predicaActiva.preguntasReflexion)}
            versiculosCitados={parseJson(predicaActiva.versiculosCitados)}
            titulo={predicaActiva.titulo}
            predicador={predicaActiva.predicador}
          />
        )}

        {/* Transcripción */}
        {predicaActiva.transcripcion && (
          <TranscripcionViewer transcripcion={predicaActiva.transcripcion} />
        )}

        {!predicaActiva.transcripcion && !predicaActiva.resumen && (
          <Card>
            <CardContent className="py-12 text-center">
              <Mic size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No hay contenido disponible aún.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => router.push(`/predicas/nueva?id=${predicaActiva.id}`)}
              >
                Agregar transcripción
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Mic size={22} style={{ color: 'var(--color-accent-gold)' }} />
            Prédicas
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Transcripción y resúmenes automáticos de sermones
          </p>
        </div>
        <Button size="sm" onClick={() => router.push('/predicas/nueva')}>
          <Plus size={14} className="mr-1" /> Nueva Prédica
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, icon: Mic, color: 'var(--color-accent-gold)' },
          { label: 'Transcritas', value: totalTranscritas, icon: FileText, color: 'var(--color-accent-blue)' },
          { label: 'Con resumen', value: totalCompletas, icon: CheckCircle, color: 'var(--color-accent-green)' },
          { label: 'Este mes', value: esteMes, icon: Calendar, color: 'var(--color-accent-amber)' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {stat.label}
                </span>
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Busqueda y filtros */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <Input
                placeholder="Buscar por título o predicador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  fetchPredicas()
                }}
              >
                <X size={14} />
              </Button>
            )}
            <Button type="submit" size="sm" variant="outline">
              Buscar
            </Button>
          </form>

          <div className="flex gap-2 flex-wrap">
            {estadoFiltros.map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltroEstado(f.value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background:
                    filtroEstado === f.value
                      ? 'var(--color-accent-gold)'
                      : 'var(--color-bg-elevated)',
                  color:
                    filtroEstado === f.value
                      ? '#0c0e14'
                      : 'var(--color-text-secondary)',
                  border: '1px solid transparent',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirm eliminar banner */}
      {confirmEliminar && (
        <div
          className="rounded-lg px-4 py-3 flex items-center justify-between"
          style={{
            background: 'var(--color-accent-red-soft)',
            border: '1px solid var(--color-accent-red)',
          }}
        >
          <span className="text-sm" style={{ color: 'var(--color-accent-red)' }}>
            Confirma que deseas eliminar esta prédica. Esta acción no se puede deshacer.
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleEliminar(confirmEliminar)}
            >
              Eliminar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmEliminar(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-xl animate-pulse"
              style={{ background: 'var(--color-bg-elevated)' }}
            />
          ))}
        </div>
      ) : predicas.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Mic size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              No hay prédicas registradas
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Registra la primera prédica para comenzar
            </p>
            <Button size="sm" onClick={() => router.push('/predicas/nueva')}>
              <Plus size={14} className="mr-1" /> Nueva Prédica
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predicas.map((predica) => (
            <PredicaCard
              key={predica.id}
              predica={predica}
              onView={handleView}
              onTranscribir={handleTranscribir}
              onResumir={handleResumir}
              onEliminar={handleEliminar}
              procesando={procesandoId === predica.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
