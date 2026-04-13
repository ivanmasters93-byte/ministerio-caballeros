'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatDateShort } from '@/lib/utils'
import { Wifi, WifiOff, Send, Loader2, Smartphone, RefreshCw, Power } from 'lucide-react'

type ConnectionState = 'disconnected' | 'connecting' | 'connected'

interface QRResponse {
  qr: string | null
  status: ConnectionState
  connected: boolean
  phone: string | null
}

interface Message {
  id: string
  numero: string
  nombre: string
  mensaje: string
  fecha: Date
  tipo: 'entrada' | 'salida'
}

export default function WhatsappPage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [qrDataURI, setQrDataURI] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({ hermano: '', mensaje: '' })
  const [hermanos, setHermanos] = useState<{ id: string; user?: { name?: string; phone?: string } }[]>([])
  const [sending, setSending] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pollQR = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/qr')
      if (!res.ok) return
      const data: QRResponse = await res.json()

      setConnectionState(data.status)
      setQrDataURI(data.qr)
      setPhoneNumber(data.phone)
    } catch {
      // Silently handle - will retry on next poll
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    pollQR()

    // Fetch hermanos
    fetch('/api/hermanos')
      .then(r => r.json())
      .then(data => setHermanos(Array.isArray(data) ? data : []))
      .catch(() => {})

    // Poll every 5 seconds
    pollRef.current = setInterval(pollQR, 5000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [pollQR])

  const handleAction = async (action: 'disconnect' | 'reconnect' | 'connect') => {
    setActionLoading(true)
    try {
      await fetch('/api/whatsapp/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      // Immediately poll to update state
      await pollQR()
    } catch (error) {
      console.error('Connection action failed:', error)
    }
    setActionLoading(false)
  }

  const handleSendMessage = async () => {
    if (!formData.hermano || !formData.mensaje.trim()) return

    setSending(true)
    try {
      const hermano = hermanos.find(h => h.id === formData.hermano)
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hermanoId: formData.hermano, mensaje: formData.mensaje }),
      })

      if (res.ok) {
        const newMessage: Message = {
          id: Date.now().toString(),
          numero: hermano?.user?.phone || '',
          nombre: hermano?.user?.name || 'Desconocido',
          mensaje: formData.mensaje,
          fecha: new Date(),
          tipo: 'salida',
        }
        setMessages(prev => [...prev, newMessage])
        setFormData({ hermano: '', mensaje: '' })
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
    setSending(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Integración WhatsApp</h2>
        <p className="text-gray-500 text-sm">Conecta tu WhatsApp escaneando el código QR</p>
      </div>

      {/* Connection Status */}
      <Card className={
        connectionState === 'connected'
          ? 'border-green-200 bg-green-50'
          : connectionState === 'connecting'
            ? 'border-yellow-200 bg-yellow-50'
            : 'border-red-200 bg-red-50'
      }>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connectionState === 'connected' ? (
                <>
                  <Wifi size={20} className="text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Conectado</p>
                    <p className="text-sm text-green-700">
                      {phoneNumber ? `Número: +${phoneNumber}` : 'WhatsApp conectado y listo'}
                    </p>
                  </div>
                </>
              ) : connectionState === 'connecting' ? (
                <>
                  <Loader2 size={20} className="text-yellow-600 animate-spin" />
                  <div>
                    <p className="font-medium text-yellow-900">Conectando...</p>
                    <p className="text-sm text-yellow-700">Escanea el código QR con tu WhatsApp</p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff size={20} className="text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Desconectado</p>
                    <p className="text-sm text-red-700">Presiona reconectar para iniciar sesión</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                connectionState === 'connected' ? 'success'
                  : connectionState === 'connecting' ? 'warning'
                    : 'danger'
              }>
                {connectionState === 'connected' ? 'Activo'
                  : connectionState === 'connecting' ? 'Conectando'
                    : 'Inactivo'}
              </Badge>

              {connectionState === 'connected' ? (
                <Button
                  onClick={() => handleAction('disconnect')}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                >
                  <Power size={14} className="mr-1" />
                  {actionLoading ? 'Procesando...' : 'Desconectar'}
                </Button>
              ) : connectionState === 'disconnected' ? (
                <Button
                  onClick={() => handleAction('reconnect')}
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
                >
                  <RefreshCw size={14} className="mr-1" />
                  {actionLoading ? 'Procesando...' : 'Reconectar'}
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code / Connection Info */}
        <Card>
          <CardHeader>
            <CardTitle>
              {connectionState === 'connected' ? 'Información de Conexión' : 'Código QR'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectionState === 'connected' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Smartphone size={24} className="text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Sesión activa</p>
                    {phoneNumber && (
                      <p className="text-sm text-green-700">Número: +{phoneNumber}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Tu WhatsApp está conectado. Puedes enviar y recibir mensajes desde esta consola.
                </p>
              </div>
            ) : connectionState === 'connecting' && qrDataURI ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <img
                    src={qrDataURI}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    Escanea el código QR con WhatsApp
                  </p>
                  <p className="text-xs text-gray-500">
                    Abre WhatsApp en tu teléfono &gt; Menú &gt; Dispositivos vinculados &gt; Vincular dispositivo
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 size={12} className="animate-spin" />
                  <span>El código se actualiza automáticamente</span>
                </div>
              </div>
            ) : connectionState === 'connecting' ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-sm text-gray-500">Generando código QR...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <WifiOff size={32} className="text-gray-300" />
                <p className="text-sm text-gray-500">
                  Presiona &quot;Reconectar&quot; para generar un nuevo código QR
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Message */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar Mensaje Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectionState !== 'connected' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                Conecta WhatsApp primero para enviar mensajes
              </div>
            )}

            <div>
              <Label htmlFor="hermano">Hermano</Label>
              <Select
                id="hermano"
                value={formData.hermano}
                onChange={e => setFormData({ ...formData, hermano: e.target.value })}
                disabled={connectionState !== 'connected'}
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
                disabled={connectionState !== 'connected'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Caracteres: {formData.mensaje.length}
              </p>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={sending || !formData.hermano || !formData.mensaje.trim() || connectionState !== 'connected'}
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
              <p className="text-center text-gray-400 py-8">
                {connectionState === 'connected'
                  ? 'No hay mensajes aún. Envía el primero.'
                  : 'Conecta WhatsApp para ver mensajes'}
              </p>
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
