import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getPaginationParams, buildPaginatedResponse, getSearchParam, getBooleanParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { createEventoSchema, validateBody } from '@/lib/validations'
import { Prisma, TipoEvento } from '@prisma/client'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.EVENTOS, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)

  const search = getSearchParam(searchParams, 'search')
  const redId = getSearchParam(searchParams, 'redId')
  const tipo = getSearchParam(searchParams, 'tipo')
  const upcoming = getBooleanParam(searchParams, 'upcoming')

  const whereConditions: Prisma.EventoWhereInput = {}

  if (search) {
    whereConditions.titulo = {
      contains: search,
    }
  }

  if (redId) {
    whereConditions.redId = redId
  }

  if (tipo) {
    whereConditions.tipo = tipo as TipoEvento
  }

  if (upcoming) {
    whereConditions.fecha = { gte: new Date() }
  }

  const [eventos, total] = await Promise.all([
    prisma.evento.findMany({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      include: {
        red: true,
        anuncios: true,
        asistencias: true,
      },
      orderBy: { fecha: upcoming ? 'asc' : 'desc' },
      skip,
      take: limit,
    }),
    prisma.evento.count({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    }),
  ])

  return jsonResponse(buildPaginatedResponse(eventos, total, page, limit))
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requirePermiso(RECURSOS.EVENTOS, ACCIONES.CREAR)

  const body = await req.json()
  const validation = validateBody(createEventoSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { titulo, descripcion, fecha, hora, tipo, zoomLink, youtubeLink, redId, esRecurrente, patron } = validation.data

  const evento = await prisma.evento.create({
    data: {
      titulo,
      descripcion,
      fecha: new Date(fecha),
      hora,
      tipo,
      zoomLink: zoomLink || null,
      youtubeLink: youtubeLink || null,
      redId,
      esRecurrente,
      patron,
    },
    include: {
      red: true,
      anuncios: true,
    },
  })

  return jsonResponse(evento, 201)
})
