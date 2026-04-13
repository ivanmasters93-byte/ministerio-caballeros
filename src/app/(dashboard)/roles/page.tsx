'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/table'
import { getRoleLabel } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'

const roleOptions = [
  { value: 'LIDER_GENERAL', label: 'Líder General' },
  { value: 'LIDER_RED', label: 'Líder de Red' },
  { value: 'SECRETARIO', label: 'Secretario' },
  { value: 'ASISTENTE', label: 'Asistente' },
  { value: 'HERMANO', label: 'Hermano' },
]

const resources = [
  { id: 'hermanos', name: 'Hermanos' },
  { id: 'redes', name: 'Redes' },
  { id: 'eventos', name: 'Eventos' },
  { id: 'asistencia', name: 'Asistencia' },
  { id: 'documentos', name: 'Documentos' },
  { id: 'finanzas', name: 'Finanzas' },
  { id: 'roles', name: 'Roles' },
  { id: 'seguimiento', name: 'Seguimiento' },
]

const actions = ['Ver', 'Crear', 'Editar', 'Eliminar']

interface UsuarioItem {
  id: string
  name?: string
  email?: string
  role?: string
  redes?: Array<{ redId: string; red?: { nombre?: string } }>
  permisos?: Array<{ recurso: string; accion: string; permitido: boolean }>
}

export default function RolesPage() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([])
  const [currentUser, setCurrentUser] = useState<UsuarioItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [permisos, setPermisos] = useState<Record<string, boolean>>({})
  const [savingPermisos, setSavingPermisos] = useState(false)

  const isLiderGeneral = currentUser?.role === 'LIDER_GENERAL'

  useEffect(() => {
    Promise.all([
      fetch('/api/roles').then(r => r.json()),
      fetch('/api/auth/session').then(r => r.json()),
    ])
      .then(([users, session]) => {
        setUsuarios(Array.isArray(users) ? users : [])
        setCurrentUser(session?.user)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      if (res.ok) {
        setUsuarios(usuarios.map(u => u.id === userId ? { ...u, role: newRole } : u))
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const handlePermissionChange = (resource: string, action: string) => {
    const key = `${resource}-${action}`
    setPermisos(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const savePermissions = async (userId: string) => {
    setSavingPermisos(true)
    try {
      const permissionsList = Object.entries(permisos)
        .filter(([, allowed]) => allowed)
        .map(([key]) => {
          const [resource, action] = key.split('-')
          return { resource, action }
        })

      const res = await fetch('/api/roles/permisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, permisos: permissionsList }),
      })
      if (res.ok) {
        setExpandedUser(null)
      }
    } catch (error) {
      console.error('Error saving permissions:', error)
    }
    setSavingPermisos(false)
  }

  if (loading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Roles y Permisos</h2>
        <p className="text-gray-500 text-sm">
          {isLiderGeneral ? 'Gestiona los roles y permisos de todos los usuarios' : 'Visualiza los roles y permisos (solo lectura)'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Usuario</TableTh>
                <TableTh>Email</TableTh>
                <TableTh>Rol</TableTh>
                <TableTh>Red Asignada</TableTh>
                <TableTh>Acciones</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map(u => (
                <TableRow key={u.id}>
                  <TableTd>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name || '?'} size="sm" />
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </TableTd>
                  <TableTd>{u.email}</TableTd>
                  <TableTd>
                    {isLiderGeneral ? (
                      <Select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="w-40"
                      >
                        {roleOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Select>
                    ) : (
                      <Badge variant="secondary">{getRoleLabel(u.role ?? '')}</Badge>
                    )}
                  </TableTd>
                  <TableTd>
                    {u.redes?.[0]?.red?.nombre ? (
                      <Badge variant="outline">{u.redes[0].red.nombre}</Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </TableTd>
                  <TableTd>
                    {isLiderGeneral && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                      >
                        {expandedUser === u.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
                    )}
                  </TableTd>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permissions Grid - Expandable */}
      {isLiderGeneral && expandedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Permisos — {usuarios.find(u => u.id === expandedUser)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Recurso</th>
                    {actions.map(action => (
                      <th key={action} className="text-center py-2 px-3 font-medium text-gray-700">{action}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resources.map(resource => (
                    <tr key={resource.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-gray-900">{resource.name}</td>
                      {actions.map(action => {
                        const key = `${resource.id}-${action}`
                        return (
                          <td key={key} className="text-center py-3 px-3">
                            <input
                              type="checkbox"
                              checked={permisos[key] || false}
                              onChange={() => handlePermissionChange(resource.id, action)}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setExpandedUser(null)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => savePermissions(expandedUser)}
                disabled={savingPermisos}
              >
                {savingPermisos ? 'Guardando...' : 'Guardar Permisos'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLiderGeneral && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-800">
              Solo los Líderes Generales pueden modificar roles y permisos. Contacta a un administrador para cambios.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
