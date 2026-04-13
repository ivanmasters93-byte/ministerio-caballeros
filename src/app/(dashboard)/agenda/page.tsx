'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Video, MonitorPlay, Plus, Megaphone } from 'lucide-react'
import { getJitsiUrl } from '@/lib/jitsi/config'

const TIPO_COLORS: Record<string, string> = {
  REUNION: 'bg-blue-100 text-blue-800',
  CULTO: 'bg-purple-100 text-purple-800',
  RETIRO: 'bg-green-100 text-green-800',
  CAPACITACION: 'bg-yellow-100 text-yellow-800',
  SOCIAL: 'bg-pink-100 text-pink-800',
  OTRO: 'bg-gray-100 text-gray-800',
}

interface Evento {
  id: string
  titulo: string
  fecha: string
  hora?: string
  tipo: string
  descripcion?: string
  zoomLink?: string
  youtubeLink?: string
  jitsiEnabled?: boolean
  jitsiRoomId?: string
  red?: { nombre: string }
}

const TIPOS = ['REUNION', 'CULTO', 'RETIRO', 'CAPACITACION', 'SOCIAL', 'OTRO']

export default function AgendaPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showNuevo, setShowNuevo] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [showAnuncio, setShowAnuncio] = useState(false)
  const [anuncioForm, setAnuncioForm] = useState({ titulo: '', contenido: '', prioridad: 'NORMAL' })
  const [guardandoAnuncio, setGuardandoAnuncio] = useState(false)
  const [crearAnuncioAuto, setCrearAnuncioAuto] = useState(true)

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fecha: new Date().toISOString().slice(0, 10),
    hora: '',
    tipo: 'REUNION',
    zoomLink: '',
    youtubeLink: '',
    jitsiEnabled: false,
    redId: '',
  })

  const cargarEventos = () => {
    fetch('/api/eventos').then(r => r.json()).then(data => {
      const lista = Array.isArray(data) ? data : (data?.data ?? [])
      setEventos(lista)
    })
  }

  useEffect(() => { cargarEventos() }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)

  const getEventosForDay = (day: number) => {
    return eventos.filter(e => {
      const d = new Date(e.fecha)
      return d.getFullYear() === currentMonth.getFullYear() &&
             d.getMonth() === currentMonth.getMonth() &&
             d.getDate() === day
    })
  }

  const selectedDayEventos = selectedDate ? getEventosForDay(selectedDate.getDate()) : []

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const resetForm = () => {
    setForm({
      titulo: '',
      descripcion: '',
      fecha: new Date().toISOString().slice(0, 10),
      hora: '',
      tipo: 'REUNION',
      zoomLink: '',
      youtubeLink: '',
      jitsiEnabled: false,
      redId: '',
    })
  }

  const handleGuardar = async () => {
    if (!form.titulo.trim() || !form.fecha) return
    setGuardando(true)
    try {
      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion || undefined,
          fecha: form.fecha,
          hora: form.hora || undefined,
          tipo: form.tipo,
          zoomLink: form.zoomLink || undefined,
          youtubeLink: form.youtubeLink || undefined,
          jitsiEnabled: form.jitsiEnabled,
          redId: form.redId || undefined,
        }),
      })
      if (res.ok) {
        const evento = await res.json()
        // Auto-create announcement if toggle is on
        if (crearAnuncioAuto && form.titulo.trim()) {
          const fechaStr = new Date(form.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
          const contenido = `${form.descripcion || form.titulo}${form.hora ? ` — ${form.hora}` : ''}${form.descripcion ? '' : ` — ${fechaStr}`}`
          await fetch('/api/anuncios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              titulo: form.titulo.trim(),
              contenido,
              tipo: 'EVENTO',
              prioridad: 'NORMAL',
              paraTodasRedes: true,
              eventoId: evento.id,
            }),
          }).catch(() => {})
        }
        setShowNuevo(false)
        resetForm()
        cargarEventos()
      }
    } catch {
      // silently handle
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardarAnuncio = async () => {
    if (!anuncioForm.titulo.trim() || !anuncioForm.contenido.trim()) return
    setGuardandoAnuncio(true)
    try {
      const res = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: anuncioForm.titulo.trim(),
          contenido: anuncioForm.contenido.trim(),
          tipo: 'GENERAL',
          prioridad: anuncioForm.prioridad,
          paraTodasRedes: true,
        }),
      })
      if (res.ok) {
        setShowAnuncio(false)
        setAnuncioForm({ titulo: '', contenido: '', prioridad: 'NORMAL' })
      }
    } catch {} finally {
      setGuardandoAnuncio(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agenda</h2>
          <p className="text-gray-500 text-sm capitalize">{monthName}</p>
        </div>
        <Button size="sm" onClick={() => setShowNuevo(true)} className="flex items-center gap-1.5">
          <Plus size={14} />
          Nuevo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize">{monthName}</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1
                const dayEventos = getEventosForDay(day)
                const isToday = new Date().getDate() === day &&
                  new Date().getMonth() === currentMonth.getMonth() &&
                  new Date().getFullYear() === currentMonth.getFullYear()
                const isSelected = selectedDate?.getDate() === day &&
                  selectedDate?.getMonth() === currentMonth.getMonth()

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                    className={`relative p-1 rounded-lg text-sm transition-colors min-h-[48px] flex flex-col items-center ${
                      isSelected ? 'bg-blue-900 text-white' :
                      isToday ? 'bg-blue-50 text-blue-900 font-bold' :
                      'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span>{day}</span>
                    {dayEventos.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEventos.slice(0, 3).map(e => (
                          <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day detail */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona un dia'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <>
              {/* Quick action buttons for selected day */}
              <div className="flex gap-2 mb-4">
                <Button size="sm" onClick={() => {
                  setForm(f => ({ ...f, fecha: selectedDate.toISOString().slice(0, 10) }))
                  setShowNuevo(true)
                }} className="flex-1 flex items-center justify-center gap-1.5 text-xs">
                  <Plus size={12} /> Evento
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAnuncio(true)} className="flex-1 flex items-center justify-center gap-1.5 text-xs">
                  <Plus size={12} /> Anuncio
                </Button>
              </div>
              {selectedDayEventos.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Sin eventos este dia</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayEventos.map(e => (
                    <div key={e.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm text-gray-900">{e.titulo}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${TIPO_COLORS[e.tipo]}`}>{e.tipo}</span>
                      </div>
                      {e.hora && <p className="text-xs text-gray-500 mt-1">Hora: {e.hora}</p>}
                      {e.red && <p className="text-xs text-gray-500">Red: {e.red.nombre}</p>}
                      {e.zoomLink && <a href={e.zoomLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"><Video size={12} /> Unirse al Zoom</a>}
                      {e.youtubeLink && <a href={e.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 hover:underline flex items-center gap-1 mt-1"><MonitorPlay size={12} /> Ver en YouTube</a>}
                      {e.jitsiEnabled && e.jitsiRoomId && (
                        <a href={getJitsiUrl(e.jitsiRoomId)} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-1">
                          <Video size={12} /> Unirse a la videollamada
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
            ) : (
              <p className="text-gray-400 text-sm text-center py-6">Haz clic en un dia para ver eventos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New event dialog */}
      <Dialog
        open={showNuevo}
        onClose={() => { setShowNuevo(false); resetForm() }}
        title="Nuevo Evento"
        className="max-w-xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Titulo *
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Nombre del evento"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Fecha *
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Hora
              </label>
              <input
                type="time"
                value={form.hora}
                onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Tipo
            </label>
            <select
              value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
            >
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Descripcion
            </label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Descripcion opcional"
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Jitsi toggle */}
          <div
            className="flex items-center justify-between rounded-lg px-4 py-3"
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)' }}
          >
            <div className="flex items-center gap-3">
              <Video size={18} style={{ color: form.jitsiEnabled ? 'var(--color-accent-gold)' : 'var(--color-text-muted)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Habilitar videollamada
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Jitsi Meet - 100% gratuito, sin cuenta
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, jitsiEnabled: !f.jitsiEnabled }))}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
              style={{ background: form.jitsiEnabled ? 'var(--color-accent-gold)' : 'var(--color-border-default)' }}
              aria-label="Habilitar videollamada"
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                style={{ transform: form.jitsiEnabled ? 'translateX(22px)' : 'translateX(4px)' }}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Enlace Zoom (opcional)
            </label>
            <input
              type="url"
              value={form.zoomLink}
              onChange={e => setForm(f => ({ ...f, zoomLink: e.target.value }))}
              placeholder="https://zoom.us/j/..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Enlace YouTube (opcional)
            </label>
            <input
              type="url"
              value={form.youtubeLink}
              onChange={e => setForm(f => ({ ...f, youtubeLink: e.target.value }))}
              placeholder="https://youtube.com/..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Auto-create announcement toggle */}
          <div
            className="flex items-center justify-between rounded-lg px-4 py-3"
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Crear anuncio automatico
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Publicar anuncio del evento para todos
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCrearAnuncioAuto(!crearAnuncioAuto)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
              style={{ background: crearAnuncioAuto ? 'var(--color-accent-gold)' : 'var(--color-border-default)' }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                style={{ transform: crearAnuncioAuto ? 'translateX(22px)' : 'translateX(4px)' }}
              />
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setShowNuevo(false); resetForm() }}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={guardando || !form.titulo.trim()}
              className="flex items-center gap-2"
            >
              {guardando ? 'Guardando...' : 'Guardar evento'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Announcement creation dialog */}
      <Dialog
        open={showAnuncio}
        onClose={() => { setShowAnuncio(false); setAnuncioForm({ titulo: '', contenido: '', prioridad: 'NORMAL' }) }}
        title="Nuevo Anuncio"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Titulo *</label>
            <input
              type="text"
              value={anuncioForm.titulo}
              onChange={e => setAnuncioForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Titulo del anuncio"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Contenido *</label>
            <textarea
              value={anuncioForm.contenido}
              onChange={e => setAnuncioForm(f => ({ ...f, contenido: e.target.value }))}
              placeholder="Escribe el anuncio..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Prioridad</label>
            <select
              value={anuncioForm.prioridad}
              onChange={e => setAnuncioForm(f => ({ ...f, prioridad: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
            >
              <option value="BAJA">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowAnuncio(false)}>Cancelar</Button>
            <Button onClick={handleGuardarAnuncio} disabled={guardandoAnuncio || !anuncioForm.titulo.trim() || !anuncioForm.contenido.trim()}>
              {guardandoAnuncio ? 'Guardando...' : 'Publicar anuncio'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
