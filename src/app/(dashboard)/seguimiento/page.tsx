'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const estadoVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary'> = {
  ABIERTO: 'danger', EN_PROCESO: 'warning', CERRADO: 'success'
}
const tipoIcons: Record<string, string> = {
  LLAMADA: '📞', VISITA: '🏠', NOTA: '📝', ALERTA: '⚠️'
}

export default function SeguimientoPage() {
  const [casos, setCasos] = useState<{ id: string; tipo: string; descripcion: string; estado: string; privado?: boolean; proximoContacto?: string; createdAt: string; hermano?: { id: string; user?: { name?: string } }; responsable?: { name?: string } }[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = filter ? `?estado=${filter}` : ''
    fetch(`/api/seguimiento${params}`).then(r => r.json()).then(data => { setCasos(Array.isArray(data) ? data : []); setLoading(false) })
  }, [filter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Seguimiento Pastoral</h2>
        <Button size="sm"><Plus size={14} className="mr-1" /> Nueva Nota</Button>
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
          ) : casos.map(caso => (
            <Card key={caso.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <Avatar name={caso.hermano?.user?.name || '?'} size="md" />
                  <div className="flex-1">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
