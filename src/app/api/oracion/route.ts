import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getPaginationParams, buildPaginatedResponse, getSearchParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { createPeticionSchema, validateBody } from '@/lib/validations'
import { Prioridad, EstadoPeticion } from '@prisma/client'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.ORACION, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)

  const estado = getSearchParam(searchParams, 'estado')
  const prioridad = getSearchParam(searchParams, 'prioridad')
  const search = getSearchParam(searchParams, 'search')

  const whereConditions: { privada: boolean; estado?: EstadoPeticion; prioridad?: Prioridad; descripcion?: { contains: string } } = {
    privada: false,
  }

  if (estado) {
    whereConditions.estado = estado as EstadoPeticion
  }

  if (prioridad) {
    whereConditions.prioridad = prioridad as Prioridad
  }

  if (search) {
    whereConditions.descripcion = {
      contains: search,
    }
  }

  const [peticiones, total] = await Promise.all([
    prisma.peticionOracion.findMany({
      where: whereConditions,
      include: { hermano: { include: { user: true } } },
      orderBy: [{ prioridad: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.peticionOracion.count({
      where: whereConditions,
    }),
  ])

  return jsonResponse(buildPaginatedResponse(peticiones, total, page, limit))
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.ORACION, ACCIONES.CREAR)

  const body = await req.json()
  const validation = validateBody(createPeticionSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { hermanoId, descripcion, prioridad, responsable, privada } = validation.data

  const peticion = await prisma.peticionOracion.create({
    data: {
      hermanoId,
      descripcion,
      prioridad: prioridad || 'NORMAL',
      responsable,
      privada: privada || false,
      estado: 'ACTIVA',
    },
    include: { hermano: { include: { user: true } } },
  })

  return jsonResponse(peticion, 201)
})
