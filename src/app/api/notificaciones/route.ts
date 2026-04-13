import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requireAuth, jsonResponse, getNumberParam } from '@/lib/api-helpers'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth()

  const { searchParams } = new URL(req.url)
  const diasInactividad = getNumberParam(searchParams, 'diasInactividad') || 30
  const diasProximoEvento = getNumberParam(searchParams, 'diasProximoEvento') || 7

  const now = new Date()
  const diasInactivoDate = new Date(now.getTime() - diasInactividad * 24 * 60 * 60 * 1000)
  const proximoEventoDate = new Date(now.getTime() + diasProximoEvento * 24 * 60 * 60 * 1000)

  // 1. Hermanos inactivos (sin asistencia en X días)
  const hermanosInactivos = await prisma.hermano.findMany({
    where: {
      OR: [
        { ultimaAsistencia: { lt: diasInactivoDate } },
        { ultimaAsistencia: null },
      ],
      estado: { in: ['ACTIVO', 'NUEVO'] },
    },
    include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } },
    take: 10,
  })

  // 2. Ausencias consecutivas en últimos eventos
  const ultimosEventos = await prisma.evento.findMany({
    orderBy: { fecha: 'desc' },
    take: 3,
  })

  const ausenciasPorHermano: Record<string, number> = {}
  for (const evento of ultimosEventos) {
    const ausentes = await prisma.asistenciaDetalle.findMany({
      where: {
        asistencia: { eventoId: evento.id },
        presente: false,
      },
      select: { hermanoId: true },
    })
    for (const { hermanoId } of ausentes) {
      ausenciasPorHermano[hermanoId] = (ausenciasPorHermano[hermanoId] || 0) + 1
    }
  }

  const hermanosCon2oMasAusencias = Object.entries(ausenciasPorHermano)
    .filter(([, count]) => count >= 2)
    .slice(0, 10)

  const hermanosAusentes = await prisma.hermano.findMany({
    where: { id: { in: Object.keys(ausenciasPorHermano).filter((id) => ausenciasPorHermano[id] >= 2) } },
    include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } },
  })

  // 3. Próximas citas de seguimiento
  const proximasCitas = await prisma.seguimiento.findMany({
    where: {
      proximoContacto: { gte: now, lte: proximoEventoDate },
      estado: { in: ['ABIERTO', 'EN_PROCESO'] },
    },
    include: { hermano: { include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } } } },
    orderBy: { proximoContacto: 'asc' },
    take: 10,
  })

  // 4. Próximos eventos
  const proximosEventos = await prisma.evento.findMany({
    where: { fecha: { gte: now, lte: proximoEventoDate } },
    include: { red: true },
    orderBy: { fecha: 'asc' },
    take: 10,
  })

  // 5. Peticiones de oración urgentes
  const peticionesUrgentes = await prisma.peticionOracion.findMany({
    where: {
      prioridad: 'URGENTE',
      estado: { in: ['ACTIVA', 'EN_ORACION'] },
    },
    include: { hermano: { include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // 6. Anuncios recientes urgentes
  const anunciosUrgentes = await prisma.anuncio.findMany({
    where: {
      prioridad: 'URGENTE',
      activo: true,
    },
    include: { red: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // 7. Cuotas pendientes
  const cuotasPendientes = await prisma.cuota.findMany({
    where: { estado: 'PENDIENTE' },
    include: { hermano: { include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } } } },
    orderBy: { fecha: 'asc' },
    take: 10,
  })

  return jsonResponse({
    alerts: [
      {
        type: 'inactivity',
        title: 'Hermanos Inactivos',
        description: `${hermanosInactivos.length} hermano(s) sin asistencia en ${diasInactividad} días`,
        count: hermanosInactivos.length,
        items: hermanosInactivos,
        severity: hermanosInactivos.length > 5 ? 'high' : 'medium',
      },
      {
        type: 'absences',
        title: 'Ausencias Consecutivas',
        description: `${hermanosAusentes.length} hermano(s) con 2+ ausencias recientes`,
        count: hermanosAusentes.length,
        items: hermanosAusentes,
        severity: hermanosAusentes.length > 3 ? 'high' : 'medium',
      },
      {
        type: 'follow_up',
        title: 'Citas de Seguimiento Próximas',
        description: `${proximasCitas.length} seguimiento(s) programado(s)`,
        count: proximasCitas.length,
        items: proximasCitas,
        severity: 'info',
      },
      {
        type: 'events',
        title: 'Próximos Eventos',
        description: `${proximosEventos.length} evento(s) en los próximos ${diasProximoEvento} días`,
        count: proximosEventos.length,
        items: proximosEventos,
        severity: 'info',
      },
      {
        type: 'prayer_urgent',
        title: 'Peticiones de Oración Urgentes',
        description: `${peticionesUrgentes.length} petición(es) urgente(s)`,
        count: peticionesUrgentes.length,
        items: peticionesUrgentes,
        severity: peticionesUrgentes.length > 0 ? 'high' : 'info',
      },
      {
        type: 'announcements_urgent',
        title: 'Anuncios Urgentes',
        description: `${anunciosUrgentes.length} anuncio(s) urgente(s)`,
        count: anunciosUrgentes.length,
        items: anunciosUrgentes,
        severity: anunciosUrgentes.length > 0 ? 'high' : 'info',
      },
      {
        type: 'pending_fees',
        title: 'Cuotas Pendientes',
        description: `${cuotasPendientes.length} cuota(s) sin pagar`,
        count: cuotasPendientes.length,
        items: cuotasPendientes,
        severity: cuotasPendientes.length > 5 ? 'high' : 'medium',
      },
    ],
    timestamp: now,
  })
})
