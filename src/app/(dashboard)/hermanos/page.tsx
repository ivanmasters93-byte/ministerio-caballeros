'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/table'
import { Avatar } from '@/components/ui/avatar'
import { EstadoBadge } from '@/components/hermanos/EstadoBadge'
import { formatDateShort } from '@/lib/utils'
import { Search, Plus, Eye } from 'lucide-react'
import Link from 'next/link'

export default function HermanosPage() {
  const [hermanos, setHermanos] = useState<{ id: string; estado: string; ultimaAsistencia?: string; user?: { name?: string; email?: string; redes?: Array<{ red?: { nombre?: string } }> }; red?: { nombre?: string } }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (filterEstado) params.set('estado', filterEstado)
    fetch(`/api/hermanos?${params}`)
      .then(r => r.json())
      .then(data => { setHermanos(Array.isArray(data) ? data : (data?.data ?? [])); setLoading(false) })
  }, [filterEstado])

  const filtered = hermanos.filter(h =>
    (h.user?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (h.user?.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hermanos</h2>
          <p className="text-gray-500 text-sm">{hermanos.length} miembros registrados</p>
        </div>
        <Button size="sm"><Plus size={14} className="mr-1" /> Nuevo Hermano</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="w-44">
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="NUEVO">Nuevo</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="REQUIERE_SEGUIMIENTO">Requiere Seguimiento</option>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Hermano</TableTh>
                  <TableTh>Red</TableTh>
                  <TableTh>Estado</TableTh>
                  <TableTh>Última Asistencia</TableTh>
                  <TableTh>Acciones</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(h => (
                  <TableRow key={h.id}>
                    <TableTd>
                      <div className="flex items-center gap-3">
                        <Avatar name={h.user?.name || '?'} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{h.user?.name}</p>
                          <p className="text-gray-400 text-xs">{h.user?.email}</p>
                        </div>
                      </div>
                    </TableTd>
                    <TableTd>
                      {h.user?.redes?.[0]?.red?.nombre || <span className="text-gray-400 text-xs">Sin red</span>}
                    </TableTd>
                    <TableTd><EstadoBadge estado={h.estado} /></TableTd>
                    <TableTd>
                      {h.ultimaAsistencia ? formatDateShort(h.ultimaAsistencia) : <span className="text-gray-400 text-xs">—</span>}
                    </TableTd>
                    <TableTd>
                      <Link href={`/hermanos/${h.id}`}>
                        <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                      </Link>
                    </TableTd>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableTd colSpan={5} className="text-center text-gray-400 py-8">No se encontraron hermanos</TableTd>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
