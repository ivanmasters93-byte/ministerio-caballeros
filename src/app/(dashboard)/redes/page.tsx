'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { RedCard } from '@/components/redes/RedCard'
import { Plus } from 'lucide-react'

interface Red {
  id: string
  nombre: string
  tipo: string
  edadMin: number
  edadMax: number
  _count?: { miembros: number; eventos: number }
  lideres: Array<{ name: string }>
}

export default function RedesPage() {
  const [redes, setRedes] = useState<Red[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'MENOR',
    edadMin: '18',
    edadMax: '30',
  })

  const loadRedes = () => {
    fetch('/api/redes')
      .then(r => r.json())
      .then(data => { setRedes(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadRedes() }, [])

  const openModal = () => {
    setForm({ nombre: '', tipo: 'MENOR', edadMin: '18', edadMax: '30' })
    setSaveError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombre.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch('/api/redes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          tipo: form.tipo,
          edadMin: parseInt(form.edadMin) || 18,
          edadMax: parseInt(form.edadMax) || 30,
        }),
      })
      if (res.ok) {
        setModalOpen(false)
        loadRedes()
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Redes</h2>
          <p className="text-gray-500 text-sm">{redes.length} redes activas</p>
        </div>
        <Button size="sm" onClick={openModal}><Plus size={14} className="mr-1" /> Nueva Red</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : redes.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <p className="text-gray-500">No hay redes registradas aún</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {redes.map(red => (
            <RedCard key={red.id} red={red} />
          ))}
        </div>
      )}

      {/* Nueva Red Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Red">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <Input
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Red de Jóvenes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <Select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              <option value="MENOR">Menor (18-30)</option>
              <option value="MEDIA">Media (31-40)</option>
              <option value="MAYOR">Mayor (41-75)</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad mínima</label>
              <Input
                type="number"
                min="0"
                value={form.edadMin}
                onChange={e => setForm(f => ({ ...f, edadMin: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad máxima</label>
              <Input
                type="number"
                min="1"
                value={form.edadMax}
                onChange={e => setForm(f => ({ ...f, edadMax: e.target.value }))}
              />
            </div>
          </div>

          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.nombre.trim()}
              className="flex-1"
            >
              {saving ? 'Guardando...' : 'Crear Red'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
