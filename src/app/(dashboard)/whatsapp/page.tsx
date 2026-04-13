'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatDateShort } from '@/lib/utils'
import { Wifi, WifiOff, Send, Phone, Key, Globe, BookOpen } from 'lucide-react'

interface Message {
  id: string
  numero: string
  nombre: string
  mensaje: string
  fecha: Date
  tipo: 'entrada' | 'salida'
}

// Mock messages for demonstration
const mockMessages: Message[] = [
  {
    id: '1',
    numero: '+502 7123 4567',
    nombre: 'Juan García',
    mensaje: '¿A qué hora es la próxima reunión?',
    fecha: new Date(Date.now() - 30 * 60000),
    tipo: 'entrada',
  },
  {
    id: '2',
    numero: '+502 7123 4567',
    nombre: 'Juan García',
    mensaje: 'La reunión es el domingo a las 10:00 AM en la iglesia.',
    fecha: new Date(Date.now() - 25 * 60000),
    tipo: 'salida',
  },
  {
    id: '3',
    numero: '+502 7234 5678',
    nombre: 'Carlos López',
    mensaje: 'Confirmo mi asistencia al evento de esta semana',
    fecha: new Date(Date.now() - 15 * 60000),
    tipo: 'entrada',
  },
  {
    id: '4',
    numero: '+502 7345 6789',
    nombre: 'Miguel Rodríguez',
    mensaje: 'Gracias por el devocional de hoy',
    fecha: new Date(Date.now() - 5 * 60000),
    tipo: 'entrada',
  },
]

export default function WhatsappPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    hermano: '',
    mensaje: '',
  })
  const [hermanos, setHermanos] = useState<{ id: string; user?: { name?: string; phone?: string } }[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    // Check connection status
    fetch('/api/whatsapp/webhook')
      .then(r => r.json())
      .then(data => {
        setIsConnected(data.connected || false)
      })
      .catch(() => {
        setIsConnected(false)
      })

    // Fetch hermanos
    fetch('/api/hermanos')
      .then(r => r.json())
      .then(data => setHermanos(Array.isArray(data) ? data : []))
  }, [])

  const handleSendMessage = async () => {
    if (!formData.hermano || !formData.mensaje.trim()) return

    setSending(true)
    try {
      // Simulate sending
      const newMessage: Message = {
        id: (Date.now()).toString(),
        numero: 'Enviando...',
        nombre: hermanos.find(h => h.id === formData.hermano)?.user?.name || 'Unknown',
        mensaje: formData.mensaje,
        fecha: new Date(),
        tipo: 'salida',
      }

      setMessages([...messages, newMessage])
      setFormData({ hermano: '', mensaje: '' })

      // In a real implementation, this would call an API endpoint
      // await fetch('/api/whatsapp/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ hermanoId: formData.hermano, mensaje: formData.mensaje }),
      // })
    } catch (error) {
      console.error('Error sending message:', error)
    }
    setSending(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Integración WhatsApp</h2>
        <p className="text-gray-500 text-sm">Gestiona mensajes y comunicaciones vía WhatsApp</p>
      </div>

      {/* Connection Status */}
      <Card className={isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <Wifi size={20} className="text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Conectado</p>
                    <p className="text-sm text-green-700">La integración está activa y funcionando</p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff size={20} className="text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Desconectado</p>
                    <p className="text-sm text-red-700">Configura la conexión para usar esta función</p>
                  </div>
                </>
              )}
            </div>
            <Badge variant={isConnected ? 'success' : 'danger'}>
              {isConnected ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Número de Teléfono</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={16} />
                  <span className="font-mono">+502 7123 4567</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Solo lectura - contacta a administración para cambios</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Proveedor</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe size={16} />
                  <span className="font-mono">Twilio API</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">API Key</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <Key size={16} />
                  <span className="font-mono text-sm">••••••••••••••••••••••••••••••••</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Por seguridad, las claves no se muestran aquí</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
              <div className="flex items-start gap-2">
                <BookOpen size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Documentación</p>
                  <p className="mt-1">Consulta los documentos de configuración para más información sobre la integración.</p>
                  <a href="#" className="mt-2 inline-block text-blue-600 hover:underline text-xs font-medium">
                    Leer documentación →
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Message */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar Mensaje Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hermano">Hermano</Label>
              <Select
                id="hermano"
                value={formData.hermano}
                onChange={e => setFormData({ ...formData, hermano: e.target.value })}
              >
                <option value="">Seleccionar hermano...</option>
                {hermanos.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.user?.name} {h.user?.phone ? `(${h.user.phone})` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea
                id="mensaje"
                value={formData.mensaje}
                onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                placeholder="Escribe tu mensaje..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Caracteres: {formData.mensaje.length}
              </p>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={sending || !formData.hermano || !formData.mensaje.trim()}
              className="w-full"
            >
              <Send size={14} className="mr-2" />
              {sending ? 'Enviando...' : 'Enviar Mensaje'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Mensajes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Sin mensajes</p>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(selectedMessage === msg.id ? null : msg.id)}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{msg.nombre}</p>
                        <Badge
                          variant={msg.tipo === 'entrada' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {msg.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{msg.mensaje}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {msg.numero} · {formatDateShort(msg.fecha)}
                      </p>
                    </div>
                  </div>

                  {selectedMessage === msg.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-700 break-words">{msg.mensaje}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Hora exacta: {msg.fecha.toLocaleTimeString('es-ES')}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
