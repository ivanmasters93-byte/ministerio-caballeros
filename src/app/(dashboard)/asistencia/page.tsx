'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

export default function AsistenciaPage() {
  const [eventos, setEventos] = useState<{ id: string; titulo: string; fecha: string; redId?: string }[]>([])
  const [hermanos, setHermanos] = useState<{ id: string; user?: { name?: string } }[]>([])
  const [historial, setHistorial] = useState<{ id: string; fecha: string; evento?: { titulo: string }; presentes?: number; ausentes?: number; total?: number }[]>([])
  const [selectedEvento, setSelectedEvento] = useState('')
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/eventos').then(r => r.json()).then(data => setEventos(Array.isArray(data) ? data : []))
    fetch('/api/hermanos').then(r => r.json()).then(data => setHermanos(Array.isArray(data) ? data : []))
    fetch('/api/asistencia').then(r => r.json()).then(data => setHistorial(Array.isArray(data) ? data : []))
  }, [])

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const saveAttendance = async () => {
    if (!selectedEvento) return
    const evento = eventos.find(e => e.id === selectedEvento)
    if (!evento) return
    setSaving(true)
    await fetch('/api/asistencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventoId: selectedEvento,
        redId: evento.redId || null,
        fecha: new Date().toISOString(),
        detalles: hermanos.map(h => ({ hermanoId: h.id, presente: !!attendance[h.id] })),
      }),
    })
    setSaving(false)
    alert('Asistencia guardada!')
  }

  const presentes = Object.values(attendance).filter(Boolean).length

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Asistencia</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tomar Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEvento} onChange={e => setSelectedEvento(e.target.value)} className="mb-4">
              <option value="">Seleccionar evento...</option>
              {eventos.map(e => <option key={e.id} value={e.id}>{e.titulo} — {formatDate(e.fecha)}</option>)}
            </Select>

            {selectedEvento && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">{presentes} / {hermanos.length} presentes</p>
                  <Button size="sm" onClick={saveAttendance} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {hermanos.map(h => (
                    <div key={h.id} onClick={() => toggleAttendance(h.id)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${attendance[h.id] ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <Avatar name={h.user?.name || '?'} size="sm" />
                      <p className="text-sm font-medium flex-1">{h.user?.name}</p>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${attendance[h.id] ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {attendance[h.id] && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Historial Reciente</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historial.slice(0, 8).map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.evento?.titulo}</p>
                    <p className="text-xs text-gray-400">{formatDate(a.fecha)}</p>
                  </div>
                  <Badge variant="secondary">{a.presentes}/{a.total}</Badge>
                </div>
              ))}
              {historial.length === 0 && <p className="text-center text-gray-400 text-sm py-6">Sin historial</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
