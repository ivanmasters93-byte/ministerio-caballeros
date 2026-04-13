import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured, email not sent');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

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
