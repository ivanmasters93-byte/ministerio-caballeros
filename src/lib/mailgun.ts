import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);

let client: ReturnType<InstanceType<typeof Mailgun>['client']> | null = null;

function getClient() {
  if (!client && process.env.MAILGUN_API_KEY) {
    client = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });
  }
  return client;
}

export const FROM_EMAIL = process.env.MAILGUN_FROM || 'noreply@ministerio.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Mailgun (Free tier: 100 emails/month)
 */
export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.MAILGUN_API_KEY) {
    console.warn('Mailgun API key not configured, email not sent');
    return { success: false, error: 'Mailgun not configured' };
  }

  if (!process.env.MAILGUN_DOMAIN) {
    console.warn('Mailgun domain not configured, email not sent');
    return { success: false, error: 'Mailgun domain not configured' };
  }

  try {
    const mailgunClient = getClient();
    if (!mailgunClient) {
      return { success: false, error: 'Failed to initialize Mailgun' };
    }

    const result = await mailgunClient.messages.create(
      process.env.MAILGUN_DOMAIN,
      {
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }
    );

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send event reminder email
 */
export async function sendEventReminder(
  hermanoEmail: string,
  hermanoName: string,
  eventTitle: string,
  eventDate: Date,
  eventLink?: string
) {
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Recordatorio de Evento</h2>
      <p>Hola ${hermanoName},</p>
      <p>Te recordamos sobre el siguiente evento:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${eventTitle}</h3>
        <p><strong>Fecha:</strong> ${formattedDate}</p>
        ${eventLink ? `<p><a href="${eventLink}" style="color: #4CAF50; text-decoration: none;">Acceder al evento</a></p>` : ''}
      </div>
      <p>¡Esperamos contar con tu presencia!</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">GEDEONES - Ministerio de Caballeros</p>
    </div>
  `;

  return sendEmail({
    to: hermanoEmail,
    subject: `Recordatorio: ${eventTitle}`,
    html,
  });
}

/**
 * Send announcement email
 */
export async function sendAnnouncement(
  hermanoEmail: string,
  hermanoName: string,
  title: string,
  content: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${title}</h2>
      <p>Hola ${hermanoName},</p>
      <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
        ${content}
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">GEDEONES - Ministerio de Caballeros</p>
    </div>
  `;

  return sendEmail({
    to: hermanoEmail,
    subject: title,
    html,
  });
}

/**
 * Send prayer request notification
 */
export async function sendPrayerRequestNotification(
  leadersEmails: string[],
  requestTitle: string,
  requestContent: string,
  createdBy: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Nueva Petición de Oración</h2>
      <p>Hermano/a,</p>
      <p>Se ha registrado una nueva petición de oración que requiere atención:</p>
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>${requestTitle}</h3>
        <p>${requestContent}</p>
        <p style="color: #666; font-size: 14px;"><em>Registrado por: ${createdBy}</em></p>
      </div>
      <p>Por favor, incluye esta petición en tus oraciones.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">GEDEONES - Ministerio de Caballeros</p>
    </div>
  `;

  const results = await Promise.all(
    leadersEmails.map(email =>
      sendEmail({
        to: email,
        subject: `Petición de Oración: ${requestTitle}`,
        html,
      })
    )
  );

  return results;
}

/**
 * Send attendance report
 */
export async function sendAttendanceReport(
  leaderEmail: string,
  redName: string,
  attendanceData: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  },
  eventTitle: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reporte de Asistencia</h2>
      <p>Líder,</p>
      <p>Se ha registrado la asistencia para el evento:</p>
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${eventTitle}</h3>
        <p><strong>Red:</strong> ${redName}</p>
        <p><strong>Total esperado:</strong> ${attendanceData.total}</p>
        <p><strong>Presente:</strong> ${attendanceData.present}</p>
        <p><strong>Ausente:</strong> ${attendanceData.absent}</p>
        <p><strong>Porcentaje:</strong> ${attendanceData.percentage.toFixed(1)}%</p>
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">GEDEONES - Ministerio de Caballeros</p>
    </div>
  `;

  return sendEmail({
    to: leaderEmail,
    subject: `Reporte de Asistencia: ${eventTitle}`,
    html,
  });
}

/**
 * Send weekly digest (Resumen semanal de actividades)
 */
export async function sendWeeklyDigest(
  leaderEmail: string,
  leaderName: string,
  summary: {
    eventsCount: number;
    attendanceTotal: number;
    newMembers: number;
    prayerRequests: number;
  }
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Resumen Semanal - GEDEONES</h2>
      <p>Hola ${leaderName},</p>
      <p>Aquí está tu resumen de actividades semanal:</p>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📅 Eventos:</strong> ${summary.eventsCount}</p>
        <p><strong>👥 Asistencia registrada:</strong> ${summary.attendanceTotal} hermanos</p>
        <p><strong>🆕 Nuevos miembros:</strong> ${summary.newMembers}</p>
        <p><strong>🙏 Peticiones de oración:</strong> ${summary.prayerRequests}</p>
      </div>
      <p>Continúa el excelente trabajo en el ministerio!</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">GEDEONES - Ministerio de Caballeros</p>
    </div>
  `;

  return sendEmail({
    to: leaderEmail,
    subject: 'Resumen Semanal - GEDEONES',
    html,
  });
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail({
  email,
  name,
  temporalPassword,
  red
}: {
  email: string;
  name: string;
  temporalPassword: string;
  red: string;
}) {
  const redNames: Record<string, string> = {
    MENOR: 'Red Menor (18-30 años)',
    MEDIA: 'Red Media (31-40 años)',
    MAYOR: 'Red Mayor (41-75 años)'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1C3B6F 0%, #D4842A 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 32px;">¡Bienvenido a GEDEONES!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Ministerio de Caballeros</p>
      </div>

      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <p>Hola <strong>${name}</strong>,</p>

        <p>¡Nos alegra mucho que te hayas registrado en GEDEONES! Ahora eres parte de una comunidad de hermanos conectados en fe.</p>

        <div style="background: white; padding: 20px; border-left: 4px solid #1C3B6F; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #1C3B6F;">Tus Credenciales de Acceso</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Contraseña temporal:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-weight: bold;">${temporalPassword}</code></p>
          <p style="color: #666; font-size: 12px; margin-top: 15px;">⚠️ Te recomendamos cambiar tu contraseña al primer acceso.</p>
        </div>

        <div style="background: #e8f5e9; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #2e7d32;">Tu Red Ministerial</h3>
          <p style="margin: 10px 0;"><strong>🌍 Red asignada:</strong> ${redNames[red] || 'Red Asignada'}</p>
          <p style="color: #666; font-size: 14px; margin: 10px 0;">Aquí conocerás a hermanos de tu edad y participarás en actividades especiales para tu red.</p>
        </div>

        <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #856404;">Próximos Pasos</h3>
          <ol style="margin: 10px 0; padding-left: 20px;">
            <li>Accede a <strong>GEDEONES</strong> con tus credenciales</li>
            <li>Cambia tu contraseña temporal por una nueva</li>
            <li>Explora el calendario y los eventos próximos</li>
            <li>¡Conecta con tu comunidad y crece en fe!</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://gedeones.app'}" style="display: inline-block; background: linear-gradient(135deg, #1C3B6F 0%, #D4842A 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Acceder a GEDEONES
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #666; font-size: 12px; text-align: center;">
          Si tienes preguntas, contacta a tu líder de red.<br>
          <strong>GEDEONES © 2024 - Ministerio de Caballeros</strong>
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '¡Bienvenido a GEDEONES! - Tu Registro fue Exitoso',
    html,
  });
}
