'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/table'
import { Avatar } from '@/components/ui/avatar'
import { Dialog } from '@/components/ui/dialog'
import { EstadoBadge } from '@/components/hermanos/EstadoBadge'
import { formatDateShort, getEstadoLabel } from '@/lib/utils'
import {
  Search, Plus, Eye, Phone, MessageCircle, LayoutGrid, List,
  Users, UserCheck, UserPlus, AlertTriangle, UserMinus,
  BookOpen, ChevronRight, Loader2,
} from 'lucide-react'
import Link from 'next/link'

interface Hermano {
  id: string
  estado: string
  ultimaAsistencia?: string
  user?: {
    name?: string
    email?: string
    phone?: string
    redes?: Array<{ red?: { nombre?: string } }>
  }
  red?: { nombre?: string }
}

interface Red {
  id: string
  nombre: string
}

function formatPhone(phone?: string) {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

function daysSince(iso?: string): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

const ESTADO_COLORS: Record<string, { ring: string; bg: string; text: string }> = {
  ACTIVO:              { ring: 'var(--color-accent-green)',  bg: 'var(--color-accent-green-soft)',  text: 'var(--color-accent-green)' },
  NUEVO:               { ring: 'var(--color-accent-blue)',   bg: 'var(--color-accent-blue-soft)',   text: 'var(--color-accent-blue)' },
  PENDIENTE:           { ring: 'var(--color-accent-amber)',  bg: 'var(--color-accent-amber-soft)',  text: 'var(--color-accent-amber)' },
  REQUIERE_SEGUIMIENTO:{ ring: 'var(--color-accent-amber)',  bg: 'var(--color-accent-amber-soft)',  text: 'var(--color-accent-amber)' },
  INACTIVO:            { ring: 'var(--color-accent-red)',    bg: 'var(--color-accent-red-soft)',    text: 'var(--color-accent-red)' },
}

const FILTER_CHIPS = [
  { value: '',                     label: 'Todos' },
  { value: 'ACTIVO',               label: 'Activos' },
  { value: 'NUEVO',                label: 'Nuevos' },
  { value: 'REQUIERE_SEGUIMIENTO', label: 'Seguimiento' },
  { value: 'INACTIVO',             label: 'Inactivos' },
]

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */

function KPICard({
  icon: Icon, label, value, color, soft, onClick, active,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
  soft: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl p-4 transition-all duration-200 cursor-pointer focus:outline-none"
      style={{
        background: active ? soft : 'var(--color-bg-surface)',
        border: `1px solid ${active ? color : 'var(--color-border-subtle)'}`,
        boxShadow: active ? `0 0 0 1px ${color}22, 0 4px 16px ${color}18` : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: soft, color }}
        >
          <Icon size={18} />
        </div>
        <span
          className="text-2xl font-bold leading-none mt-0.5"
          style={{ color: active ? color : 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {value}
        </span>
      </div>
      <p className="mt-3 text-xs font-medium" style={{ color: active ? color : 'var(--color-text-muted)' }}>
        {label}
      </p>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Hermano Card (grid view)                                           */
/* ------------------------------------------------------------------ */

function HermanoCard({ h }: { h: Hermano }) {
  const phone = h.user?.phone
  const phoneClean = formatPhone(phone)
  const red = h.user?.redes?.[0]?.red?.nombre
  const est = ESTADO_COLORS[h.estado] ?? ESTADO_COLORS['PENDIENTE']
  const dias = daysSince(h.ultimaAsistencia)

  return (
    <div
      className="group relative rounded-xl flex flex-col overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Gold top accent on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, var(--color-accent-gold), transparent)` }}
      />

      {/* Card body */}
      <div className="p-5 flex flex-col items-center text-center gap-3">
        {/* Avatar with status ring */}
        <div
          className="rounded-full p-[2px]"
          style={{ background: `linear-gradient(135deg, ${est.ring}99, ${est.ring}33)` }}
        >
          <div style={{ background: 'var(--color-bg-surface)', borderRadius: '9999px', padding: '2px' }}>
            <Avatar name={h.user?.name || '?'} size="lg" />
          </div>
        </div>

        {/* Name + email */}
        <div>
          <p
            className="font-semibold leading-tight"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontSize: '0.9375rem' }}
          >
            {h.user?.name ?? 'Sin nombre'}
          </p>
          <p className="text-xs mt-0.5 truncate max-w-[140px]" style={{ color: 'var(--color-text-muted)' }}>
            {h.user?.email ?? '—'}
          </p>
        </div>

        {/* Red + Estado */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {red ? (
            <span
              className="px-2 py-0.5 rounded-md text-xs font-medium"
              style={{ background: 'var(--color-accent-blue-soft)', color: 'var(--color-accent-blue)' }}
            >
              {red}
            </span>
          ) : (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sin red</span>
          )}
          <span
            className="px-2 py-0.5 rounded-md text-xs font-medium"
            style={{ background: est.bg, color: est.text }}
          >
            {getEstadoLabel(h.estado)}
          </span>
        </div>

        {/* Last attendance */}
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {dias === null
            ? 'Sin asistencia'
            : dias === 0
            ? 'Asistió hoy'
            : dias === 1
            ? 'Asistió ayer'
            : `Hace ${dias} días`}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border-subtle)' }} />

      {/* Actions */}
      <div className="px-4 py-3 flex items-center justify-center gap-2">
        {phone && (
          <>
            <a
              href={`tel:${phone}`}
              title="Llamar"
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
              style={{ background: 'var(--color-accent-blue-soft)', color: 'var(--color-accent-blue)' }}
            >
              <Phone size={14} />
            </a>
            <a
              href={`https://wa.me/${phoneClean}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
              style={{ background: 'var(--color-accent-green-soft)', color: 'var(--color-accent-green)' }}
            >
              <MessageCircle size={14} />
            </a>
            <Link
              href={`/hermanos/enviar-versiculo?hermanoId=${h.id}`}
              title="Enviar versículo"
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
              style={{ background: 'var(--color-accent-gold-soft)', color: 'var(--color-accent-gold)' }}
            >
              <BookOpen size={14} />
            </Link>
          </>
        )}
        <Link
          href={`/hermanos/${h.id}`}
          title="Ver perfil"
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 ml-auto"
          style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
        >
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function HermanosPage() {
  const [hermanos, setHermanos] = useState<Hermano[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [view, setView] = useState<'cards' | 'table'>('cards')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [redes, setRedes] = useState<Red[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', telefono: '', redId: '',
    fechaNacimiento: '', direccion: '', ocupacion: '', estadoCivil: '',
  })

  const loadHermanos = () => {
    setLoading(true)
    fetch('/api/hermanos')
      .then(r => r.json())
      .then(data => {
        setHermanos(Array.isArray(data) ? data : (data?.data ?? []))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadHermanos() }, [])

  const openModal = () => {
    if (redes.length === 0) {
      fetch('/api/redes')
        .then(r => r.json())
        .then(data => setRedes(Array.isArray(data) ? data : (data?.data ?? [])))
        .catch(() => {})
    }
    setForm({ name: '', email: '', telefono: '', redId: '', fechaNacimiento: '', direccion: '', ocupacion: '', estadoCivil: '' })
    setSaveError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      const body: Record<string, unknown> = { name: form.name.trim(), email: form.email.trim() }
      if (form.telefono) body.phone = form.telefono
      if (form.redId) body.redId = form.redId
      if (form.fechaNacimiento) body.fechaNacimiento = form.fechaNacimiento
      if (form.direccion) body.direccion = form.direccion
      if (form.ocupacion) body.ocupacion = form.ocupacion
      if (form.estadoCivil) body.estadoCivil = form.estadoCivil

      const res = await fetch('/api/hermanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setModalOpen(false)
        loadHermanos()
      } else {
        const err = await res.json()
        setSaveError(err.error ?? 'Error al guardar')
      }
    } catch {
      setSaveError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  // Stats
  const stats = {
    total:    hermanos.length,
    activos:  hermanos.filter(h => h.estado === 'ACTIVO').length,
    nuevos:   hermanos.filter(h => h.estado === 'NUEVO').length,
    seguimiento: hermanos.filter(h => h.estado === 'REQUIERE_SEGUIMIENTO' || h.estado === 'PENDIENTE').length,
    inactivos: hermanos.filter(h => h.estado === 'INACTIVO').length,
  }

  // Filter
  const filtered = hermanos.filter(h => {
    const matchEstado = !filterEstado || h.estado === filterEstado
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (h.user?.name ?? '').toLowerCase().includes(q) ||
      (h.user?.email ?? '').toLowerCase().includes(q)
    return matchEstado && matchSearch
  })

  return (
    <div className="space-y-6" style={{ animation: 'var(--animate-fade-in)' }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold leading-tight"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Hermanos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {loading ? 'Cargando...' : `${stats.total} miembros registrados en el ministerio`}
          </p>
        </div>
        <Button size="sm" onClick={openModal} className="gap-1.5">
          <Plus size={15} />
          Nuevo Hermano
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard
          icon={Users} label="Total" value={stats.total}
          color="var(--color-accent-gold)" soft="var(--color-accent-gold-soft)"
          onClick={() => setFilterEstado('')}
          active={filterEstado === ''}
        />
        <KPICard
          icon={UserCheck} label="Activos" value={stats.activos}
          color="var(--color-accent-green)" soft="var(--color-accent-green-soft)"
          onClick={() => setFilterEstado(filterEstado === 'ACTIVO' ? '' : 'ACTIVO')}
          active={filterEstado === 'ACTIVO'}
        />
        <KPICard
          icon={UserPlus} label="Nuevos" value={stats.nuevos}
          color="var(--color-accent-blue)" soft="var(--color-accent-blue-soft)"
          onClick={() => setFilterEstado(filterEstado === 'NUEVO' ? '' : 'NUEVO')}
          active={filterEstado === 'NUEVO'}
        />
        <KPICard
          icon={AlertTriangle} label="Seguimiento" value={stats.seguimiento}
          color="var(--color-accent-amber)" soft="var(--color-accent-amber-soft)"
          onClick={() => setFilterEstado(filterEstado === 'REQUIERE_SEGUIMIENTO' ? '' : 'REQUIERE_SEGUIMIENTO')}
          active={filterEstado === 'REQUIERE_SEGUIMIENTO'}
        />
        <KPICard
          icon={UserMinus} label="Inactivos" value={stats.inactivos}
          color="var(--color-accent-red)" soft="var(--color-accent-red-soft)"
          onClick={() => setFilterEstado(filterEstado === 'INACTIVO' ? '' : 'INACTIVO')}
          active={filterEstado === 'INACTIVO'}
        />
      </div>

      {/* ── Search + View Toggle ── */}
      <div
        className="rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }} />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => setFilterEstado(chip.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
              style={{
                background: filterEstado === chip.value ? 'var(--color-accent-gold-soft)' : 'var(--color-bg-elevated)',
                color: filterEstado === chip.value ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
                border: `1px solid ${filterEstado === chip.value ? 'var(--color-accent-gold)' : 'transparent'}`,
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div
          className="flex items-center rounded-lg p-0.5 gap-0.5"
          style={{ background: 'var(--color-bg-elevated)' }}
        >
          <button
            onClick={() => setView('cards')}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150"
            style={{
              background: view === 'cards' ? 'var(--color-bg-surface)' : 'transparent',
              color: view === 'cards' ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
              boxShadow: view === 'cards' ? '0 1px 3px rgba(0,0,0,0.3)' : undefined,
            }}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView('table')}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150"
            style={{
              background: view === 'table' ? 'var(--color-bg-surface)' : 'transparent',
              color: view === 'table' ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
              boxShadow: view === 'table' ? '0 1px 3px rgba(0,0,0,0.3)' : undefined,
            }}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && search && (
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &ldquo;{search}&rdquo;
        </p>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-5 animate-pulse"
              style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', height: '220px' }}
            />
          ))}
        </div>
      )}

      {/* ── Cards view ── */}
      {!loading && view === 'cards' && (
        <>
          {filtered.length === 0 ? (
            <div
              className="rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-center"
              style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-bg-elevated)' }}
              >
                <Users size={22} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <p style={{ color: 'var(--color-text-secondary)' }}>No se encontraron hermanos</p>
              <button
                onClick={openModal}
                className="text-xs underline"
                style={{ color: 'var(--color-accent-gold)' }}
              >
                Registrar el primero
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(h => <HermanoCard key={h.id} h={h} />)}
            </div>
          )}
        </>
      )}

      {/* ── Table view ── */}
      {!loading && view === 'table' && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-border-subtle)' }}
        >
          <div className="overflow-x-auto">
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
                {filtered.map(h => {
                  const phone = h.user?.phone
                  const phoneClean = formatPhone(phone)
                  return (
                    <TableRow key={h.id}>
                      <TableTd>
                        <div className="flex items-center gap-3">
                          <Avatar name={h.user?.name || '?'} size="sm" />
                          <div>
                            <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{h.user?.name}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{h.user?.email}</p>
                          </div>
                        </div>
                      </TableTd>
                      <TableTd>
                        {h.user?.redes?.[0]?.red?.nombre ? (
                          <span
                            className="px-2 py-0.5 rounded-md text-xs font-medium"
                            style={{ background: 'var(--color-accent-blue-soft)', color: 'var(--color-accent-blue)' }}
                          >
                            {h.user.redes[0].red!.nombre}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">Sin red</span>
                        )}
                      </TableTd>
                      <TableTd><EstadoBadge estado={h.estado} /></TableTd>
                      <TableTd>
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {h.ultimaAsistencia ? formatDateShort(h.ultimaAsistencia) : '—'}
                        </span>
                      </TableTd>
                      <TableTd>
                        <div className="flex items-center gap-1.5">
                          {phone && (
                            <>
                              <a
                                href={`tel:${phone}`}
                                title="Llamar"
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                                style={{ background: 'var(--color-accent-blue-soft)', color: 'var(--color-accent-blue)' }}
                              >
                                <Phone size={13} />
                              </a>
                              <a
                                href={`https://wa.me/${phoneClean}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                                style={{ background: 'var(--color-accent-green-soft)', color: 'var(--color-accent-green)' }}
                              >
                                <MessageCircle size={13} />
                              </a>
                              <Link
                                href={`/hermanos/enviar-versiculo?hermanoId=${h.id}`}
                                title="Enviar versículo"
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                                style={{ background: 'var(--color-accent-gold-soft)', color: 'var(--color-accent-gold)' }}
                              >
                                <BookOpen size={13} />
                              </Link>
                            </>
                          )}
                          <Link href={`/hermanos/${h.id}`}>
                            <button
                              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                              style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
                            >
                              <Eye size={13} />
                            </button>
                          </Link>
                        </div>
                      </TableTd>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableTd colSpan={5} className="text-center py-10" style={{ color: 'var(--color-text-muted)' }}>
                      No se encontraron hermanos
                    </TableTd>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── Nuevo Hermano Modal ── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Hermano">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nombre *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre completo" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@ejemplo.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Teléfono</label>
              <Input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="+507 6000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Red</label>
              <Select value={form.redId} onChange={e => setForm(f => ({ ...f, redId: e.target.value }))}>
                <option value="">Sin red asignada</option>
                {redes.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Fecha de Nacimiento</label>
              <Input type="date" value={form.fechaNacimiento} onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Estado Civil</label>
              <Select value={form.estadoCivil} onChange={e => setForm(f => ({ ...f, estadoCivil: e.target.value }))}>
                <option value="">Seleccionar...</option>
                <option value="SOLTERO">Soltero</option>
                <option value="CASADO">Casado</option>
                <option value="DIVORCIADO">Divorciado</option>
                <option value="VIUDO">Viudo</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Ocupación</label>
            <Input value={form.ocupacion} onChange={e => setForm(f => ({ ...f, ocupacion: e.target.value }))} placeholder="Profesión u oficio" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Dirección</label>
            <Input value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} placeholder="Dirección de residencia" />
          </div>

          {saveError && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ color: 'var(--color-accent-red)', background: 'var(--color-accent-red-soft)' }}>
              {saveError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.email.trim()}
              className="flex-1 gap-2"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Registrar Hermano'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
