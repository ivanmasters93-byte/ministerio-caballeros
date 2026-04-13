'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { EstadoBadge } from '@/components/hermanos/EstadoBadge'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

interface HermanoProfile {
  id: string
  estado: string
  fechaNacimiento?: string
  direccion?: string
  ocupacion?: string
  estadoCivil?: string
  notas?: string
  ultimaAsistencia?: string
  user: {
    name: string
    email?: string
    phone?: string
    redes?: Array<{ red?: { nombre: string } }>
  }
  asistencias?: Array<{ id: string; asistencia?: { fecha: string; evento?: { titulo: string } }; presente?: boolean }>
  seguimientos?: Array<{ id: string; tipo: string; descripcion: string; estado: string; privado?: boolean; proximoContacto?: string; createdAt: string; responsable?: { name: string } }>
  peticiones?: Array<{ id: string; descripcion: string; prioridad: string; estado: string; privada?: boolean; createdAt: string }>
  peticionesOracion?: Array<{ id: string; descripcion: string; prioridad: string; estado: string; privada?: boolean; createdAt: string }>
  visitas?: Array<{ id: string; tipo: string; notas?: string; fecha: string; realizadaPor: string }>
}

export default function HermanoProfilePage() {
  const { id } = useParams()
  const [hermano, setHermano] = useState<HermanoProfile | null>(null)
  const [tab, setTab] = useState('info')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/hermanos/${id}`)
      .then(r => r.json())
      .then(data => { setHermano(data); setLoading(false) })
  }, [id])

  if (loading) return <div className="animate-pulse"><div className="h-48 bg-gray-200 rounded-lg" /></div>
  if (!hermano) return <div className="text-center py-12 text-gray-500">Hermano no encontrado</div>

  const tabs = [
    { id: 'info', label: 'Info Personal' },
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'seguimiento', label: 'Seguimiento' },
    { id: 'peticiones', label: 'Peticiones' },
    { id: 'visitas', label: 'Visitas' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/hermanos" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h2 className="text-2xl font-bold text-gray-900">Perfil del Hermano</h2>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar name={hermano.user.name} size="lg" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{hermano.user.name}</h3>
                  <EstadoBadge estado={hermano.estado} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {hermano.user.email && <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} />{hermano.user.email}</div>}
                {hermano.user.phone && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} />{hermano.user.phone}</div>}
                {hermano.direccion && <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin size={14} />{hermano.direccion}</div>}
                {hermano.user.redes?.[0]?.red && <div className="flex items-center gap-2 text-sm text-gray-600">Red: {hermano.user.redes[0].red.nombre}</div>}
              </div>
            </div>
          </div>
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

      {/* Tab content */}
      {tab === 'info' && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Ocupación', value: hermano.ocupacion },
                { label: 'Estado Civil', value: hermano.estadoCivil },
                { label: 'Fecha de Nacimiento', value: hermano.fechaNacimiento ? formatDate(hermano.fechaNacimiento) : null },
                { label: 'Última Asistencia', value: hermano.ultimaAsistencia ? formatDate(hermano.ultimaAsistencia) : null },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-gray-900 mt-0.5">{value || <span className="text-gray-400">—</span>}</p>
                </div>
              ))}
            </div>
            {hermano.notas && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notas</p>
                <p className="text-gray-700 text-sm">{hermano.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'asistencia' && (
        <Card>
          <CardContent className="pt-6">
            {hermano.asistencias?.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Sin registros de asistencia</p>
            ) : (
              <div className="space-y-2">
                {hermano.asistencias?.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900">{a.asistencia?.evento?.titulo}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.presente ? 'success' : 'danger'}>{a.presente ? 'Presente' : 'Ausente'}</Badge>
                      <span className="text-xs text-gray-400">{a.asistencia?.fecha ? formatDate(a.asistencia.fecha) : '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'seguimiento' && (
        <Card>
          <CardContent className="pt-6">
            {hermano.seguimientos?.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Sin casos de seguimiento</p>
            ) : (
              <div className="space-y-3">
                {hermano.seguimientos?.map((s) => (
                  <div key={s.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{s.tipo}</Badge>
                      <Badge variant={s.estado === 'CERRADO' ? 'success' : s.estado === 'EN_PROCESO' ? 'warning' : 'default'}>{s.estado}</Badge>
                    </div>
                    <p className="text-sm text-gray-700">{s.descripcion}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(s.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'peticiones' && (
        <Card>
          <CardContent className="pt-6">
            {hermano.peticionesOracion?.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Sin peticiones de oración</p>
            ) : (
              <div className="space-y-3">
                {hermano.peticionesOracion?.map((p) => (
                  <div key={p.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={p.prioridad === 'URGENTE' ? 'danger' : p.prioridad === 'ALTA' ? 'warning' : 'secondary'}>{p.prioridad}</Badge>
                      <Badge variant="outline">{p.estado}</Badge>
                    </div>
                    <p className="text-sm text-gray-700">{p.descripcion}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'visitas' && (
        <Card>
          <CardContent className="pt-6">
            {hermano.visitas?.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Sin visitas registradas</p>
            ) : (
              <div className="space-y-3">
                {hermano.visitas?.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Badge variant="secondary">{v.tipo}</Badge>
                      <p className="text-sm text-gray-700 mt-1">{v.notas}</p>
                      <p className="text-xs text-gray-400">{v.realizadaPor}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(v.fecha)}</span>
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
