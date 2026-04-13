import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { createRedSchema, validateBody } from '@/lib/validations'

export const GET = withErrorHandling(async (_req: NextRequest) => {
  await requirePermiso(RECURSOS.REDES, ACCIONES.LEER)

  const redes = await prisma.red.findMany({
    include: {
      lideres: true,
      _count: { select: { miembros: true, eventos: true } },
      eventos: {
        where: { fecha: { gte: new Date() } },
        orderBy: { fecha: 'asc' },
        take: 3,
      },
      anuncios: {
        where: { activo: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
    orderBy: { nombre: 'asc' },
  })

  return jsonResponse(redes)
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.REDES, ACCIONES.CREAR)

  const body = await req.json()
  const validation = validateBody(createRedSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { nombre, tipo, edadMin, edadMax } = validation.data

  const red = await prisma.red.create({
    data: {
      nombre,
      tipo,
      edadMin,
      edadMax,
    },
    include: {
      lideres: true,
      miembros: true,
    },
  })

  return jsonResponse(red, 201)
})
