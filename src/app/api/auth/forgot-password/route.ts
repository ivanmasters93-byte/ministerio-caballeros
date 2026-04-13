import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  }

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } })

  if (user) {
    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } })

    // Create new token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${token}`

    await sendEmail({
      to: email,
      subject: 'Recuperar contrasena - GEDEONES GP',
      html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0c0e14;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0e14;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1a1e28,#0f1220);border-radius:16px 16px 0 0;padding:32px;text-align:center;border-bottom:2px solid rgba(201,168,76,0.3);">
          <h1 style="margin:0;color:#c9a84c;font-size:22px;font-weight:700;letter-spacing:2px;">GEDEONES GP</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:3px;text-transform:uppercase;">Ministerio de Caballeros</p>
        </td></tr>
        <tr><td style="background:#13161e;padding:32px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
          <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:0 0 16px;">Hola <strong style="color:#c9a84c;">${user.name}</strong>,</p>
          <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin:0 0 24px;">
            Recibimos una solicitud para restablecer tu contrasena. Haz clic en el boton de abajo para crear una nueva.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 24px;">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#d4a843,#c9a84c,#b8963f);color:#0a0e1a;font-size:16px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;">
                Restablecer Contrasena
              </a>
            </td></tr>
          </table>
          <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">
            Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este correo.
          </p>
        </td></tr>
        <tr><td style="background:#0f1118;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
          <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">GEDEONES GP &middot; Ministerio de Caballeros</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
  }

  return NextResponse.json({ message: 'Si el correo existe, recibiras un enlace para restablecer tu contrasena.' })
}
