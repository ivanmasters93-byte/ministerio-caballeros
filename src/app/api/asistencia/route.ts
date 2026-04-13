import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getPaginationParams, buildPaginatedResponse, getSearchParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { createAsistenciaSchema, validateBody } from '@/lib/validations'
import { Prisma } from '@prisma/client'

const DIAS_INACTIVIDAD = 30 // Marcar como inactivo después de 30 días sin asistencia

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.ASISTENCIA, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)

  const eventoId = getSearchParam(searchParams, 'eventoId')
  const redId = getSearchParam(searchParams, 'redId')

  const whereConditions: Prisma.AsistenciaWhereInput = {}

  if (eventoId) {
    whereConditions.eventoId = eventoId
  }

  if (redId) {
    whereConditions.redId = redId
  }

  const [asistencias, total] = await Promise.all([
    prisma.asistencia.findMany({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      include: {
        evento: true,
        red: true,
        detalles: { include: { hermano: { include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } } } } },
      },
      orderBy: { fecha: 'desc' },
      skip,
      take: limit,
    }),
    prisma.asistencia.count({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    }),
  ])

  return jsonResponse(buildPaginatedResponse(asistencias, total, page, limit))
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requirePermiso(RECURSOS.ASISTENCIA, ACCIONES.CREAR)

  const body = await req.json()
  const validation = validateBody(createAsistenciaSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { eventoId, redId, fecha, detalles } = validation.data

  const asistencia = await prisma.asistencia.create({
    data: {
      eventoId,
      redId: redId ?? undefined,
      fecha: new Date(fecha),
      total: detalles.length,
      presentes: detalles.filter((d) => d.presente).length,
      detalles: {
        create: detalles.map((d) => ({
          hermanoId: d.hermanoId,
          presente: d.presente,
          nota: d.nota,
        })),
      },
    },
    include: {
      detalles: { include: { hermano: { include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } } } } },
      evento: true,
      red: true,
    },
  })

  // Batch update hermanos who were present
  const presenteHermanoIds = detalles.filter((d) => d.presente).map((d) => d.hermanoId)
  if (presenteHermanoIds.length > 0) {
    await prisma.hermano.updateMany({
      where: { id: { in: presenteHermanoIds } },
      data: { ultimaAsistencia: new Date(fecha) },
    })
  }

  // Check for inactivity and update state
  const dosemisMeses = new Date()
  dosemisMeses.setDate(dosemisMeses.getDate() - DIAS_INACTIVIDAD)

  const hermanosDesdeMes = await prisma.asistenciaDetalle.findMany({
    where: {
      asistencia: { fecha: { gte: dosemisMeses } },
      presente: true,
    },
    select: { hermanoId: true },
    distinct: ['hermanoId'],
  })

  const hermanoActivosIds = new Set(hermanosDesdeMes.map((d) => d.hermanoId))

  // Marcar como inactivos aquellos no registrados en el período (solo si hay redId)
  if (redId) {
    const hermanosFueraRed = await prisma.hermano.findMany({
      where: {
        user: { redes: { some: { redId } } },
        id: { notIn: Array.from(hermanoActivosIds) },
      },
    })

    const hermanosFueraRedIds = hermanosFueraRed
      .filter((h) => h.estado !== 'INACTIVO')
      .map((h) => h.id)
    if (hermanosFueraRedIds.length > 0) {
      await prisma.hermano.updateMany({
        where: { id: { in: hermanosFueraRedIds } },
        data: { estado: 'REQUIERE_SEGUIMIENTO' },
      })
    }
  }

  return jsonResponse(asistencia, 201)
})
