'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const prioridadVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary'> = {
  URGENTE: 'danger', ALTA: 'warning', NORMAL: 'secondary', BAJA: 'outline'
}
const tipoIcons: Record<string, string> = {
  URGENTE: '🚨', GENERAL: '📢', RECORDATORIO: '🔔', EVENTO: '📅'
}

interface Anuncio {
  id: string
  titulo: string
  contenido: string
  tipo: string
  prioridad: string
  activo: boolean
  paraTodasRedes?: boolean
  publicadoEn: string
  red?: { nombre: string }
}

interface Red {
  id: string
  nombre: string
}

export default function AnunciosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [redes, setRedes] = useState<Red[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    contenido: '',
    tipo: 'GENERAL',
    prioridad: 'NORMAL',
    paraTodasRedes: 'true',
    redId: '',
    expiraEn: '',
  })

  const loadAnuncios = () => {
    fetch('/api/anuncios')
      .then(r => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        setAnuncios(list)
        setLoading(false)
      })
  }

  useEffect(() => { loadAnuncios() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = () => {
    if (redes.length === 0) {
      fetch('/api/redes')
        .then(r => r.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data?.data ?? [])
          setRedes(list)
        })
    }
    setForm({ titulo: '', contenido: '', tipo: 'GENERAL', prioridad: 'NORMAL', paraTodasRedes: 'true', redId: '', expiraEn: '' })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        titulo: form.titulo,
        contenido: form.contenido,
        tipo: form.tipo,
        prioridad: form.prioridad,
        paraTodasRedes: form.paraTodasRedes === 'true',
      }
      if (form.paraTodasRedes !== 'true' && form.redId) body.redId = form.redId
      if (form.expiraEn) body.expiraEn = form.expiraEn
      const res = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setModalOpen(false)
        setLoading(true)
        loadAnuncios()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Anuncios</h2>
          <p className="text-gray-500 text-sm">{anuncios.filter(a => a.activo).length} anuncios activos</p>
        </div>
        <Button size="sm" onClick={openModal}><Plus size={14} className="mr-1" /> Nuevo Anuncio</Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)
        ) : anuncios.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No hay anuncios</div>
        ) : (
          anuncios.map(a => (
            <Card key={a.id} className={!a.activo ? 'opacity-60' : ''}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{tipoIcons[a.tipo] || '📢'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{a.titulo}</h3>
                        <Badge variant={prioridadVariants[a.prioridad]}>{a.prioridad}</Badge>
                        {a.paraTodasRedes && <Badge variant="default">Todas las redes</Badge>}
                        {a.red && <Badge variant="outline">{a.red.nombre}</Badge>}
                        {!a.activo && <Badge variant="secondary">Inactivo</Badge>}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{a.contenido}</p>
                      <p className="text-gray-400 text-xs mt-2">{formatDate(a.publicadoEn)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Nuevo Anuncio Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Anuncio">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <Input
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Título del anuncio..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <textarea
              value={form.contenido}
              onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
              rows={3}
              placeholder="Escribe el contenido del anuncio..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <Select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className="w-full">
                <option value="GENERAL">General</option>
                <option value="URGENTE">Urgente</option>
                <option value="RECORDATORIO">Recordatorio</option>
                <option value="EVENTO">Evento</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <Select value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))} className="w-full">
                <option value="BAJA">Baja</option>
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destinatario</label>
            <Select value={form.paraTodasRedes} onChange={e => setForm(f => ({ ...f, paraTodasRedes: e.target.value }))} className="w-full">
              <option value="true">Todas las redes</option>
              <option value="false">Red específica</option>
            </Select>
          </div>

          {form.paraTodasRedes === 'false' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Red</label>
              <Select value={form.redId} onChange={e => setForm(f => ({ ...f, redId: e.target.value }))} className="w-full">
                <option value="">Seleccionar red...</option>
                {redes.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expira el (opcional)</label>
            <Input
              type="date"
              value={form.expiraEn}
              onChange={e => setForm(f => ({ ...f, expiraEn: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.titulo.trim() || !form.contenido.trim()}
              className="flex-1"
            >
              {saving ? 'Guardando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
