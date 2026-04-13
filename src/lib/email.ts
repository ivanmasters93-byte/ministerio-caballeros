/**
 * Servicio de email para GEDEONES GP
 *
 * Proveedor principal: Gmail SMTP via Nodemailer
 * Configura en .env.local:
 *   GMAIL_USER=tucorreo@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
 *
 * Para obtener App Password:
 *   1. Ve a myaccount.google.com
 *   2. Seguridad -> Verificacion en 2 pasos (activar)
 *   3. Seguridad -> Contrasenas de aplicaciones
 *   4. Crear una para "Correo" -> copiar la clave de 16 caracteres
 */

import nodemailer from 'nodemailer'

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

function getTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

const DEFAULT_FROM_NAME = 'GEDEONES GP'

function getFromAddress(): string {
  const user = process.env.GMAIL_USER
  return user ? `${DEFAULT_FROM_NAME} <${user}>` : `${DEFAULT_FROM_NAME} <noreply@gedeones.com>`
}

async function sendViaGmail(payload: EmailPayload): Promise<EmailResult> {
  const transporter = getTransporter()

  if (!transporter) {
    console.log('\n[EMAIL - CONSOLE] Gmail no configurado')
    console.log('  To:', Array.isArray(payload.to) ? payload.to.join(', ') : payload.to)
    console.log('  Subject:', payload.subject)
    console.log('  HTML chars:', payload.html.length)
    console.log('[END EMAIL]\n')
    return { success: true, provider: 'console', messageId: `console-${Date.now()}` }
  }

  try {
    const info = await transporter.sendMail({
      from: payload.from || getFromAddress(),
      to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
      subject: payload.subject,
      html: payload.html,
    })

    console.log(`[EMAIL] Enviado a ${payload.to} | ID: ${info.messageId}`)
    return { success: true, provider: 'gmail', messageId: info.messageId }
  } catch (err) {
    console.error('[EMAIL] Error Gmail:', err)
    return { success: false, provider: 'gmail', error: String(err) }
  }
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  return sendViaGmail(payload)
}

export async function sendEmailBulk(
  recipients: string[],
  subject: string,
  html: string,
  from?: string
): Promise<EmailResult[]> {
  const results: EmailResult[] = []
  // Send sequentially to avoid Gmail rate limits
  for (const to of recipients) {
    const result = await sendEmail({ to, subject, html, from })
    results.push(result)
    // Small delay between emails to avoid rate limiting
    if (recipients.length > 5) {
      await new Promise(r => setTimeout(r, 500))
    }
  }
  return results
}

export const FROM_EMAIL = getFromAddress()
