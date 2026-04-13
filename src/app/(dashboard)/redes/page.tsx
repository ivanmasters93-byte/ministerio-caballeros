'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RedCard } from '@/components/redes/RedCard'
import { Plus } from 'lucide-react'

export default function RedesPage() {
  const [redes, setRedes] = useState<{ id: string; nombre: string; tipo: string; edadMin: number; edadMax: number; _count?: { miembros: number; eventos: number }; lideres: Array<{ name: string }> }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/redes')
      .then(r => r.json())
      .then(data => { setRedes(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Redes</h2>
          <p className="text-gray-500 text-sm">{redes.length} redes activas</p>
        </div>
        <Button size="sm"><Plus size={14} className="mr-1" /> Nueva Red</Button>
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
    </div>
  )
}
