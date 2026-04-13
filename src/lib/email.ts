/**
 * Servicio universal de email para GEDEONES GP
 *
 * Proveedores soportados:
 *   resend   — Resend.com (primario, 100 emails/día gratis, requiere RESEND_API_KEY)
 *   mailgun  — Mailgun (fallback, requiere MAILGUN_API_KEY + MAILGUN_DOMAIN)
 *   console  — Imprime en consola (dev / sin credenciales)
 *
 * Configura con: EMAIL_PROVIDER=resend|mailgun|console  (default: console)
 */

import FormData from 'form-data'
import Mailgun from 'mailgun.js'

// ============================================================
// TIPOS
// ============================================================

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export interface EmailResult {
  success: boolean
  provider: string
  messageId?: string
  error?: string
}

// ============================================================
// CONFIGURACIÓN
// ============================================================

const DEFAULT_FROM = 'GEDEONES GP <onboarding@resend.dev>'

function getProvider(): 'resend' | 'mailgun' | 'console' {
  const env = process.env.EMAIL_PROVIDER?.toLowerCase()
  if (env === 'resend' || env === 'mailgun' || env === 'console') return env

  // Auto-detect: use whichever key is available
  if (process.env.RESEND_API_KEY) return 'resend'
  if (process.env.MAILGUN_API_KEY) return 'mailgun'
  return 'console'
}

// ============================================================
// PROVEEDOR: CONSOLE (dev fallback)
// ============================================================

async function sendViaConsole(payload: EmailPayload): Promise<EmailResult> {
  const to = Array.isArray(payload.to) ? payload.to.join(', ') : payload.to
  console.log('\n[EMAIL - CONSOLE LOG]')
  console.log('  Provider  : console (sin API key)')
  console.log('  To        :', to)
  console.log('  From      :', payload.from || DEFAULT_FROM)
  console.log('  Subject   :', payload.subject)
  console.log('  HTML chars:', payload.html.length)
  console.log('[END EMAIL]\n')
  return { success: true, provider: 'console', messageId: `console-${Date.now()}` }
}

// ============================================================
// PROVEEDOR: RESEND
// ============================================================

async function sendViaResend(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY no configurado — fallback a console')
    return sendViaConsole(payload)
  }

  // Dynamic import to avoid bundling issues
  const { Resend } = await import('resend')
  const resend = new Resend(apiKey)

  const from = payload.from || process.env.RESEND_FROM_EMAIL || DEFAULT_FROM
  const to = Array.isArray(payload.to) ? payload.to : [payload.to]

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: payload.subject,
      html: payload.html,
    })

    if (error) {
      console.error('[email] Resend error:', error)
      return { success: false, provider: 'resend', error: error.message }
    }

    return { success: true, provider: 'resend', messageId: data?.id }
  } catch (err) {
    console.error('[email] Resend exception:', err)
    return { success: false, provider: 'resend', error: String(err) }
  }
}

// ============================================================
// PROVEEDOR: MAILGUN
// ============================================================

async function sendViaMailgun(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN

  if (!apiKey || !domain) {
    console.warn('[email] MAILGUN_API_KEY/MAILGUN_DOMAIN no configurados — fallback a console')
    return sendViaConsole(payload)
  }

  const mailgun = new Mailgun(FormData)
  const client = mailgun.client({ username: 'api', key: apiKey })
  const from = payload.from || process.env.MAILGUN_FROM || DEFAULT_FROM
  const to = Array.isArray(payload.to) ? payload.to : [payload.to]

  try {
    const result: unknown = await client.messages.create(domain, {
      from,
      to,
      subject: payload.subject,
      html: payload.html,
    })
    const mailgunResult = result as { id?: string }
    return { success: true, provider: 'mailgun', messageId: mailgunResult.id }
  } catch (err) {
    console.error('[email] Mailgun exception:', err)
    return { success: false, provider: 'mailgun', error: String(err) }
  }
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

/**
 * Envía un email usando el proveedor configurado.
 * Siempre resuelve (nunca lanza). Retorna EmailResult con success/error.
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const provider = getProvider()

  try {
    switch (provider) {
      case 'resend':
        return await sendViaResend(payload)
      case 'mailgun':
        return await sendViaMailgun(payload)
      default:
        return await sendViaConsole(payload)
    }
  } catch (err) {
    console.error('[email] Error inesperado:', err)
    return { success: false, provider, error: String(err) }
  }
}

/**
 * Envía a múltiples destinatarios en paralelo.
 * Retorna array de resultados individuales.
 */
export async function sendEmailBulk(
  recipients: string[],
  subject: string,
  html: string,
  from?: string
): Promise<EmailResult[]> {
  return Promise.all(
    recipients.map(to => sendEmail({ to, subject, html, from }))
  )
}

// ============================================================
// FROM EMAIL para exports de compatibilidad
// ============================================================
export const FROM_EMAIL = DEFAULT_FROM
