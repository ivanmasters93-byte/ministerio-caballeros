'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import {
  Crown,
  Shield,
  Users,
  Mail,
  Phone,
  Pencil,
  Loader2,
} from 'lucide-react'

// ============================================================
// TYPES
// ============================================================
interface LiderUser {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
}

interface RedLiderazgo {
  id: string
  nombre: string
  tipo: 'MENOR' | 'MEDIA' | 'MAYOR'
  edadMin: number
  edadMax: number
  lideres: LiderUser[]
  _count: { miembros: number }
}

interface LiderazgoData {
  liderGeneral: LiderUser | null
  secretario: LiderUser | null
  asistente: LiderUser | null
  redes: RedLiderazgo[]
}

// ============================================================
// HELPERS
// ============================================================
const TIPO_LABEL: Record<string, string> = {
  MENOR: 'Red Menor',
  MEDIA: 'Red Media',
  MAYOR: 'Red Mayor',
}

const TIPO_COLOR: Record<string, { badge: string; accent: string; glow: string }> = {
  MENOR: {
    badge: 'default',
    accent: 'var(--color-accent-blue)',
    glow: 'rgba(59,130,246,0.12)',
  },
  MEDIA: {
    badge: 'warning',
    accent: 'var(--color-accent-amber)',
    glow: 'rgba(245,158,11,0.12)',
  },
  MAYOR: {
    badge: 'success',
    accent: 'var(--color-accent-green)',
    glow: 'rgba(34,197,94,0.12)',
  },
}

function ContactRow({ icon: Icon, value }: { icon: React.ComponentType<{ size?: number; className?: string }>, value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
      <Icon size={13} className="text-[var(--color-text-muted)] flex-shrink-0" />
      <span className="truncate">{value}</span>
    </div>
  )
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg"
      style={{ background: 'var(--color-bg-elevated)', border: '1px dashed var(--color-border-subtle)' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--color-bg-sidebar)' }}
      >
        <Users size={16} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
    </div>
  )
}

