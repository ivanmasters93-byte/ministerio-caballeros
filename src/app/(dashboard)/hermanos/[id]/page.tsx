'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { EstadoBadge } from '@/components/hermanos/EstadoBadge'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle, Briefcase, Heart, Clock, Plus, UserCheck } from 'lucide-react'
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
  cuotas?: Array<{ id: string; estado: string; monto?: number; periodo?: string }>
  red?: { nombre: string }
}

function formatPhone(phone?: string) {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

function daysSince(iso?: string): number | null {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function calcAge(fechaNacimiento?: string): number | null {
  if (!fechaNacimiento) return null
  const birth = new Date(fechaNacimiento)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const prioridadVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary'> = {
  URGENTE: 'danger', ALTA: 'warning', NORMAL: 'secondary', BAJA: 'outline'
}

export default function HermanoProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [hermano, setHermano] = useState<HermanoProfile | null>(null)
  const [tab, setTab] = useState('info')
  const [loading, setLoading] = useState(true)

  // Seguimiento modal
  const [segModal, setSegModal] = useState(false)
  const [segForm, setSegForm] = useState({ tipo: 'NOTA', descripcion: '', proximoContacto: '' })
  const [segSaving, setSegSaving] = useState(false)

  // Peticion modal
  const [petModal, setPetModal] = useState(false)
  const [petForm, setPetForm] = useState({ descripcion: '', prioridad: 'NORMAL' })
  const [petSaving, setPetSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/hermanos/${id}`)
      .then(r => r.json())
      .then(data => { setHermano(data); setLoading(false) })
  }, [id])

  const handleSeguimiento = async () => {
    if (!segForm.descripcion.trim() || !hermano) return
    setSegSaving(true)
    try {
      const body: Record<string, unknown> = {
        hermanoId: hermano.id,
        tipo: segForm.tipo,
        descripcion: segForm.descripcion,
      }
      if (segForm.proximoContacto) body.proximoContacto = segForm.proximoContacto
      const res = await fetch('/api/seguimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSegModal(false)
        // Refresh
        fetch(`/api/hermanos/${id}`).then(r => r.json()).then(setHermano)
      }
    } finally {
      setSegSaving(false)
    }
  }

  const handlePeticion = async () => {
    if (!petForm.descripcion.trim() || !hermano) return
    setPetSaving(true)
    try {
      const res = await fetch('/api/oracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hermanoId: hermano.id,
          descripcion: petForm.descripcion,
          prioridad: petForm.prioridad,
        }),
      })
      if (res.ok) {
        setPetModal(false)
        fetch(`/api/hermanos/${id}`).then(r => r.json()).then(setHermano)
      }
    } finally {
      setPetSaving(false)
    }
  }

  if (loading) return <div className="animate-pulse"><div className="h-48 bg-gray-200 rounded-lg" /></div>
  if (!hermano) return <div className="text-center py-12 text-gray-500">Hermano no encontrado</div>

  const phone = hermano.user.phone
  const phoneClean = formatPhone(phone)
  const dias = daysSince(hermano.ultimaAsistencia)
  const age = calcAge(hermano.fechaNacimiento)

  const openSeguimientos = hermano.seguimientos?.filter(s => s.estado !== 'CERRADO') ?? []
  const closedSeguimientos = hermano.seguimientos?.filter(s => s.estado === 'CERRADO') ?? []
  const cuotasPendientes = hermano.cuotas?.filter(c => c.estado === 'PENDIENTE') ?? []
  const cuotasPagadas = hermano.cuotas?.filter(c => c.estado === 'PAGADA') ?? []

  const tabs = [
    { id: 'info', label: 'Info Personal' },
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'seguimiento', label: `Seguimiento${openSeguimientos.length > 0 ? ` (${openSeguimientos.length})` : ''}` },
    { id: 'peticiones', label: 'Peticiones' },
    { id: 'visitas', label: 'Visitas' },
    { id: 'finanzas', label: 'Finanzas' },
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
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar name={hermano.user.name} size="lg" />
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{hermano.user.name}</h3>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <EstadoBadge estado={hermano.estado} />
                    {hermano.user.redes?.[0]?.red && (
                      <Badge variant="outline">{hermano.user.redes[0].red.nombre}</Badge>
                    )}
                    {age !== null && <span className="text-sm text-gray-500">{age} años</span>}
                  </div>
                </div>

                {/* Days since last contact */}
                {dias !== null && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    dias > 21 ? 'bg-red-50 text-red-700 border border-red-200' :
                    dias > 14 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    <Clock size={14} />
                    {dias === 0 ? 'Asistió hoy' : `${dias} días sin asistir`}
                  </div>
                )}
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {hermano.user.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate">{hermano.user.email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="shrink-0" />
                    <span>{phone}</span>
                  </div>
                )}
                {hermano.direccion && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{hermano.direccion}</span>
                  </div>
                )}
                {hermano.ocupacion && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase size={14} className="shrink-0" />
                    <span>{hermano.ocupacion}</span>
                  </div>
                )}
              </div>

              {/* Quick action buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {phone && (
                  <>
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Phone size={15} /> Llamar
                    </a>
                    <a
                      href={`https://wa.me/${phoneClean}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  </>
                )}
                <button
                  onClick={() => { setSegForm({ tipo: 'NOTA', descripcion: '', proximoContacto: '' }); setSegModal(true) }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
                >
                  <UserCheck size={15} /> Crear Seguimiento
                </button>
                <button
                  onClick={() => { setPetForm({ descripcion: '', prioridad: 'NORMAL' }); setPetModal(true) }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
                >
                  <Heart size={15} /> Petición de Oración
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert for hermanos needing attention */}
      {(hermano.estado === 'REQUIERE_SEGUIMIENTO' || hermano.estado === 'INACTIVO') && (
        <div className={`rounded-xl px-5 py-4 border-l-4 ${
          hermano.estado === 'REQUIERE_SEGUIMIENTO'
            ? 'bg-amber-50 border-amber-400'
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-center gap-3">
            <Clock size={16} className={hermano.estado === 'REQUIERE_SEGUIMIENTO' ? 'text-amber-600' : 'text-red-600'} />
            <p className={`text-sm font-medium ${hermano.estado === 'REQUIERE_SEGUIMIENTO' ? 'text-amber-800' : 'text-red-800'}`}>
              {hermano.estado === 'REQUIERE_SEGUIMIENTO'
                ? 'Este hermano requiere seguimiento pastoral'
                : 'Este hermano está marcado como inactivo'}
              {dias !== null && dias > 0 && `. No ha asistido en ${dias} días.`}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
                { label: 'Edad', value: age !== null ? `${age} años` : null },
                { label: 'Dirección', value: hermano.direccion },
                { label: 'Última Asistencia', value: hermano.ultimaAsistencia ? formatDate(hermano.ultimaAsistencia) : null },
                { label: 'Teléfono', value: phone },
                { label: 'Email', value: hermano.user.email },
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
            {!hermano.asistencias || hermano.asistencias.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Sin registros de asistencia</p>
            ) : (
              <div className="space-y-2">
                {hermano.asistencias.map((a) => (
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {openSeguimientos.length > 0 && (
                <Badge variant="danger">{openSeguimientos.length} abierto{openSeguimientos.length !== 1 ? 's' : ''}</Badge>
              )}
              {closedSeguimientos.length > 0 && (
                <Badge variant="success">{closedSeguimientos.length} cerrado{closedSeguimientos.length !== 1 ? 's' : ''}</Badge>
              )}
            </div>
            <button
              onClick={() => { setSegForm({ tipo: 'NOTA', descripcion: '', proximoContacto: '' }); setSegModal(true) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              <Plus size={14} /> Nuevo caso
            </button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {!hermano.seguimientos || hermano.seguimientos.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Sin casos de seguimiento</p>
              ) : (
                <div className="space-y-3">
                  {hermano.seguimientos.map((s) => (
                    <div key={s.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{s.tipo}</Badge>
                        <Badge variant={s.estado === 'CERRADO' ? 'success' : s.estado === 'EN_PROCESO' ? 'warning' : 'default'}>{s.estado}</Badge>
                      </div>
                      <p className="text-sm text-gray-700">{s.descripcion}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-gray-400">{formatDate(s.createdAt)}</p>
                        {s.proximoContacto && (
                          <p className="text-xs text-amber-600">Próximo: {formatDate(s.proximoContacto)}</p>
                        )}
                        {s.responsable && (
                          <p className="text-xs text-gray-400">Por: {s.responsable.name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'peticiones' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setPetForm({ descripcion: '', prioridad: 'NORMAL' }); setPetModal(true) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <Plus size={14} /> Nueva petición
            </button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {!hermano.peticionesOracion || hermano.peticionesOracion.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Sin peticiones de oración</p>
              ) : (
                <div className="space-y-3">
                  {hermano.peticionesOracion.map((p) => (
                    <div key={p.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={prioridadVariants[p.prioridad]}>{p.prioridad}</Badge>
                        <Badge variant="outline">{p.estado}</Badge>
                      </div>
                      <p className="text-sm text-gray-700">{p.descripcion}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'visitas' && (
        <Card>
          <CardContent className="pt-6">
            {!hermano.visitas || hermano.visitas.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Sin visitas registradas</p>
            ) : (
              <div className="space-y-3">
                {hermano.visitas.map((v) => (
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

      {tab === 'finanzas' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              {cuotasPendientes.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-sm font-semibold text-red-700">{cuotasPendientes.length} cuota{cuotasPendientes.length !== 1 ? 's' : ''} pendiente{cuotasPendientes.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              {cuotasPagadas.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-semibold text-green-700">{cuotasPagadas.length} pagada{cuotasPagadas.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            {!hermano.cuotas || hermano.cuotas.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Sin registros financieros</p>
            ) : (
              <div className="space-y-2">
                {hermano.cuotas.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.periodo || 'Cuota'}</p>
                      {c.monto && <p className="text-xs text-gray-500">${c.monto}</p>}
                    </div>
                    <Badge variant={c.estado === 'PAGADA' ? 'success' : c.estado === 'PENDIENTE' ? 'danger' : 'secondary'}>{c.estado}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Crear Seguimiento Modal */}
      <Dialog open={segModal} onClose={() => setSegModal(false)} title="Crear Caso de Seguimiento">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <Select value={segForm.tipo} onChange={e => setSegForm(f => ({ ...f, tipo: e.target.value }))} className="w-full">
              <option value="NOTA">Nota</option>
              <option value="LLAMADA">Llamada</option>
              <option value="VISITA">Visita</option>
              <option value="ALERTA">Alerta</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={segForm.descripcion}
              onChange={e => setSegForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={3}
              placeholder="Describe el caso..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Próximo contacto (opcional)</label>
            <Input type="date" value={segForm.proximoContacto} onChange={e => setSegForm(f => ({ ...f, proximoContacto: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setSegModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSeguimiento} disabled={segSaving || !segForm.descripcion.trim()} className="flex-1">
              {segSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Petición de Oración Modal */}
      <Dialog open={petModal} onClose={() => setPetModal(false)} title="Nueva Petición de Oración">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <Select value={petForm.prioridad} onChange={e => setPetForm(f => ({ ...f, prioridad: e.target.value }))} className="w-full">
              <option value="BAJA">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Petición</label>
            <textarea
              value={petForm.descripcion}
              onChange={e => setPetForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={3}
              placeholder="Describe la petición..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setPetModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handlePeticion} disabled={petSaving || !petForm.descripcion.trim()} className="flex-1">
              {petSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
