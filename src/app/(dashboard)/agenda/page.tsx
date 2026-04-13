'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Video, MonitorPlay } from 'lucide-react'

const TIPO_COLORS: Record<string, string> = {
  REUNION: 'bg-blue-100 text-blue-800',
  CULTO: 'bg-purple-100 text-purple-800',
  RETIRO: 'bg-green-100 text-green-800',
  CAPACITACION: 'bg-yellow-100 text-yellow-800',
  SOCIAL: 'bg-pink-100 text-pink-800',
  OTRO: 'bg-gray-100 text-gray-800',
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<{ id: string; titulo: string; fecha: string; hora?: string; tipo: string; descripcion?: string; zoomLink?: string; youtubeLink?: string; red?: { nombre: string } }[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetch('/api/eventos').then(r => r.json()).then(data => setEventos(Array.isArray(data) ? data : []))
  }, [])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agenda</h2>
          <p className="text-gray-500 text-sm capitalize">{monthName}</p>
        </div>
        <Button size="sm">+ Nuevo Evento</Button>
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
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
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
              {selectedDate ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona un día'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDayEventos.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">Sin eventos este día</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayEventos.map(e => (
                    <div key={e.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm text-gray-900">{e.titulo}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${TIPO_COLORS[e.tipo]}`}>{e.tipo}</span>
                      </div>
                      {e.hora && <p className="text-xs text-gray-500 mt-1">🕐 {e.hora}</p>}
                      {e.red && <p className="text-xs text-gray-500">📡 {e.red.nombre}</p>}
                      {e.zoomLink && <a href={e.zoomLink} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"><Video size={12} /> Unirse al Zoom</a>}
                      {e.youtubeLink && <a href={e.youtubeLink} target="_blank" className="text-xs text-red-600 hover:underline flex items-center gap-1 mt-1"><MonitorPlay size={12} /> Ver en YouTube</a>}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-gray-400 text-sm text-center py-6">Haz clic en un día para ver eventos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
