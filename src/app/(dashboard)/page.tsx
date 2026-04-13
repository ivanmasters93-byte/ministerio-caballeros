'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Network, Calendar, Heart, Megaphone, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  hermanos?: { total?: number; nuevos?: number; requierenSeguimiento?: number; inactivos?: number }
  redes?: { total?: number; conLideres?: number }
  eventos?: { total?: number; proximosSiete?: number; proximos?: Array<{ id: string; titulo: string; fecha: string; hora?: string; tipo?: string; red?: { nombre: string }; zoomLink?: string; youtubeLink?: string }> }
  anuncios?: { activos?: number; recientes?: Array<{ id: string; titulo: string; prioridad: string; contenido?: string; createdAt: string }> }
  peticionesOracion?: { activas?: number; urgentes?: number }
  oracion?: { peticionesPendientes?: number }
  seguimiento?: { abiertos?: number; requierenContacto?: number }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )

  const statCards = [
    { label: 'Total Hermanos', value: stats?.hermanos?.total ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/hermanos' },
    { label: 'Redes Activas', value: stats?.redes?.total ?? 0, icon: Network, color: 'text-green-600', bg: 'bg-green-50', href: '/redes' },
    { label: 'Eventos (7 días)', value: stats?.eventos?.proximosSiete ?? 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', href: '/agenda' },
    { label: 'Peticiones Pendientes', value: stats?.oracion?.peticionesPendientes ?? 0, icon: Heart, color: 'text-red-600', bg: 'bg-red-50', href: '/oracion' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Panel General</h2>
          <p className="text-gray-500 text-sm">GEDEONES — Ministerio de Caballeros</p>
        </div>
        <div className="flex gap-2">
          <Link href="/hermanos"><Button variant="outline" size="sm">+ Hermano</Button></Link>
          <Link href="/agenda"><Button size="sm">+ Evento</Button></Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.bg}`}>
                    <card.icon size={20} className={card.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Próximos Eventos</CardTitle>
              <Link href="/agenda" className="text-blue-600 text-sm hover:underline">Ver todos</Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.eventos?.proximos?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No hay eventos próximos</p>
            ) : (
              <div className="space-y-3">
                {stats?.eventos?.proximos?.map((evento) => (
                  <div key={evento.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 rounded-lg p-2 text-center min-w-[48px]">
                      <p className="text-blue-800 font-bold text-lg leading-tight">
                        {new Date(evento.fecha).getDate()}
                      </p>
                      <p className="text-blue-600 text-xs uppercase">
                        {new Date(evento.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{evento.titulo}</p>
                      <p className="text-gray-500 text-xs">{evento.hora} · {evento.tipo}</p>
                      {evento.red && <Badge variant="outline" className="mt-1 text-xs">{evento.red.nombre}</Badge>}
                      <div className="flex gap-2 mt-1">
                        {evento.zoomLink && <a href={evento.zoomLink} target="_blank" className="text-xs text-blue-600 hover:underline">Zoom ↗</a>}
                        {evento.youtubeLink && <a href={evento.youtubeLink} target="_blank" className="text-xs text-red-600 hover:underline">YouTube ↗</a>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Anuncios Recientes</CardTitle>
              <Link href="/anuncios" className="text-blue-600 text-sm hover:underline">Ver todos</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.anuncios?.recientes?.map((anuncio) => (
                <div key={anuncio.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Megaphone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm truncate">{anuncio.titulo}</p>
                      <Badge variant={anuncio.prioridad === 'URGENTE' ? 'danger' : anuncio.prioridad === 'ALTA' ? 'warning' : 'secondary'}>
                        {anuncio.prioridad}
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{anuncio.contenido}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-up alerts */}
      {(stats?.hermanos?.requierenSeguimiento ?? 0) > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">
                    {stats?.hermanos?.requierenSeguimiento ?? 0} hermano{(stats?.hermanos?.requierenSeguimiento ?? 0) > 1 ? 's' : ''} requiere{(stats?.hermanos?.requierenSeguimiento ?? 0) === 1 ? '' : 'n'} seguimiento
                  </p>
                  <p className="text-amber-700 text-sm">Hay casos abiertos pendientes de atención</p>
                </div>
              </div>
              <Link href="/seguimiento">
                <Button size="sm" variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-100">
                  Ver casos <ChevronRight size={14} />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
