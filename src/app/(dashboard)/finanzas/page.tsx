'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { DollarSign, TrendingUp, CheckCircle, XCircle, Plus, ChevronLeft, ChevronRight, Target } from 'lucide-react'

interface HermanoItem {
  id: string
  user?: { name?: string; redes?: Array<{ red?: { nombre?: string } }> }
  redes?: Array<{ red?: { nombre?: string } }>
}

interface CuotaItem {
  id: string
  hermanoId?: string
  hermano?: { user?: { name?: string } }
  monto: number
  estado?: string
  concepto?: string
  tipo?: string
  fecha?: string
}

interface FinanzasData {
  totalRecaudado?: number
  totalEsperado?: number
  porcentaje?: number
  meta?: { montoMeta?: number }
  aportaron?: HermanoItem[]
  pendientes?: HermanoItem[]
  cuotas?: CuotaItem[]
}

export default function FinanzasPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [anio, setAnio] = useState(now.getFullYear())
  const [data, setData] = useState<FinanzasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRegister, setShowRegister] = useState(false)
  const [showMeta, setShowMeta] = useState(false)
  const [hermanos, setHermanos] = useState<HermanoItem[]>([])
  const [saving, setSaving] = useState(false)

  // Form states
  const [selectedHermano, setSelectedHermano] = useState('')
  const [monto, setMonto] = useState('10')
  const [concepto, setConcepto] = useState('')
  const [tipoCuota, setTipoCuota] = useState('MENSUAL')
  const [metaNombre, setMetaNombre] = useState('')
  const [metaMonto, setMetaMonto] = useState('')
  const [metaDesc, setMetaDesc] = useState('')

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

  const fetchData = useCallback(() => {
    fetch(`/api/finanzas?mes=${mes}&anio=${anio}`)
      .then(r => r.json())
      .then((d: FinanzasData) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mes, anio])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setLoading(true); fetchData() }, [fetchData])

  useEffect(() => {
    fetch('/api/hermanos').then(r => r.json()).then((d: HermanoItem[]) => setHermanos(Array.isArray(d) ? d : []))
  }, [])

  const prevMonth = () => {
    if (mes === 1) { setMes(12); setAnio(a => a - 1) }
    else setMes(m => m - 1)
  }
  const nextMonth = () => {
    if (mes === 12) { setMes(1); setAnio(a => a + 1) }
    else setMes(m => m + 1)
  }

  const registrarCuota = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHermano) return
    setSaving(true)
    await fetch('/api/finanzas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hermanoId: selectedHermano, monto: parseFloat(monto) || 10, mes, anio, tipo: tipoCuota, concepto, creadoPor: 'admin' }),
    })
    setSaving(false)
    setShowRegister(false)
    setSelectedHermano('')
    setConcepto('')
    fetchData()
  }

  const crearMeta = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/finanzas/meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: metaNombre, montoMeta: parseFloat(metaMonto), mes, anio, descripcion: metaDesc, activa: true }),
    })
    setSaving(false)
    setShowMeta(false)
    fetchData()
  }

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
    </div>
  )

  const porcentaje = data?.porcentaje || 0
  const progressColor = porcentaje >= 75 ? 'bg-green-500' : porcentaje >= 50 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finanzas</h2>
          <p className="text-gray-500 text-sm">Cuotas y metas ministeriales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowMeta(true)}><Target size={14} className="mr-1" /> Meta</Button>
          <Button size="sm" onClick={() => setShowRegister(true)}><Plus size={14} className="mr-1" /> Registrar Pago</Button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft size={16} /></Button>
        <span className="font-semibold text-gray-900 min-w-[120px] text-center">{meses[mes-1]} {anio}</span>
        <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight size={16} /></Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg"><DollarSign size={18} className="text-green-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Recaudado</p>
                <p className="text-xl font-bold text-gray-900">${data?.totalRecaudado?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp size={18} className="text-blue-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Meta esperada</p>
                <p className="text-xl font-bold text-gray-900">${data?.meta?.montoMeta?.toFixed(2) || data?.totalEsperado?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg"><CheckCircle size={18} className="text-purple-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Aportaron</p>
                <p className="text-xl font-bold text-gray-900">{data?.aportaron?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg"><XCircle size={18} className="text-red-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Pendientes</p>
                <p className="text-xl font-bold text-gray-900">{data?.pendientes?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-900">Progreso del mes</p>
            <span className="text-2xl font-bold text-gray-900">{porcentaje}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {data?.aportaron?.length || 0} de {(data?.aportaron?.length || 0) + (data?.pendientes?.length || 0)} hermanos han aportado
          </p>
        </CardContent>
      </Card>

      {/* Two columns: paid / pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aportaron */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <CardTitle>Aportaron ({data?.aportaron?.length || 0})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data?.aportaron?.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Nadie ha aportado aún</p>
              ) : data?.aportaron?.map((h) => {
                const cuota = data.cuotas?.find((c) => c.hermanoId === h.id && c.estado === 'PAGADA')
                return (
                  <div key={h.id} className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar name={h.user?.name || '?'} size="sm" />
                      <p className="text-sm font-medium text-gray-900">{h.user?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-700">${cuota?.monto?.toFixed(2)}</p>
                      <Badge variant="success" className="text-xs">Pagado</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pendientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-red-500" />
              <CardTitle>Pendientes ({data?.pendientes?.length || 0})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data?.pendientes?.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">¡Todos han aportado!</p>
              ) : data?.pendientes?.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar name={h.user?.name || '?'} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{h.user?.name}</p>
                      <p className="text-xs text-gray-400">{h.user?.redes?.[0]?.red?.nombre || h.redes?.[0]?.red?.nombre || 'Sin red'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Pendiente</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setSelectedHermano(h.id); setShowRegister(true) }}
                    >
                      Registrar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent payments */}
      {(data?.cuotas?.length ?? 0) > 0 && (
        <Card>
          <CardHeader><CardTitle>Pagos Registrados</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(data?.cuotas ?? []).slice(0, 10).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.hermano?.user?.name || '?'} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{c.hermano?.user?.name}</p>
                      <p className="text-xs text-gray-400">{c.concepto || c.tipo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700">${c.monto.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{c.fecha ? new Date(c.fecha).toLocaleDateString('es-ES') : '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Register payment dialog */}
      <Dialog open={showRegister} onClose={() => setShowRegister(false)} title="Registrar Pago">
        <form onSubmit={registrarCuota} className="space-y-4">
          <div>
            <Label>Hermano</Label>
            <Select value={selectedHermano} onChange={e => setSelectedHermano(e.target.value)} required>
              <option value="">Seleccionar hermano...</option>
              {hermanos.map((h) => (
                <option key={h.id} value={h.id}>{h.user?.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Monto ($)</Label>
            <Input type="number" value={monto} onChange={e => setMonto(e.target.value)} min="0.01" step="0.01" required />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={tipoCuota} onChange={e => setTipoCuota(e.target.value)}>
              <option value="MENSUAL">Cuota Mensual</option>
              <option value="ESPECIAL">Especial</option>
              <option value="OFRENDA">Ofrenda</option>
              <option value="DONACION">Donación</option>
            </Select>
          </div>
          <div>
            <Label>Concepto (opcional)</Label>
            <Input value={concepto} onChange={e => setConcepto(e.target.value)} placeholder="Cuota abril..." />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowRegister(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Registrar Pago'}</Button>
          </div>
        </form>
      </Dialog>

      {/* Meta dialog */}
      <Dialog open={showMeta} onClose={() => setShowMeta(false)} title="Establecer Meta Mensual">
        <form onSubmit={crearMeta} className="space-y-4">
          <div>
            <Label>Nombre de la meta</Label>
            <Input value={metaNombre} onChange={e => setMetaNombre(e.target.value)} placeholder="Meta de recaudación..." required />
          </div>
          <div>
            <Label>Monto objetivo ($)</Label>
            <Input type="number" value={metaMonto} onChange={e => setMetaMonto(e.target.value)} min="1" step="0.01" required />
          </div>
          <div>
            <Label>Descripción</Label>
            <Input value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder="Para qué es este objetivo..." />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowMeta(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Meta'}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
