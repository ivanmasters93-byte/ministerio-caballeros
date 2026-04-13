'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/table'
import { formatDate, formatDateShort } from '@/lib/utils'
import { ArrowLeft, Search, Calendar } from 'lucide-react'
import Link from 'next/link'

const tipoColors: Record<string, string> = {
  MENOR: 'bg-blue-100 text-blue-800',
  MEDIA: 'bg-green-100 text-green-800',
  MAYOR: 'bg-purple-100 text-purple-800',
}

interface RedDetail {
  id: string
  nombre: string
  tipo: string
  edadMin?: number
  edadMax?: number
  descripcion?: string
  lideres?: Array<{ id: string; name: string; email?: string }>
  miembros?: Array<{ id: string; estado: string; edad?: number; ultimaAsistencia?: string; user?: { name?: string; email?: string } }>
  eventos?: Array<{ id: string; titulo: string; fecha: string; hora?: string; tipo?: string; zoomLink?: string; youtubeLink?: string }>
  anuncios?: Array<{ id: string; titulo: string; contenido?: string; prioridad: string; activo: boolean; createdAt: string }>
  asistencias?: Array<{ id: string; fecha: string; presentes?: number; ausentes?: number; evento?: { titulo: string } }>
  _count?: { miembros?: number }
}

export default function RedDetailPage() {
  const { id } = useParams()
  const [red, setRed] = useState<RedDetail | null>(null)
  const [tab, setTab] = useState('miembros')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`/api/redes/${id}`)
      .then(r => r.json())
      .then(data => { setRed(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
        <div className="h-48 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!red) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Red no encontrada</p>
      </div>
    )
  }

  const tabs = [
    { id: 'miembros', label: 'Miembros' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'anuncios', label: 'Anuncios' },
    { id: 'asistencia', label: 'Asistencia' },
  ]

  const filteredMembers = red.miembros?.filter((m) =>
    (m.user?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user?.email ?? '').toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/redes" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h2 className="text-2xl font-bold text-gray-900">Detalle de Red</h2>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{red.nombre}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${tipoColors[red.tipo]}`}>
                  {red.tipo}
                </span>
                <span className="text-sm text-gray-600">
                  {red.edadMin} - {red.edadMax} años
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{red._count?.miembros || 0}</div>
              <p className="text-sm text-gray-500">Miembros</p>
            </div>
          </div>

          {/* Leaders section */}
          {red.lideres && red.lideres.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-3">Líderes</p>
              <div className="flex flex-wrap gap-2">
                {red.lideres.map((lider) => (
                  <div key={lider.id} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <Avatar name={lider.name} size="sm" />
                    <span className="text-sm text-gray-700">{lider.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'miembros' && (
        <Card>
          <CardContent className="pt-4">
            <div className="mb-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar miembros..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No hay miembros</p>
            ) : (
              <div className="overflow-x-auto -mx-1">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableTh>Nombre</TableTh>
                    <TableTh>Email</TableTh>
                    <TableTh>Edad</TableTh>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.map((m) => (
                    <TableRow key={m.id}>
                      <TableTd>
                        <div className="flex items-center gap-3">
                          <Avatar name={m.user?.name || '?'} size="sm" />
                          <span className="font-medium text-gray-900">{m.user?.name}</span>
                        </div>
                      </TableTd>
                      <TableTd>{m.user?.email}</TableTd>
                      <TableTd>{m.edad || '—'}</TableTd>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'eventos' && (
        <Card>
          <CardContent className="pt-6">
            {!red.eventos || red.eventos.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No hay eventos</p>
            ) : (
              <div className="space-y-3">
                {red.eventos.map((evento) => (
                  <div key={evento.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Calendar size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{evento.titulo}</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {formatDate(evento.fecha)} · {evento.hora}
                      </p>
                      <Badge variant="secondary" className="mt-2">{evento.tipo}</Badge>
                      {(evento.zoomLink || evento.youtubeLink) && (
                        <div className="flex gap-2 mt-2">
                          {evento.zoomLink && (
                            <a href={evento.zoomLink} target="_blank" rel="noopener" className="text-xs text-blue-600 hover:underline">
                              Zoom ↗
                            </a>
                          )}
                          {evento.youtubeLink && (
                            <a href={evento.youtubeLink} target="_blank" rel="noopener" className="text-xs text-red-600 hover:underline">
                              YouTube ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'anuncios' && (
        <Card>
          <CardContent className="pt-6">
            {!red.anuncios || red.anuncios.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No hay anuncios</p>
            ) : (
              <div className="space-y-3">
                {red.anuncios.map((anuncio) => (
                  <div key={anuncio.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{anuncio.titulo}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{anuncio.contenido}</p>
                      </div>
                      <Badge variant={anuncio.prioridad === 'URGENTE' ? 'danger' : anuncio.prioridad === 'ALTA' ? 'warning' : 'secondary'}>
                        {anuncio.prioridad}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{formatDateShort(anuncio.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'asistencia' && (
        <Card>
          <CardContent className="pt-6">
            {!red.asistencias || red.asistencias.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Sin registros de asistencia</p>
            ) : (
              <div className="space-y-2">
                {red.asistencias.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{a.evento?.titulo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDateShort(a.fecha)}</p>
                    </div>
                    <Badge variant="secondary">{a.presentes || 0} presentes</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
