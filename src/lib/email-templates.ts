/**
 * Plantillas de email en HTML para GEDEONES GP
 * Tema oscuro, mobile-friendly, en español
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gedeones.app'

/** Estilos base compartidos */
const wrapHtml = (body: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GEDEONES GP</title>
</head>
<body style="margin:0;padding:0;background:#0c0e14;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0e14;min-height:100vh;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <!-- Header -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#1C3B6F 0%,#D4842A 100%);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);font-weight:600;">MINISTERIO DE CABALLEROS</p>
              <h1 style="margin:8px 0 0;font-size:26px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase;">GEDEONES GP</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#161925;border:1px solid #2a2d3a;border-top:none;border-radius:0 0 12px 12px;padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#4a4f6a;letter-spacing:1px;">
                GEDEONES GP &middot; Ministerio de Caballeros &middot; ${new Date().getFullYear()}
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#4a4f6a;">
                <a href="${BASE_URL}" style="color:#D4842A;text-decoration:none;">${BASE_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

/** Botón CTA reutilizable */
const ctaButton = (href: string, text: string) => `
<table cellpadding="0" cellspacing="0" style="margin:24px auto;">
  <tr>
    <td style="background:linear-gradient(135deg,#1C3B6F,#D4842A);border-radius:8px;padding:1px;">
      <a href="${href}" style="display:inline-block;background:#161925;border-radius:7px;padding:12px 28px;color:#D4842A;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.5px;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`

/** Sección de información (caja oscura con borde) */
const infoBox = (content: string, accentColor = '#D4842A') => `
<div style="background:#1a1d2a;border:1px solid #2a2d3a;border-left:3px solid ${accentColor};border-radius:8px;padding:20px;margin:20px 0;">
  ${content}
</div>
`

// ============================================================
// PLANTILLAS
// ============================================================

/**
 * Email de bienvenida para nuevo hermano
 */
export function welcomeEmail(name: string, redName: string, email?: string, temporalPassword?: string): string {
  const redLabels: Record<string, string> = {
    MENOR: 'Red Menor (18–30 años)',
    MEDIA: 'Red Media (31–40 años)',
    MAYOR: 'Red Mayor (41–75 años)',
  }

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fff;">¡Bienvenido, <span style="color:#D4842A;">${name}</span>!</h2>
    <p style="margin:0 0 20px;color:#8b90a8;font-size:14px;line-height:1.6;">
      Es un honor tenerte en nuestra comunidad. Eres parte de algo más grande que tú mismo.
    </p>

    ${infoBox(`
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#D4842A;letter-spacing:1px;text-transform:uppercase;">Tu Red Ministerial</p>
      <p style="margin:0;font-size:16px;font-weight:600;color:#fff;">${redLabels[redName] || redName}</p>
    `, '#D4842A')}

    ${email && temporalPassword ? infoBox(`
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#7eb3ff;letter-spacing:1px;text-transform:uppercase;">Tus Credenciales de Acceso</p>
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#8b90a8;width:120px;">Correo:</td>
          <td style="padding:4px 0;font-size:13px;color:#fff;">${email}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#8b90a8;">Contraseña temporal:</td>
          <td style="padding:4px 0;">
            <code style="background:#0c0e14;border:1px solid #2a2d3a;border-radius:4px;padding:2px 8px;font-size:14px;font-weight:700;color:#D4842A;letter-spacing:2px;">${temporalPassword}</code>
          </td>
        </tr>
      </table>
      <p style="margin:12px 0 0;font-size:12px;color:#6b7080;">Cambia tu contraseña al primer acceso por seguridad.</p>
    `, '#7eb3ff') : ''}

    <div style="margin:24px 0 16px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#8b90a8;letter-spacing:1px;text-transform:uppercase;">Primeros pasos</p>
      <ol style="margin:0;padding:0 0 0 20px;color:#8b90a8;font-size:14px;line-height:1.8;">
        <li>Inicia sesión con tus credenciales</li>
        <li>Cambia tu contraseña temporal</li>
        <li>Explora el calendario de eventos</li>
        <li>Conecta con tu red y crecer en fe</li>
      </ol>
    </div>

    ${ctaButton(BASE_URL, 'Acceder a GEDEONES')}

    <p style="margin:20px 0 0;font-size:13px;color:#6b7080;line-height:1.6;">
      Si tienes preguntas, contacta a tu líder de red.<br/>
      Que Dios bendiga tu caminar con nosotros.
    </p>
  `
  return wrapHtml(body)
}

/**
 * Email de anuncio / comunicado general
 */
export function announcementEmail(titulo: string, contenido: string, fecha: string): string {
  const body = `
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#D4842A;letter-spacing:2px;text-transform:uppercase;">Comunicado Oficial</p>
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#fff;">${titulo}</h2>
    <p style="margin:0 0 20px;font-size:12px;color:#6b7080;">${fecha}</p>

    ${infoBox(`
      <div style="font-size:14px;color:#c8cad8;line-height:1.8;">${contenido}</div>
    `, '#D4842A')}

    ${ctaButton(BASE_URL, 'Ver en GEDEONES')}

    <p style="margin:20px 0 0;font-size:12px;color:#6b7080;line-height:1.6;">
      Este mensaje fue enviado a todos los miembros de GEDEONES GP.<br/>
      Para más información, accede a la plataforma.
    </p>
  `
  return wrapHtml(body)
}

/**
 * Email de recordatorio de evento
 */
export function eventReminderEmail(
  evento: string,
  fecha: string,
  hora: string,
  lugar: string,
  link?: string
): string {
  const body = `
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#7eb3ff;letter-spacing:2px;text-transform:uppercase;">Recordatorio de Evento</p>
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#fff;">${evento}</h2>

    ${infoBox(`
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6b7080;width:80px;">Fecha:</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;color:#fff;">${fecha}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6b7080;">Hora:</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;color:#fff;">${hora}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6b7080;">Lugar:</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;color:#fff;">${lugar}</td>
        </tr>
        ${link ? `
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6b7080;">Enlace:</td>
          <td style="padding:6px 0;">
            <a href="${link}" style="color:#D4842A;font-size:13px;text-decoration:none;font-weight:600;">Acceder al evento</a>
          </td>
        </tr>` : ''}
      </table>
    `, '#7eb3ff')}

    <p style="margin:16px 0 4px;font-size:14px;color:#c8cad8;">
      ¡Te esperamos con puntualidad! Tu presencia fortalece la comunidad.
    </p>

    ${link ? ctaButton(link, 'Acceder al Evento') : ctaButton(BASE_URL, 'Ver Detalles')}
  `
  return wrapHtml(body)
}

/**
 * Email de seguimiento pastoral — notificación al hermano
 */
export function followUpEmail(hermanoName: string, liderName: string, mensaje: string): string {
  const body = `
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#4ade80;letter-spacing:2px;text-transform:uppercase;">Mensaje Pastoral</p>
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#fff;">Hola, <span style="color:#D4842A;">${hermanoName}</span></h2>
    <p style="margin:0 0 20px;font-size:13px;color:#8b90a8;">Tu líder <strong style="color:#fff;">${liderName}</strong> tiene un mensaje para ti:</p>

    ${infoBox(`
      <p style="margin:0;font-size:14px;color:#c8cad8;line-height:1.8;font-style:italic;">"${mensaje}"</p>
      <p style="margin:12px 0 0;font-size:13px;color:#8b90a8;">— ${liderName}</p>
    `, '#4ade80')}

    <p style="margin:20px 0 4px;font-size:14px;color:#c8cad8;line-height:1.6;">
      Estamos aquí para acompañarte. No dudes en comunicarte con tu líder si necesitas apoyo.
    </p>

    ${ctaButton(BASE_URL, 'Abrir GEDEONES')}
  `
  return wrapHtml(body)
}
