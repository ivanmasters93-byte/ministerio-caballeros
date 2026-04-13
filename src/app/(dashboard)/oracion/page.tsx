'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const prioridadVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary'> = { URGENTE: 'danger', ALTA: 'warning', NORMAL: 'secondary', BAJA: 'outline' }
const estadoBg: Record<string, string> = { ACTIVA: 'border-l-red-400', EN_ORACION: 'border-l-blue-400', RESPONDIDA: 'border-l-green-400', CERRADA: 'border-l-gray-300' }

export default function OracionPage() {
  const [peticiones, setPeticiones] = useState<{ id: string; descripcion: string; prioridad: string; estado: string; privada?: boolean; createdAt: string; hermano?: { user?: { name?: string } } }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/oracion').then(r => r.json()).then(data => { setPeticiones(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Peticiones de Oración</h2>
          <p className="text-gray-500 text-sm">{peticiones.filter(p => p.estado === 'ACTIVA').length} activas</p>
        </div>
        <Button size="sm"><Plus size={14} className="mr-1" /> Nueva Petición</Button>
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
    </div>
  )
}
