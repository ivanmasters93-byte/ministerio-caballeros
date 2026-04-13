import { prisma } from '@/lib/prisma'

/**
 * Alert types and severity levels
 */
export type AlertType =
  | 'ausencia_repetida'
  | 'proximo_contacto'
  | 'evento_proximo'
  | 'anuncio_expirando'
  | 'requiere_seguimiento'
  | 'cuota_pendiente'
  | 'peticion_antigua'

export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  message: string
  relatedId: string | null
  metadata?: Record<string, unknown>
  timestamp: Date
}

/**
 * Check for hermanos with repeated absences (3+ weeks without attending)
 * Returns alerts for members who haven't attended in 3+ weeks
 */
export async function checkRepeatedAbsences(daysWithoutAttendance: number = 21): Promise<Alert[]> {
  const alerts: Alert[] = []

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysWithoutAttendance)

    // Find hermanos with no attendance record after the cutoff date
    const hermanos = await prisma.hermano.findMany({
      where: {
        estado: 'ACTIVO',
        ultimaAsistencia: {
          lt: cutoffDate,
        },
      },
      include: {
        user: true,
        asistencias: {
          where: {
            asistencia: {
              fecha: { gte: cutoffDate },
            },
          },
          orderBy: { asistencia: { fecha: 'desc' } },
          take: 1,
        },
      },
    })

    hermanos.forEach((hermano) => {
      const daysAbsent = Math.floor(
        (Date.now() - hermano.ultimaAsistencia!.getTime()) / (1000 * 60 * 60 * 24)
      )

      const severity: AlertSeverity = daysAbsent > 42 ? 'critical' : 'warning'

      alerts.push({
        id: `ausencia-${hermano.id}`,
        type: 'ausencia_repetida',
        severity,
        message: `${hermano.user.name} no ha asistido en ${daysAbsent} días`,
        relatedId: hermano.id,
        metadata: {
          hermanoName: hermano.user.name,
          daysAbsent,
          lastAttendance: hermano.ultimaAsistencia,
        },
        timestamp: new Date(),
      })
    })
  } catch (error) {
    console.error('Error checking repeated absences:', error)
  }

  return alerts
}

/**
 * Check for upcoming próximo contacto dates (next 7 days)
 * Returns alerts for follow-ups scheduled in the next week
 */
