'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Heart, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const prioridadVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary'> = { URGENTE: 'danger', ALTA: 'warning', NORMAL: 'secondary', BAJA: 'outline' }
const estadoBg: Record<string, string> = { ACTIVA: 'border-l-red-400', EN_ORACION: 'border-l-blue-400', RESPONDIDA: 'border-l-green-400', CERRADA: 'border-l-gray-300' }

interface Hermano {
  id: string
  user?: { name?: string }
}

interface Peticion {
  id: string
  descripcion: string
  prioridad: string
  estado: string
  privada?: boolean
  createdAt: string
  hermano?: { user?: { name?: string } }
}

export default function OracionPage() {
  const [peticiones, setPeticiones] = useState<Peticion[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [hermanos, setHermanos] = useState<Hermano[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    hermanoId: '',
    descripcion: '',
    prioridad: 'NORMAL',
  })

  const loadPeticiones = () => {
    fetch('/api/oracion')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        setPeticiones(list)
        setLoading(false)
      })
  }

  useEffect(() => { loadPeticiones() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = () => {
    if (hermanos.length === 0) {
      fetch('/api/hermanos?limit=200')
        .then(r => r.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data?.data ?? [])
          setHermanos(list)
        })
    }
    setForm({ hermanoId: '', descripcion: '', prioridad: 'NORMAL' })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.hermanoId || !form.descripcion.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/oracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hermanoId: form.hermanoId,
          descripcion: form.descripcion,
          prioridad: form.prioridad,
        }),
      })
      if (res.ok) {
        setModalOpen(false)
        setLoading(true)
        loadPeticiones()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Peticiones de Oración</h2>
          <p className="text-gray-500 text-sm">{peticiones.filter(p => p.estado === 'ACTIVA').length} activas</p>
        </div>
        <Button size="sm" onClick={openModal}><Plus size={14} className="mr-1" /> Nueva Petición</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : peticiones.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><Heart size={40} className="mx-auto mb-3 text-gray-300" /><p>No hay peticiones</p></div>
      ) : (
        <div className="grid gap-3">
          {peticiones.map(p => (
            <Card key={p.id} className={`border-l-4 ${estadoBg[p.estado] || 'border-l-gray-200'}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-gray-900">{p.hermano?.user?.name}</span>
                      <Badge variant={prioridadVariants[p.prioridad]}>{p.prioridad}</Badge>
                      <Badge variant="outline">{p.estado}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{p.descripcion}</p>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Nueva Petición Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Petición de Oración">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hermano</label>
            <Select
              value={form.hermanoId}
              onChange={e => setForm(f => ({ ...f, hermanoId: e.target.value }))}
              className="w-full"
            >
              <option value="">Seleccionar hermano...</option>
              {hermanos.map(h => (
                <option key={h.id} value={h.id}>{h.user?.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <Select
              value={form.prioridad}
              onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}
              className="w-full"
            >
              <option value="BAJA">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Petición</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={3}
              placeholder="Describe la petición de oración..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.hermanoId || !form.descripcion.trim()}
              className="flex-1"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
