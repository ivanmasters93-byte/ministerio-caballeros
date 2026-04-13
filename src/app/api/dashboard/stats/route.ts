import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requireAuth, jsonResponse } from '@/lib/api-helpers'

let statsCache: { data: unknown; timestamp: number } | null = null
const CACHE_TTL = 30_000 // 30 seconds

export const GET = withErrorHandling(async (req: NextRequest) => {
  // Dashboard is publicly readable for authenticated users
  await requireAuth()

  const now = Date.now()
  if (statsCache && (now - statsCache.timestamp) < CACHE_TTL) {
    return jsonResponse(statsCache.data)
  }

  const currentDate = new Date()
  const in7Days = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  const in30Days = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalHermanos,
    hermanosActivos,
    hermanosInactivos,
    hermanosNuevos,
    redesActivas,
    proximosEventos,
    eventosProximosMes,
    peticionesPendientes,
    hermanosRequierenSeguimiento,
    anunciosActivos,
    recentAnuncios,
    upcomingEventos,
    seguimientosAbiertos,
    cuotasPendientes,
    totalRecaudadoUltimo30,
  ] = await Promise.all([
    prisma.hermano.count(),
    prisma.hermano.count({ where: { estado: 'ACTIVO' } }),
    prisma.hermano.count({ where: { estado: 'INACTIVO' } }),
    prisma.hermano.count({ where: { estado: 'NUEVO' } }),
    prisma.red.count(),
    prisma.evento.count({ where: { fecha: { gte: currentDate, lte: in7Days } } }),
    prisma.evento.count({ where: { fecha: { gte: currentDate, lte: in30Days } } }),
    prisma.peticionOracion.count({ where: { estado: { in: ['ACTIVA', 'EN_ORACION'] } } }),
    prisma.hermano.count({ where: { estado: 'REQUIERE_SEGUIMIENTO' } }),
    prisma.anuncio.count({ where: { activo: true } }),
    prisma.anuncio.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { red: true },
    }),
    prisma.evento.findMany({
      where: { fecha: { gte: currentDate } },
      orderBy: { fecha: 'asc' },
      take: 5,
      include: { red: true },
    }),
    prisma.seguimiento.findMany({
      where: { estado: { in: ['ABIERTO', 'EN_PROCESO'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { hermano: { include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } } } },
    }),
    prisma.cuota.count({ where: { estado: 'PENDIENTE' } }),
    prisma.cuota.aggregate({
      where: { estado: 'PAGADA', createdAt: { gte: last30Days } },
      _sum: { monto: true },
    }),
  ])

  const result = {
    hermanos: {
      total: totalHermanos,
      activos: hermanosActivos,
      inactivos: hermanosInactivos,
      nuevos: hermanosNuevos,
      requierenSeguimiento: hermanosRequierenSeguimiento,
    },
    redes: {
      total: redesActivas,
    },
    eventos: {
      proximosSiete: proximosEventos,
      proximosTreinta: eventosProximosMes,
      proximos: upcomingEventos,
    },
    oracion: {
      peticionesPendientes,
    },
    anuncios: {
      activos: anunciosActivos,
      recientes: recentAnuncios,
    },
    seguimiento: {
      abiertos: seguimientosAbiertos,
    },
    finanzas: {
      cuotasPendientes,
      recaudadoUltimo30: totalRecaudadoUltimo30._sum.monto || 0,
    },
  }

  statsCache = { data: result, timestamp: Date.now() }
  return jsonResponse(result)
})
