import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withErrorHandling,
  requirePermiso,
  jsonResponse,
  errorResponse,
  getPaginationParams,
  buildPaginatedResponse,
  getSearchParam,
} from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { EstadoPredica, Prisma } from '@prisma/client'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)

  const redId = getSearchParam(searchParams, 'redId')
  const estado = getSearchParam(searchParams, 'estado')
  const search = getSearchParam(searchParams, 'search')

  const where: Prisma.PredicaWhereInput = {}

  if (redId) where.redId = redId
  if (estado) where.estado = estado as EstadoPredica
  if (search) {
    where.OR = [
      { titulo: { contains: search } },
      { predicador: { contains: search } },
    ]
  }

  const [predicas, total] = await Promise.all([
    prisma.predica.findMany({
      where,
      include: {
        creador: { select: { id: true, name: true } },
        red: { select: { id: true, nombre: true } },
        evento: { select: { id: true, titulo: true } },
      },
      orderBy: { fecha: 'desc' },
      skip,
      take: limit,
    }),
    prisma.predica.count({ where }),
  ])

  return jsonResponse(buildPaginatedResponse(predicas, total, page, limit))
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.CREAR)

  const body = await req.json()
  const { titulo, predicador, fecha, duracion, audioUrl, transcripcion, eventoId, redId } = body

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 2) {
    return errorResponse('El título es requerido (mínimo 2 caracteres)')
  }
  if (!predicador || typeof predicador !== 'string' || predicador.trim().length < 2) {
    return errorResponse('El nombre del predicador es requerido')
  }

  const estado: EstadoPredica = transcripcion ? 'TRANSCRITA' : audioUrl ? 'PENDIENTE' : 'PENDIENTE'

  const predica = await prisma.predica.create({
    data: {
      titulo: titulo.trim(),
      predicador: predicador.trim(),
      fecha: fecha ? new Date(fecha) : new Date(),
      duracion: duracion ? Number(duracion) : null,
      audioUrl: audioUrl || null,
      transcripcion: transcripcion || null,
      estado,
      eventoId: eventoId || null,
      redId: redId || null,
      creadoPor: session.user.id,
    },
    include: {
      creador: { select: { id: true, name: true } },
      red: { select: { id: true, nombre: true } },
      evento: { select: { id: true, titulo: true } },
    },
  })

  return jsonResponse(predica, 201)
})
