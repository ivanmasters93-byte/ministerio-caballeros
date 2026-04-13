'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Mail, Send, Users, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

// ============================================================
// TIPOS
// ============================================================

interface Red {
  id: string
  nombre: string
  tipo: string
  _count?: { miembros: number }
}

interface SendResult {
  success: boolean
  sent: number
  failed: number
  total: number
  provider: string
  errors?: string[]
}

type DestinatarioMode = 'all' | 'lideres' | 'red' | 'custom'
type TemplateKey = 'custom' | 'announcement' | 'event_reminder' | 'follow_up'

const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  custom: 'Mensaje personalizado',
  announcement: 'Comunicado / Anuncio',
  event_reminder: 'Recordatorio de evento',
  follow_up: 'Seguimiento pastoral',
}

// ============================================================
// VISTA PREVIA HTML
// ============================================================

function HtmlPreview({ html }: { html: string }) {
  return (
    <div
      style={{
        background: '#0c0e14',
        border: '1px solid #2a2d3a',
        borderRadius: 8,
        overflow: 'hidden',
        maxHeight: 400,
      }}
    >
      <iframe
        srcDoc={html}
        style={{ width: '100%', height: 400, border: 'none', display: 'block' }}
        title="Vista previa del email"
        sandbox="allow-same-origin"
      />
    </div>
  )
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

export default function EmailPage() {
  const [redes, setRedes] = useState<Red[]>([])
  const [destinatarioMode, setDestinatarioMode] = useState<DestinatarioMode>('all')
  const [selectedRed, setSelectedRed] = useState('')
  const [customEmails, setCustomEmails] = useState('')
  const [template, setTemplate] = useState<TemplateKey>('announcement')
  const [subject, setSubject] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)

  // Campos de plantilla: announcement
  const [tituloAnuncio, setTituloAnuncio] = useState('')
  const [contenidoAnuncio, setContenidoAnuncio] = useState('')

  // Campos de plantilla: event_reminder
  const [eventoNombre, setEventoNombre] = useState('')
  const [eventoFecha, setEventoFecha] = useState('')
  const [eventoHora, setEventoHora] = useState('')
  const [eventoLugar, setEventoLugar] = useState('')
  const [eventoLink, setEventoLink] = useState('')

  // Campos de plantilla: follow_up
  const [hermanoName, setHermanoName] = useState('')
  const [liderName, setLiderName] = useState('')
  const [mensajePastoral, setMensajePastoral] = useState('')

  // Campos de template: custom
  const [htmlPersonalizado, setHtmlPersonalizado] = useState('')

  useEffect(() => {
    fetch('/api/redes')
      .then(r => r.json())
      .then(data => setRedes(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => {})
  }, [])

  // ---- Preview HTML ----
  const buildPreviewHtml = (): string => {
    if (template === 'custom') return htmlPersonalizado

    // Para la vista previa, construimos un html descriptivo del template
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })

    if (template === 'announcement') {
      return `<p><b>Asunto:</b> ${subject || tituloAnuncio}</p><p><b>Titulo:</b> ${tituloAnuncio}</p><p><b>Contenido:</b> ${contenidoAnuncio}</p><p><b>Fecha:</b> ${fecha}</p>`
    }
    if (template === 'event_reminder') {
      return `<p><b>Evento:</b> ${eventoNombre}</p><p><b>Fecha:</b> ${eventoFecha}</p><p><b>Hora:</b> ${eventoHora}</p><p><b>Lugar:</b> ${eventoLugar}</p>${eventoLink ? `<p><b>Link:</b> ${eventoLink}</p>` : ''}`
    }
    if (template === 'follow_up') {
      return `<p><b>Para:</b> ${hermanoName}</p><p><b>De:</b> ${liderName}</p><p><b>Mensaje:</b> ${mensajePastoral}</p>`
    }
    return ''
  }

  // ---- Build request body ----
  const buildPayload = () => {
    const base: Record<string, unknown> = { subject }

    // Destinatarios
    if (destinatarioMode === 'all') {
      base.toAll = true
      base.to = []
    } else if (destinatarioMode === 'lideres') {
      base.toLideres = true
      base.to = []
    } else if (destinatarioMode === 'red') {
      base.redTipo = selectedRed
      base.to = []
    } else {
      base.to = customEmails.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean)
    }

    // Contenido
    if (template === 'custom') {
      base.html = htmlPersonalizado
    } else {
      base.template = template
      const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })

      if (template === 'announcement') {
        base.data = { titulo: tituloAnuncio, contenido: contenidoAnuncio, fecha }
      } else if (template === 'event_reminder') {
        base.data = { evento: eventoNombre, fecha: eventoFecha, hora: eventoHora, lugar: eventoLugar, link: eventoLink || undefined }
      } else if (template === 'follow_up') {
        base.data = { hermanoName, liderName, mensaje: mensajePastoral }
      }
    }

    return base
  }

  const handleSend = async () => {
    if (!subject.trim()) {
      alert('Ingresa el asunto del email')
      return
    }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const data: SendResult = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, sent: 0, failed: 1, total: 1, provider: 'unknown', errors: ['Error de red'] })
    } finally {
      setSending(false)
    }
  }

  const redTipos: Record<string, string> = { MENOR: 'Red Menor', MEDIA: 'Red Media', MAYOR: 'Red Mayor' }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1C3B6F, #D4842A)' }}
        >
          <Mail size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Correo Electrónico
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Envía mensajes a hermanos y líderes de la comunidad
          </p>
        </div>
      </div>

      {/* Resultado */}
      {result && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {result.success
                    ? `${result.sent} email${result.sent !== 1 ? 's' : ''} enviado${result.sent !== 1 ? 's' : ''} correctamente`
                    : `Envío con errores: ${result.sent} enviados, ${result.failed} fallidos`}
                </p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">Proveedor: {result.provider}</Badge>
                  <Badge variant={result.failed === 0 ? 'success' : 'warning'}>
                    {result.sent}/{result.total} enviados
                  </Badge>
                </div>
                {result.errors && result.errors.length > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {result.errors[0]}
                  </p>
                )}
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-xs cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo — Configuración */}
        <div className="space-y-4">
          {/* Destinatarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users size={16} />
                Destinatarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="destinatario-mode">Enviar a</Label>
                <Select
                  id="destinatario-mode"
                  value={destinatarioMode}
                  onChange={e => setDestinatarioMode(e.target.value as DestinatarioMode)}
                >
                  <option value="all">Todos los hermanos</option>
                  <option value="lideres">Solo líderes y secretarios</option>
                  <option value="red">Una red específica</option>
                  <option value="custom">Emails personalizados</option>
                </Select>
              </div>

              {destinatarioMode === 'red' && (
                <div>
                  <Label htmlFor="red-select">Red</Label>
                  <Select
                    id="red-select"
                    value={selectedRed}
                    onChange={e => setSelectedRed(e.target.value)}
                  >
                    <option value="">-- Seleccionar red --</option>
                    {redes.map(r => (
                      <option key={r.id} value={r.tipo}>
                        {r.nombre} ({redTipos[r.tipo] || r.tipo})
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {destinatarioMode === 'custom' && (
                <div>
                  <Label htmlFor="custom-emails">Emails (separados por coma o nueva línea)</Label>
                  <Textarea
                    id="custom-emails"
                    placeholder="ejemplo@correo.com&#10;otro@correo.com"
                    value={customEmails}
                    onChange={e => setCustomEmails(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plantilla y asunto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mensaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-select">Plantilla</Label>
                <Select
                  id="template-select"
                  value={template}
                  onChange={e => setTemplate(e.target.value as TemplateKey)}
                >
                  {Object.entries(TEMPLATE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  placeholder="Asunto del email..."
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              {/* Campos por plantilla */}
              {template === 'announcement' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="titulo-anuncio">Título del anuncio</Label>
                    <Input
                      id="titulo-anuncio"
                      placeholder="Título..."
                      value={tituloAnuncio}
                      onChange={e => setTituloAnuncio(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contenido-anuncio">Contenido</Label>
                    <Textarea
                      id="contenido-anuncio"
                      placeholder="Escribe el contenido del anuncio..."
                      value={contenidoAnuncio}
                      onChange={e => setContenidoAnuncio(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {template === 'event_reminder' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="evento-nombre">Nombre del evento</Label>
                    <Input
                      id="evento-nombre"
                      placeholder="Nombre del evento..."
                      value={eventoNombre}
                      onChange={e => setEventoNombre(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="evento-fecha">Fecha</Label>
                      <Input
                        id="evento-fecha"
                        type="date"
                        value={eventoFecha}
                        onChange={e => setEventoFecha(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="evento-hora">Hora</Label>
                      <Input
                        id="evento-hora"
                        type="time"
                        value={eventoHora}
                        onChange={e => setEventoHora(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="evento-lugar">Lugar</Label>
                    <Input
                      id="evento-lugar"
                      placeholder="Lugar o dirección..."
                      value={eventoLugar}
                      onChange={e => setEventoLugar(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="evento-link">Enlace (opcional)</Label>
                    <Input
                      id="evento-link"
                      placeholder="https://..."
                      value={eventoLink}
                      onChange={e => setEventoLink(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {template === 'follow_up' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="hermano-name">Nombre del hermano</Label>
                    <Input
                      id="hermano-name"
                      placeholder="Nombre completo..."
                      value={hermanoName}
                      onChange={e => setHermanoName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lider-name">Tu nombre (líder)</Label>
                    <Input
                      id="lider-name"
                      placeholder="Tu nombre..."
                      value={liderName}
                      onChange={e => setLiderName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mensaje-pastoral">Mensaje pastoral</Label>
                    <Textarea
                      id="mensaje-pastoral"
                      placeholder="Escribe tu mensaje de seguimiento..."
                      value={mensajePastoral}
                      onChange={e => setMensajePastoral(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {template === 'custom' && (
                <div>
                  <Label htmlFor="html-personalizado">HTML del email</Label>
                  <Textarea
                    id="html-personalizado"
                    placeholder="<p>Tu contenido HTML aquí...</p>"
                    value={htmlPersonalizado}
                    onChange={e => setHtmlPersonalizado(e.target.value)}
                    className="min-h-[160px] font-mono text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Ocultar vista previa' : 'Vista previa'}
            </Button>
            <Button
              size="md"
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 flex-1 justify-center"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Enviar Email
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Panel derecho — Vista previa */}
        <div>
          {showPreview ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye size={16} />
                  Vista Previa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-xl">
                <HtmlPreview html={buildPreviewHtml()} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <Mail size={40} className="mx-auto" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Haz clic en <strong>Vista previa</strong> para ver el email antes de enviarlo
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info del proveedor */}
          <Card className="mt-4">
            <CardContent className="py-4">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Configuración del proveedor
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Proveedor activo</span>
                  <Badge variant="secondary">
                    {process.env.NEXT_PUBLIC_EMAIL_PROVIDER || 'auto-detect'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Resend</span>
                  <Badge variant={typeof window !== 'undefined' ? 'outline' : 'outline'}>
                    Configura RESEND_API_KEY
                  </Badge>
                </div>
              </div>
              <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Sin API key configurada, los emails se muestran en los logs del servidor (modo consola).
                Registra en <a href="https://resend.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-gold)' }}>resend.com</a> para envíos reales gratuitos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