function PersonCard({ user }: { user: LiderUser }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg"
      style={{ background: 'var(--color-bg-elevated)' }}
    >
      <Avatar name={user.name} size="md" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-text-primary)' }}>
          {user.name}
        </p>
        <ContactRow icon={Mail} value={user.email} />
        <ContactRow icon={Phone} value={user.phone} />
      </div>
    </div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function LiderazgoPage() {
  const [data, setData] = useState<LiderazgoData | null>(null)
  const [currentRole, setCurrentRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false)
  const [editingRed, setEditingRed] = useState<RedLiderazgo | null>(null)
  const [availableLideres, setAvailableLideres] = useState<LiderUser[]>([])
  const [selectedLider1, setSelectedLider1] = useState<string>('')
  const [selectedLider2, setSelectedLider2] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const isLiderGeneral = currentRole === 'LIDER_GENERAL'

  const fetchData = useCallback(async () => {
    try {
      const [liderazgoRes, sessionRes] = await Promise.all([
        fetch('/api/liderazgo'),
        fetch('/api/auth/session'),
      ])
      const [liderazgo, session] = await Promise.all([
        liderazgoRes.json(),
        sessionRes.json(),
      ])
      setData(liderazgo)
      setCurrentRole(session?.user?.role ?? null)
    } catch {
      setError('No se pudo cargar la información de liderazgo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Fetch all users as candidates for leader assignment
  const openEditDialog = async (red: RedLiderazgo) => {
    setEditingRed(red)
    setSaveError(null)

    try {
      const res = await fetch('/api/roles')
      const users: LiderUser[] = await res.json()
      // Show ALL users — when assigned, their role will be updated to LIDER_RED
      const candidates = Array.isArray(users) ? users : []
      setAvailableLideres(candidates)
      setSelectedLider1(red.lideres[0]?.id ?? '')
      setSelectedLider2(red.lideres[1]?.id ?? '')
    } catch {
      setAvailableLideres([])
    }

    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!editingRed) return
    setSaving(true)
    setSaveError(null)

    const liderIds = [selectedLider1, selectedLider2].filter(Boolean)

    try {
      const res = await fetch('/api/liderazgo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redId: editingRed.id, liderIds }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error desconocido' }))
        setSaveError(err.error ?? 'Error al guardar')
        return
      }

      setEditOpen(false)
      setEditingRed(null)
      await fetchData()
    } catch {
      setSaveError('Error de conexión. Intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'var(--color-bg-elevated)' }} />
        <div className="h-40 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-elevated)' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-elevated)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-elevated)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-12 text-center">
          <p style={{ color: 'var(--color-accent-red)' }}>{error}</p>
        </CardContent>
      </Card>
    )
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          Estructura de Liderazgo
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Jerarquía oficial del Ministerio GEDEONES
        </p>
      </div>

      {/* TIER 1 — LÍDER GENERAL */}
      <div>
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid rgba(201,168,76,0.25)',
            background: 'linear-gradient(135deg, var(--color-bg-surface) 0%, rgba(201,168,76,0.04) 100%)',
          }}
        >
          {/* Dark header band */}
          <div
            className="px-6 py-3 flex items-center gap-2"
            style={{
              background: 'linear-gradient(90deg, rgba(201,168,76,0.15) 0%, transparent 100%)',
              borderBottom: '1px solid rgba(201,168,76,0.15)',
            }}
          >
            <Crown size={16} style={{ color: 'var(--color-accent-gold)' }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-accent-gold)' }}
            >
              Líder General
            </span>
          </div>

          <div className="px-6 py-5">
            {data?.liderGeneral ? (
              <div className="flex items-center gap-4">
                <Avatar name={data.liderGeneral.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xl font-bold"
                    style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
                  >
                    {data.liderGeneral.name}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1.5">
                    <ContactRow icon={Mail} value={data.liderGeneral.email} />
                    <ContactRow icon={Phone} value={data.liderGeneral.phone} />
                  </div>
                </div>
                <Badge variant="warning">Líder General</Badge>
              </div>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                Sin líder general asignado
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CONNECTOR LINE */}
      <div className="flex justify-center">
        <div className="w-px h-6" style={{ background: 'var(--color-border-default)' }} />
      </div>

      {/* TIER 2 — SECRETARIO + ASISTENTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SECRETARIO */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: 'var(--color-accent-blue)' }} />
              <CardTitle className="text-sm uppercase tracking-widest font-semibold" style={{ color: 'var(--color-accent-blue)' }}>
                Secretario
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {data?.secretario ? (
              <PersonCard user={data.secretario} />
            ) : (
              <EmptySlot label="Sin secretario asignado" />
            )}
          </CardContent>
        </Card>

        {/* ASISTENTE */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: 'var(--color-accent-purple)' }} />
              <CardTitle className="text-sm uppercase tracking-widest font-semibold" style={{ color: 'var(--color-accent-purple)' }}>
                Asistente
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {data?.asistente ? (
              <PersonCard user={data.asistente} />
            ) : (
              <EmptySlot label="Sin asistente asignado" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* CONNECTOR LINE */}
      <div className="flex justify-center">
        <div className="w-px h-6" style={{ background: 'var(--color-border-default)' }} />
      </div>

      {/* TIER 3 — REDES */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Redes
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.redes.length === 0 ? (
            <Card className="md:col-span-3">
              <CardContent className="pt-10 text-center">
                <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                  No hay redes registradas
                </p>
              </CardContent>
            </Card>
          ) : (
            data?.redes.map((red) => {
              const colors = TIPO_COLOR[red.tipo] ?? TIPO_COLOR.MENOR
              return (
                <div
                  key={red.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: `1px solid ${colors.accent}30`,
                    background: `linear-gradient(135deg, var(--color-bg-surface) 0%, ${colors.glow} 100%)`,
                  }}
                >
                  {/* Red header */}
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{
                      background: `${colors.glow}`,
                      borderBottom: `1px solid ${colors.accent}20`,
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Users size={14} style={{ color: colors.accent }} />
                      <span
                        className="text-xs font-bold uppercase tracking-wider truncate"
                        style={{ color: colors.accent }}
                      >
                        {TIPO_LABEL[red.tipo] ?? red.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {red.edadMin}–{red.edadMax} años
                      </span>
                      {isLiderGeneral && (
                        <button
                          onClick={() => openEditDialog(red)}
                          title="Editar líderes de red"
                          className="p-1 rounded transition-colors cursor-pointer"
                          style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = colors.accent)}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Leaders */}
                  <div className="px-4 py-4 space-y-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {red._count.miembros} hermanos
                      </Badge>
                    </div>

                    {red.lideres.length === 0 ? (
                      <>
                        <EmptySlot label="Líder 1 sin asignar" />
                        <EmptySlot label="Líder 2 sin asignar" />
                      </>
                    ) : (
                      <>
                        {red.lideres.map(lider => (
                          <PersonCard key={lider.id} user={lider} />
                        ))}
                        {red.lideres.length < 2 && (
                          <EmptySlot label="Líder 2 sin asignar" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* EDIT DIALOG */}
      <Dialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingRed(null); setSaveError(null) }}
        title={`Líderes de ${editingRed ? (TIPO_LABEL[editingRed.tipo] ?? editingRed.nombre) : ''}`}
      >
        <div className="space-y-5">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Selecciona hasta 2 líderes para esta red. Solo usuarios con rol <strong>Líder de Red</strong> pueden ser asignados.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Líder 1
              </label>
              <Select
                value={selectedLider1}
                onChange={e => {
                  const val = e.target.value
                  setSelectedLider1(val)
                  if (val && val === selectedLider2) setSelectedLider2('')
                }}
              >
                <option value="">— Sin asignar —</option>
                {availableLideres.map(u => (
                  <option key={u.id} value={u.id} disabled={u.id === selectedLider2 && selectedLider2 !== ''}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Líder 2
              </label>
              <Select
                value={selectedLider2}
                onChange={e => {
                  const val = e.target.value
                  setSelectedLider2(val)
                  if (val && val === selectedLider1) setSelectedLider1('')
                }}
              >
                <option value="">— Sin asignar —</option>
                {availableLideres.map(u => (
                  <option key={u.id} value={u.id} disabled={u.id === selectedLider1 && selectedLider1 !== ''}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {availableLideres.length === 0 && (
            <p className="text-xs text-center py-2" style={{ color: 'var(--color-text-muted)' }}>
              No hay hermanos registrados aun. Comparte el link de registro primero.
            </p>
          )}
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Al asignar un hermano como lider, su rol se actualizara automaticamente.
          </p>

          {saveError && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--color-accent-red-soft)', color: 'var(--color-accent-red)' }}>
              {saveError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setEditOpen(false); setEditingRed(null); setSaveError(null) }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Guardando...
                </span>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