export async function checkUpcomingFollowUps(daysAhead: number = 7): Promise<Alert[]> {
  const alerts: Alert[] = []

  try {
    const now = new Date()
    const future = new Date()
    future.setDate(future.getDate() + daysAhead)

    const seguimientos = await prisma.seguimiento.findMany({
      where: {
        estado: { in: ['ABIERTO', 'EN_PROCESO'] },
        proximoContacto: {
          gte: now,
          lte: future,
        },
      },
      include: {
        hermano: { include: { user: true } },
      },
      orderBy: { proximoContacto: 'asc' },
    })

    seguimientos.forEach((seg) => {
      const daysUntilContact = Math.ceil(
        (seg.proximoContacto!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      const severity: AlertSeverity = daysUntilContact <= 2 ? 'critical' : 'warning'

      alerts.push({
        id: `proximo-contacto-${seg.id}`,
        type: 'proximo_contacto',
        severity,
        message: `Próximo contacto con ${seg.hermano.user.name} en ${daysUntilContact} día${daysUntilContact !== 1 ? 's' : ''} (${seg.tipo})`,
        relatedId: seg.id,
        metadata: {
          hermanoName: seg.hermano.user.name,
          hermanoId: seg.hermano.id,
          daysUntilContact,
          type: seg.tipo,
          proximoContacto: seg.proximoContacto,
        },
        timestamp: new Date(),
      })
    })
  } catch (error) {
    console.error('Error checking upcoming follow-ups:', error)
  }

  return alerts
}

/**
 * Check for upcoming events (next 48 hours)
 * Returns alerts for events happening soon
 */
export async function checkUpcomingEvents(hoursAhead: number = 48): Promise<Alert[]> {
  const alerts: Alert[] = []

  try {
    const now = new Date()
    const future = new Date()
    future.setHours(future.getHours() + hoursAhead)

    const eventos = await prisma.evento.findMany({
      where: {
        fecha: {
          gte: now,
          lte: future,
        },
      },
      include: { red: true },
      orderBy: { fecha: 'asc' },
    })

    eventos.forEach((evento) => {
      const hoursUntilEvent = Math.floor(
        (evento.fecha.getTime() - Date.now()) / (1000 * 60 * 60)
      )

      const severity: AlertSeverity =
        hoursUntilEvent <= 2 ? 'critical' : hoursUntilEvent <= 24 ? 'warning' : 'info'

      alerts.push({
        id: `evento-${evento.id}`,
        type: 'evento_proximo',
        severity,
        message: `${evento.titulo} en ${hoursUntilEvent} hora${hoursUntilEvent !== 1 ? 's' : ''} (${new Date(evento.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`,
        relatedId: evento.id,
        metadata: {
          eventTitle: evento.titulo,
          hoursUntilEvent,
          fecha: evento.fecha,
          tipo: evento.tipo,
          red: evento.red?.nombre,
        },
        timestamp: new Date(),
      })
    })
  } catch (error) {
    console.error('Error checking upcoming events:', error)
  }

  return alerts
}

/**
 * Check for expiring announcements
 * Returns alerts for announcements that expire in the next 3 days
 */
export async function checkExpiringAnnouncements(daysAhead: number = 3): Promise<Alert[]> {
  const alerts: Alert[] = []

  try {
    const now = new Date()
    const future = new Date()
    future.setDate(future.getDate() + daysAhead)

    const anuncios = await prisma.anuncio.findMany({
      where: {
        activo: true,
        expiraEn: {
          gte: now,
          lte: future,
        },
      },
      orderBy: { expiraEn: 'asc' },
    })

    anuncios.forEach((anuncio) => {
      if (!anuncio.expiraEn) return

      const daysUntilExpiration = Math.ceil(
        (anuncio.expiraEn.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      const severity: AlertSeverity = daysUntilExpiration <= 1 ? 'warning' : 'info'

      alerts.push({
        id: `anuncio-${anuncio.id}`,
        type: 'anuncio_expirando',
        severity,
        message: `Anuncio "${anuncio.titulo}" expira en ${daysUntilExpiration} día${daysUntilExpiration !== 1 ? 's' : ''}`,
        relatedId: anuncio.id,
        metadata: {
          title: anuncio.titulo,
          daysUntilExpiration,
          expiraEn: anuncio.expiraEn,
        },
        timestamp: new Date(),
      })
    })
  } catch (error) {
    console.error('Error checking expiring announcements:', error)
  }

  return alerts
}

/**
 * Check for hermanos marked REQUIERE_SEGUIMIENTO without an open seguimiento
 * Returns alerts for members who need follow-up but don't have an open case
 */
export async function checkRequireFollowUp(): Promise<Alert[]> {
  const alerts: Alert[] = []

  try {
    const hermanos = await prisma.hermano.findMany({
      where: {
        estado: 'REQUIERE_SEGUIMIENTO',
      },
      include: {
        user: true,
        seguimientos: {
          where: {
            estado: { in: ['ABIERTO', 'EN_PROCESO'] },
          },
          take: 1,
        },
      },
    })

    hermanos.forEach((hermano) => {
      // If no open seguimiento exists
      if (hermano.seguimientos.length === 0) {
        alerts.push({
          id: `requiere-seg-${hermano.id}`,
          type: 'requiere_seguimiento',
          severity: 'warning',
          message: `${hermano.user.name} requiere seguimiento pero no tiene un caso abierto`,
          relatedId: hermano.id,
          metadata: {
            hermanoName: hermano.user.name,
            hermanoId: hermano.id,
          },
          timestamp: new Date(),
        })
      }
    })
  } catch (error) {
    console.error('Error checking require follow-up:', error)
  }

  return alerts
}

/**
 * Check for pending cuotas (financial contributions)
 * Returns alerts for significant overdue payments
 */
export async function checkPendingCuotas(daysOverdue: number = 30): Promise<Alert[]> {
  const alerts: Alert[] = []

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue)

    const cuotas = await prisma.cuota.findMany({
      where: {
        estado: 'PENDIENTE',
        createdAt: { lt: cutoffDate },
      },
      include: {
        hermano: { include: { user: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    })

    cuotas.forEach((cuota) => {
      const daysOverdueAmount = Math.floor(
        (Date.now() - cuota.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )

      const severity: AlertSeverity = daysOverdueAmount > 60 ? 'critical' : 'warning'

      alerts.push({
        id: `cuota-${cuota.id}`,
        type: 'cuota_pendiente',
        severity,
        message: `${cuota.hermano.user.name} tiene una cuota pendiente de $${cuota.monto.toFixed(2)} (${daysOverdueAmount} días vencida)`,
        relatedId: cuota.id,
        metadata: {
          hermanoName: cuota.hermano.user.name,
          hermanoId: cuota.hermano.id,
          monto: cuota.monto,
          daysOverdue: daysOverdueAmount,
        },
        timestamp: new Date(),
      })
    })
  } catch (error) {
    console.error('Error checking pending cuotas:', error)
  }

  return alerts
}

/**
 * Check for old prayer requests (peticiones de oración)
 * Returns alerts for prayer requests that are very old
 */
export async function checkOldPrayerRequests(daysOld: number = 30): Promise<Alert[]> {
  const alerts: Alert[] = []

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const peticiones = await prisma.peticionOracion.findMany({
      where: {
        estado: 'ACTIVA',
        createdAt: { lt: cutoffDate },
      },
      include: {
        hermano: { include: { user: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    })

    peticiones.forEach((peticion) => {
      const daysOldAmount = Math.floor(
        (Date.now() - peticion.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )

      alerts.push({
        id: `peticion-${peticion.id}`,
        type: 'peticion_antigua',
        severity: 'info',
        message: `Petición de oración de ${peticion.hermano.user.name} desde hace ${daysOldAmount} días (sin actualizar)`,
        relatedId: peticion.id,
        metadata: {
          hermanoName: peticion.hermano.user.name,
          hermanoId: peticion.hermano.id,
          daysOld: daysOldAmount,
          prioridad: peticion.prioridad,
        },
        timestamp: new Date(),
      })
    })
  } catch (error) {
    console.error('Error checking old prayer requests:', error)
  }

  return alerts
}

/**
 * Get all active alerts as a unified list
 * Runs all alert checks and returns them sorted by severity and date
 */
export async function getAllActiveAlerts(): Promise<Alert[]> {
  try {
    const [
      absences,
      followUps,
      upcomingEvents,
      expiringAnnouncements,
      requireFollowUp,
      pendingCuotas,
      oldPrayerRequests,
    ] = await Promise.all([
      checkRepeatedAbsences(),
      checkUpcomingFollowUps(),
      checkUpcomingEvents(),
      checkExpiringAnnouncements(),
      checkRequireFollowUp(),
      checkPendingCuotas(),
      checkOldPrayerRequests(),
    ])

    // Combine all alerts
    const allAlerts = [
      ...absences,
      ...followUps,
      ...upcomingEvents,
      ...expiringAnnouncements,
      ...requireFollowUp,
      ...pendingCuotas,
      ...oldPrayerRequests,
    ]

    // Sort by severity (critical > warning > info) then by timestamp
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    allAlerts.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
      if (severityDiff !== 0) return severityDiff
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

    return allAlerts
  } catch (error) {
    console.error('Error getting all active alerts:', error)
    return []
  }
}

/**
 * Get alerts grouped by type
 */
export async function getAlertsByType(): Promise<Record<AlertType, Alert[]>> {
  const allAlerts = await getAllActiveAlerts()

  const grouped: Record<AlertType, Alert[]> = {
    ausencia_repetida: [],
    proximo_contacto: [],
    evento_proximo: [],
    anuncio_expirando: [],
    requiere_seguimiento: [],
    cuota_pendiente: [],
    peticion_antigua: [],
  }

  allAlerts.forEach((alert) => {
    grouped[alert.type].push(alert)
  })

  return grouped
}

/**
 * Get alerts filtered by severity
 */
export async function getAlertsBySeverity(severity: AlertSeverity): Promise<Alert[]> {
  const allAlerts = await getAllActiveAlerts()
  return allAlerts.filter((alert) => alert.severity === severity)
}

/**
 * Get summary statistics of active alerts
 */
export async function getAlertsSummary() {
  const allAlerts = await getAllActiveAlerts()

  const summary = {
    totalAlerts: allAlerts.length,
    bySeverity: {
      critical: allAlerts.filter((a) => a.severity === 'critical').length,
      warning: allAlerts.filter((a) => a.severity === 'warning').length,
      info: allAlerts.filter((a) => a.severity === 'info').length,
    },
    byType: {} as Record<AlertType, number>,
  }

  allAlerts.forEach((alert) => {
    summary.byType[alert.type] = (summary.byType[alert.type] || 0) + 1
  })

  return summary
}
