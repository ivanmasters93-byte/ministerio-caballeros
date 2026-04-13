import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getPaginationParams, buildPaginatedResponse, getSearchParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { createSeguimientoSchema, validateBody } from '@/lib/validations'
import { TipoSeguimiento, EstadoCaso } from '@prisma/client'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.SEGUIMIENTO, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)

  const estado = getSearchParam(searchParams, 'estado')
  const hermanoId = getSearchParam(searchParams, 'hermanoId')
  const tipo = getSearchParam(searchParams, 'tipo')

  const whereConditions: { privado: boolean; estado?: EstadoCaso; hermanoId?: string; tipo?: TipoSeguimiento } = {
    privado: false,
  }

  if (estado) {
    whereConditions.estado = estado as EstadoCaso
  }

  if (hermanoId) {
    whereConditions.hermanoId = hermanoId
  }

  if (tipo) {
    whereConditions.tipo = tipo as TipoSeguimiento
  }

  const [seguimientos, total] = await Promise.all([
    prisma.seguimiento.findMany({
      where: whereConditions,
      include: { hermano: { include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.seguimiento.count({
      where: whereConditions,
    }),
  ])

  return jsonResponse(buildPaginatedResponse(seguimientos, total, page, limit))
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requirePermiso(RECURSOS.SEGUIMIENTO, ACCIONES.CREAR)

  const body = await req.json()
  const validation = validateBody(createSeguimientoSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { hermanoId, tipo, descripcion, responsableId, estado, proximoContacto, privado } = validation.data

  // Use the provided responsableId or fall back to the current user
  const finalResponsableId = responsableId || session.user.id

  const seguimiento = await prisma.seguimiento.create({
    data: {
      hermanoId,
      tipo,
      descripcion,
      responsableId: finalResponsableId,
      estado: estado || 'ABIERTO',
      proximoContacto: proximoContacto ? new Date(proximoContacto) : null,
      privado: privado || false,
    },
    include: { hermano: { include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } } } },
  })

  // Update hermano state if needed
  if (estado === 'EN_PROCESO') {
    await prisma.hermano.update({
      where: { id: hermanoId },
      data: { estado: 'REQUIERE_SEGUIMIENTO' },
    })
  }

  return jsonResponse(seguimiento, 201)
})
