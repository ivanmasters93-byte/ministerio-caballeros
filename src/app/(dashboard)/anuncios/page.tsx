'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export default function AnunciosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/anuncios').then(r => r.json()).then((data: Anuncio[]) => { setAnuncios(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Anuncios</h2>
          <p className="text-gray-500 text-sm">{anuncios.filter(a => a.activo).length} anuncios activos</p>
        </div>
        <Button size="sm"><Plus size={14} className="mr-1" /> Nuevo Anuncio</Button>
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
    </div>
  )
}
