'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Phone, MessageCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const estadoVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary'> = {
  ABIERTO: 'danger', EN_PROCESO: 'warning', CERRADO: 'success'
}
const tipoIcons: Record<string, string> = {
  LLAMADA: '📞', VISITA: '🏠', NOTA: '📝', ALERTA: '⚠️'
}

interface Caso {
  id: string
  tipo: string
  descripcion: string
  estado: string
  privado?: boolean
  proximoContacto?: string
  createdAt: string
  hermano?: { id: string; user?: { name?: string; phone?: string } }
  responsable?: { name?: string }
}

interface Hermano {
  id: string
  user?: { name?: string; phone?: string }
}

function formatPhone(phone?: string) {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

export default function SeguimientoPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [hermanos, setHermanos] = useState<Hermano[]>([])
  const [saving, setSaving] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [form, setForm] = useState({
    hermanoId: '',
    tipo: 'NOTA',
    descripcion: '',
    proximoContacto: '',
  })

  const loadCasos = () => {
    const params = filter ? `?estado=${filter}` : ''
    fetch(`/api/seguimiento${params}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        setCasos(list)
        setLoading(false)
      })
  }

  useEffect(() => { loadCasos() }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch current user ID once for use as responsableId
  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => { if (data?.user?.id) setCurrentUserId(data.user.id) })
      .catch(() => {})
  }, [])

  const openModal = () => {
    if (hermanos.length === 0) {
      fetch('/api/hermanos?limit=200')
        .then(r => r.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data?.data ?? [])
          setHermanos(list)
        })
    }
    setForm({ hermanoId: '', tipo: 'NOTA', descripcion: '', proximoContacto: '' })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.hermanoId || !form.descripcion.trim()) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        hermanoId: form.hermanoId,
        tipo: form.tipo,
        descripcion: form.descripcion,
        responsableId: currentUserId,
      }
      if (form.proximoContacto) body.proximoContacto = form.proximoContacto
      const res = await fetch('/api/seguimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setModalOpen(false)
        setLoading(true)
        loadCasos()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Seguimiento Pastoral</h2>
        <Button size="sm" onClick={openModal}><Plus size={14} className="mr-1" /> Nueva Nota</Button>
      </div>

      <div className="flex gap-2">
        {['', 'ABIERTO', 'EN_PROCESO', 'CERRADO'].map(e => (
          <Button key={e} variant={filter === e ? 'default' : 'outline'} size="sm" onClick={() => setFilter(e)}>
            {e || 'Todos'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="grid gap-4">
          {casos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No hay casos de seguimiento</div>
          ) : casos.map(caso => {
            const phone = caso.hermano?.user?.phone
            const phoneClean = formatPhone(phone)
            return (
              <Card key={caso.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar name={caso.hermano?.user?.name || '?'} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{caso.hermano?.user?.name}</span>
                        <Badge variant={estadoVariants[caso.estado]}>{caso.estado}</Badge>
                        <span className="text-sm">{tipoIcons[caso.tipo]}</span>
                        <Badge variant="secondary">{caso.tipo}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{caso.descripcion}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{formatDate(caso.createdAt)}</span>
                        {caso.proximoContacto && <span>Próximo: {formatDate(caso.proximoContacto)}</span>}
                      </div>
                    </div>

                    {/* Call / WhatsApp action buttons */}
                    {phone && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <a
                          href={`tel:${phone}`}
                          title={`Llamar a ${caso.hermano?.user?.name}`}
                          className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <Phone size={18} />
                        </a>
                        <a
                          href={`https://wa.me/${phoneClean}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`WhatsApp a ${caso.hermano?.user?.name}`}
                          className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        >
                          <MessageCircle size={18} />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Nueva Nota Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Caso de Seguimiento">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <Select
              value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              className="w-full"
            >
              <option value="NOTA">Nota</option>
              <option value="LLAMADA">Llamada</option>
              <option value="VISITA">Visita</option>
              <option value="ALERTA">Alerta</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={3}
              placeholder="Describe el caso..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Próximo contacto (opcional)</label>
            <Input
              type="date"
              value={form.proximoContacto}
              onChange={e => setForm(f => ({ ...f, proximoContacto: e.target.value }))}
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
