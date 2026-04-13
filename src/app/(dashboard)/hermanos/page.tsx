'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/table'
import { Avatar } from '@/components/ui/avatar'
import { Dialog } from '@/components/ui/dialog'
import { EstadoBadge } from '@/components/hermanos/EstadoBadge'
import { formatDateShort } from '@/lib/utils'
import { Search, Plus, Eye, Phone, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Hermano {
  id: string
  estado: string
  ultimaAsistencia?: string
  user?: {
    name?: string
    email?: string
    phone?: string
    redes?: Array<{ red?: { nombre?: string } }>
  }
  red?: { nombre?: string }
}

interface Red {
  id: string
  nombre: string
}

function formatPhone(phone?: string) {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

export default function HermanosPage() {
  const [hermanos, setHermanos] = useState<Hermano[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [redes, setRedes] = useState<Red[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    telefono: '',
    redId: '',
    fechaNacimiento: '',
    direccion: '',
    ocupacion: '',
    estadoCivil: '',
  })

  const loadHermanos = () => {
    const params = new URLSearchParams()
    if (filterEstado) params.set('estado', filterEstado)
    fetch(`/api/hermanos?${params}`)
      .then(r => r.json())
      .then(data => {
        setHermanos(Array.isArray(data) ? data : (data?.data ?? []))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadHermanos()
  }, [filterEstado]) // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = () => {
    if (redes.length === 0) {
      fetch('/api/redes')
        .then(r => r.json())
        .then(data => setRedes(Array.isArray(data) ? data : (data?.data ?? [])))
        .catch(() => {})
    }
    setForm({ name: '', email: '', telefono: '', redId: '', fechaNacimiento: '', direccion: '', ocupacion: '', estadoCivil: '' })
    setSaveError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
      }
      if (form.telefono) body.phone = form.telefono
      if (form.redId) body.redId = form.redId
      if (form.fechaNacimiento) body.fechaNacimiento = form.fechaNacimiento
      if (form.direccion) body.direccion = form.direccion
      if (form.ocupacion) body.ocupacion = form.ocupacion
      if (form.estadoCivil) body.estadoCivil = form.estadoCivil

      const res = await fetch('/api/hermanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setModalOpen(false)
        setLoading(true)
        loadHermanos()
      } else {
        const err = await res.json()
        setSaveError(err.error ?? 'Error al guardar')
      }
    } catch {
      setSaveError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const filtered = hermanos.filter(h =>
    (h.user?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (h.user?.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hermanos</h2>
          <p className="text-gray-500 text-sm">{hermanos.length} miembros registrados</p>
        </div>
        <Button size="sm" onClick={openModal}><Plus size={14} className="mr-1" /> Nuevo Hermano</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="w-44">
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="NUEVO">Nuevo</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="REQUIERE_SEGUIMIENTO">Requiere Seguimiento</option>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (
            <div className="overflow-x-auto -mx-1">
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Hermano</TableTh>
                  <TableTh>Red</TableTh>
                  <TableTh>Estado</TableTh>
                  <TableTh>Última Asistencia</TableTh>
                  <TableTh>Acciones</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(h => {
                  const phone = h.user?.phone
                  const phoneClean = formatPhone(phone)
                  return (
                    <TableRow key={h.id}>
                      <TableTd>
                        <div className="flex items-center gap-3">
                          <Avatar name={h.user?.name || '?'} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{h.user?.name}</p>
                            <p className="text-gray-400 text-xs">{h.user?.email}</p>
                          </div>
                        </div>
                      </TableTd>
                      <TableTd>
                        {h.user?.redes?.[0]?.red?.nombre || <span className="text-gray-400 text-xs">Sin red</span>}
                      </TableTd>
                      <TableTd><EstadoBadge estado={h.estado} /></TableTd>
                      <TableTd>
                        {h.ultimaAsistencia ? formatDateShort(h.ultimaAsistencia) : <span className="text-gray-400 text-xs">—</span>}
                      </TableTd>
                      <TableTd>
                        <div className="flex items-center gap-1">
                          {phone && (
                            <>
                              <a
                                href={`tel:${phone}`}
                                title="Llamar"
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              >
                                <Phone size={14} />
                              </a>
                              <a
                                href={`https://wa.me/${phoneClean}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              >
                                <MessageCircle size={14} />
                              </a>
                            </>
                          )}
                          <Link href={`/hermanos/${h.id}`}>
                            <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                          </Link>
                        </div>
                      </TableTd>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableTd colSpan={5} className="text-center text-gray-400 py-8">No se encontraron hermanos</TableTd>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nuevo Hermano Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Hermano">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <Input
                value={form.telefono}
                onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                placeholder="+507 6000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Red</label>
              <Select value={form.redId} onChange={e => setForm(f => ({ ...f, redId: e.target.value }))}>
                <option value="">Sin red asignada</option>
                {redes.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <Input
                type="date"
                value={form.fechaNacimiento}
                onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
              <Select value={form.estadoCivil} onChange={e => setForm(f => ({ ...f, estadoCivil: e.target.value }))}>
                <option value="">Seleccionar...</option>
                <option value="SOLTERO">Soltero</option>
                <option value="CASADO">Casado</option>
                <option value="DIVORCIADO">Divorciado</option>
                <option value="VIUDO">Viudo</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ocupación</label>
            <Input
              value={form.ocupacion}
              onChange={e => setForm(f => ({ ...f, ocupacion: e.target.value }))}
              placeholder="Profesión u oficio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <Input
              value={form.direccion}
              onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
              placeholder="Dirección de residencia"
            />
          </div>

          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.email.trim()}
              className="flex-1"
            >
              {saving ? 'Guardando...' : 'Registrar Hermano'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
