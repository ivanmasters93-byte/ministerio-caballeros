/**
 * Script: Enviar invitación a todos los hermanos (no líderes)
 *
 * Uso: DATABASE_URL="postgresql://..." npx tsx scripts/send-invite-hermanos.ts
 *
 * Envía un email con el link de la app y instrucciones de instalación PWA.
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ministerio_local'
const adapter = new PrismaPg({ connectionString: DB_URL })
const prisma = new PrismaClient({ adapter })

// ============================================================
// CONFIG - Cambia esto con tu URL real
// ============================================================
const APP_URL = process.env.APP_URL || 'https://gedeones.vercel.app'
const REGISTER_URL = `${APP_URL}/registro-hermanos`

// ============================================================
// EMAIL TEMPLATE
// ============================================================
function invitationEmailHtml(nombre: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0c0e14;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0e14;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1e28 0%,#0f1220 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center;border-bottom:2px solid rgba(201,168,76,0.3);">
          <div style="width:64px;height:64px;margin:0 auto 16px;background:rgba(201,168,76,0.15);border-radius:50%;border:2px solid rgba(201,168,76,0.4);line-height:64px;font-size:28px;">&#x271A;</div>
          <h1 style="margin:0;color:#c9a84c;font-size:24px;font-weight:700;letter-spacing:2px;">GEDEONES GP</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:3px;text-transform:uppercase;">Ministerio de Caballeros</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#13161e;padding:32px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
          <p style="color:rgba(255,255,255,0.9);font-size:18px;margin:0 0 8px;">Dios te bendiga, <strong style="color:#c9a84c;">${nombre}</strong></p>
          <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 24px;">
            Te invitamos a unirte a la plataforma oficial de GEDEONES GP. Desde aqui podras ver eventos, anuncios, chat con los hermanos, peticiones de oracion, la Biblia y mucho mas.
          </p>

          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 24px;">
              <a href="${APP_URL}" style="display:inline-block;background:linear-gradient(135deg,#d4a843,#c9a84c,#b8963f);color:#0a0e1a;font-size:18px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">
                Entrar a GEDEONES
              </a>
            </td></tr>
          </table>

          <!-- Divider -->
          <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent);margin:8px 0 24px;"></div>

          <!-- Install Instructions -->
          <p style="color:#c9a84c;font-size:16px;font-weight:600;margin:0 0 16px;">Como instalar en tu celular:</p>

          <!-- Android -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin:0 0 12px;">
            <p style="color:rgba(255,255,255,0.9);font-size:14px;font-weight:600;margin:0 0 8px;">Android (Chrome):</p>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5;margin:0;">
              1. Abre el link en Chrome<br>
              2. Te aparecera un banner dorado &ldquo;Instalar aplicacion&rdquo;<br>
              3. Toca el boton y listo, queda en tu pantalla de inicio
            </p>
          </div>

          <!-- iOS -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin:0 0 12px;">
            <p style="color:rgba(255,255,255,0.9);font-size:14px;font-weight:600;margin:0 0 8px;">iPhone / iPad (Safari):</p>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5;margin:0;">
              1. Abre el link en <strong>Safari</strong> (no Chrome)<br>
              2. Toca el boton de compartir &#x2B06; abajo<br>
              3. Selecciona &ldquo;Agregar a pantalla de inicio&rdquo;<br>
              4. Toca &ldquo;Agregar&rdquo;
            </p>
          </div>

          <!-- Registration note -->
          <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:12px;padding:16px;margin:16px 0 0;">
            <p style="color:rgba(255,255,255,0.8);font-size:14px;line-height:1.5;margin:0;">
              Si aun no tienes cuenta, puedes registrarte aqui:<br>
              <a href="${REGISTER_URL}" style="color:#c9a84c;font-weight:600;text-decoration:underline;">${REGISTER_URL}</a>
            </p>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:8px 0 0;">
              Si olvidaste tu contrasena, usa el enlace &ldquo;Recuperar contrasena&rdquo; en la pagina de inicio de sesion.
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0f1118;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">
            GEDEONES GP &middot; Ministerio de Caballeros<br>
            Este correo fue enviado porque eres miembro registrado.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ============================================================
// SEND FUNCTION
// ============================================================

async function sendViaMailgun(to: string, subject: string, html: string) {
  const apiKey = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN
  const from = process.env.MAILGUN_FROM || 'GEDEONES GP <noreply@gedeones.com>'

  if (!apiKey || !domain || apiKey === 'key-placeholder') {
    console.log(`  [CONSOLE] -> ${to}`)
    return { success: true, provider: 'console' }
  }

  const FormData = (await import('form-data')).default
  const Mailgun = (await import('mailgun.js')).default
  const mailgun = new Mailgun(FormData)
  const client = mailgun.client({ username: 'api', key: apiKey })

  try {
    await client.messages.create(domain, { from, to: [to], subject, html })
    console.log(`  [MAILGUN] -> ${to} OK`)
    return { success: true, provider: 'mailgun' }
  } catch (err) {
    console.error(`  [MAILGUN] -> ${to} ERROR:`, err)
    return { success: false, provider: 'mailgun', error: String(err) }
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('=== ENVIO DE INVITACIONES A HERMANOS ===\n')
  console.log(`App URL: ${APP_URL}`)
  console.log(`Registro: ${REGISTER_URL}\n`)

  const hermanos = await prisma.user.findMany({
    where: { role: 'HERMANO' },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  console.log(`Hermanos encontrados: ${hermanos.length}\n`)

  let sent = 0
  let failed = 0

  for (const h of hermanos) {
    const html = invitationEmailHtml(h.name)
    const subject = 'Bienvenido a GEDEONES GP - Instala la App'
    const result = await sendViaMailgun(h.email, subject, html)
    if (result.success) sent++
    else failed++
  }

  console.log(`\n=== RESULTADO ===`)
  console.log(`Enviados: ${sent}`)
  console.log(`Fallidos: ${failed}`)
  console.log(`Total: ${hermanos.length}`)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
