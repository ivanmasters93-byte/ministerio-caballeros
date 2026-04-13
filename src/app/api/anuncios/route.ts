import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getPaginationParams, buildPaginatedResponse, getSearchParam, getBooleanParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { createAnuncioSchema, validateBody } from '@/lib/validations'
import { Prisma, TipoAnuncio } from '@prisma/client'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.ANUNCIOS, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)

  const search = getSearchParam(searchParams, 'search')
  const redId = getSearchParam(searchParams, 'redId')
  const tipo = getSearchParam(searchParams, 'tipo')
  const activo = getBooleanParam(searchParams, 'activo')

  const whereConditions: Prisma.AnuncioWhereInput = {}

  if (search) {
    whereConditions.titulo = {
      contains: search,
    }
  }

  if (tipo) {
    whereConditions.tipo = tipo as TipoAnuncio
  }

  if (activo !== undefined) {
    whereConditions.activo = activo
  } else {
    // By default, only show active announcements
    whereConditions.activo = true
  }

  // Handle redId or all reds
  if (redId) {
    whereConditions.OR = [{ redId }, { paraTodasRedes: true }]
  }

  // Filter out expired announcements — must not overwrite the redId OR clause
  // Use AND to compose: (redId filter) AND (not expired)
  if (whereConditions.OR) {
    // redId filter is active — wrap both constraints with AND
    const existingOR = whereConditions.OR
    delete whereConditions.OR
    whereConditions.AND = [
      { OR: existingOR },
      { OR: [{ expiraEn: { gte: new Date() } }, { expiraEn: null }] },
    ]
  } else {
    whereConditions.OR = [{ expiraEn: { gte: new Date() } }, { expiraEn: null }]
  }

  const [anuncios, total] = await Promise.all([
    prisma.anuncio.findMany({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      include: { red: true, evento: true },
      orderBy: [{ prioridad: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.anuncio.count({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    }),
  ])

  return jsonResponse(buildPaginatedResponse(anuncios, total, page, limit))
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requirePermiso(RECURSOS.ANUNCIOS, ACCIONES.CREAR)

  const body = await req.json()
  const validation = validateBody(createAnuncioSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { titulo, contenido, tipo, prioridad, paraTodasRedes, redId, eventoId, expiraEn } = validation.data

  const anuncio = await prisma.anuncio.create({
    data: {
      titulo,
      contenido,
      tipo,
      prioridad: prioridad || 'NORMAL',
      paraTodasRedes: paraTodasRedes || false,
      redId,
      eventoId,
      expiraEn: expiraEn ? new Date(expiraEn) : null,
      activo: true,
    },
    include: { red: true, evento: true },
  })

  return jsonResponse(anuncio, 201)
})
