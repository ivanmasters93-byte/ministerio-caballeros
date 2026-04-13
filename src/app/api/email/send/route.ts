import { NextRequest } from 'next/server'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { sendEmail, sendEmailBulk } from '@/lib/email'
import {
  welcomeEmail,
  announcementEmail,
  eventReminderEmail,
  followUpEmail,
} from '@/lib/email-templates'
import prisma from '@/lib/prisma'

// ============================================================
// TIPOS
// ============================================================

interface SendEmailBody {
  /** Destinatarios: lista de emails o IDs de hermanos */
  to: string[]
  subject: string
  /** Nombre de plantilla predefinida */
  template?: 'welcome' | 'announcement' | 'event_reminder' | 'follow_up'
  /** Datos para la plantilla */
  data?: Record<string, unknown>
  /** HTML personalizado (alternativa a template) */
  html?: string
  /** Si true, 'to' contiene IDs de hermanos en lugar de emails */
  useHermanoIds?: boolean
  /** Si true, envía a todos los hermanos de una red */
  redTipo?: 'MENOR' | 'MEDIA' | 'MAYOR'
  /** Si true, envía a todos los hermanos del sistema */
  toAll?: boolean
  /** Si true, envía solo a líderes */
  toLideres?: boolean
}

// ============================================================
// HELPERS
// ============================================================

async function resolveRecipients(body: SendEmailBody): Promise<string[]> {
  // Todos los hermanos
  if (body.toAll) {
    const users = await prisma.user.findMany({
      where: { email: { not: '' } },
      select: { email: true },
    })
    return users.map(u => u.email).filter(Boolean)
  }

  // Solo líderes
  if (body.toLideres) {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['LIDER_GENERAL', 'LIDER_RED', 'SECRETARIO'] },
        email: { not: '' },
      },
      select: { email: true },
    })
    return users.map(u => u.email).filter(Boolean)
  }

  // Por red
  if (body.redTipo) {
    const red = await prisma.red.findFirst({ where: { tipo: body.redTipo } })
    if (!red) return []
    const members = await prisma.redMember.findMany({
      where: { redId: red.id },
      include: { user: { select: { email: true } } },
    })
    return members.map(m => m.user.email).filter(Boolean)
  }

  // IDs de hermanos
  if (body.useHermanoIds && body.to.length > 0) {
    const hermanos = await prisma.hermano.findMany({
      where: { id: { in: body.to } },
      include: { user: { select: { email: true } } },
    })
    return hermanos.map(h => h.user.email).filter(Boolean)
  }

  // Lista de emails directos
  return body.to.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
}

function buildHtml(body: SendEmailBody): string | null {
  if (body.html) return body.html

  if (!body.template) return null

  const d = body.data || {}

  switch (body.template) {
    case 'welcome':
      return welcomeEmail(
        String(d.name || ''),
        String(d.redName || ''),
        d.email ? String(d.email) : undefined,
        d.temporalPassword ? String(d.temporalPassword) : undefined
      )

    case 'announcement':
      return announcementEmail(
        String(d.titulo || body.subject),
        String(d.contenido || ''),
        String(d.fecha || new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }))
      )

    case 'event_reminder':
      return eventReminderEmail(
        String(d.evento || body.subject),
        String(d.fecha || ''),
        String(d.hora || ''),
        String(d.lugar || ''),
        d.link ? String(d.link) : undefined
      )

    case 'follow_up':
      return followUpEmail(
        String(d.hermanoName || ''),
        String(d.liderName || ''),
        String(d.mensaje || '')
      )

    default:
      return null
  }
}

// ============================================================
// POST /api/email/send
// ============================================================

export const POST = withErrorHandling(async (req: NextRequest) => {
  // Requiere rol de líder general o líder de red
  const session = await requirePermiso(RECURSOS.ANUNCIOS, ACCIONES.CREAR)

  const body: SendEmailBody = await req.json()

  if (!body.subject?.trim()) {
    return errorResponse('El asunto del email es requerido', 400)
  }

  if (!body.html && !body.template) {
    return errorResponse('Se requiere html o template', 400)
  }

  const html = buildHtml(body)
  if (!html) {
    return errorResponse('No se pudo generar el contenido del email', 400)
  }

  const recipients = await resolveRecipients(body)
  if (recipients.length === 0) {
    return errorResponse('No se encontraron destinatarios válidos', 400)
  }

  // Enviar a todos los destinatarios
  const results = await sendEmailBulk(recipients, body.subject.trim(), html)

  const sent = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const provider = results[0]?.provider || 'unknown'

  console.log(`[email/send] ${sent} enviados, ${failed} fallidos — proveedor: ${provider} — por: ${session.user.email}`)

  return jsonResponse({
    success: failed === 0,
    sent,
    failed,
    total: recipients.length,
    provider,
    errors: failed > 0 ? results.filter(r => !r.success).map(r => r.error) : undefined,
  })
})
