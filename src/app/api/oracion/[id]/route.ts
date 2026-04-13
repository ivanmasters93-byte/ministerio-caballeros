import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'

export const GET = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.ORACION, ACCIONES.LEER)

  const peticion = await prisma.peticionOracion.findUnique({
    where: { id },
    include: { hermano: { include: { user: true } } },
  })

  if (!peticion) return errorResponse('Petición no encontrada', 404)
  return jsonResponse(peticion)
})

export const PUT = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.ORACION, ACCIONES.EDITAR)

  const body = await req.json()
  const { descripcion, prioridad, estado, responsable, privada } = body

  const peticion = await prisma.peticionOracion.update({
    where: { id },
    data: {
      descripcion: descripcion || undefined,
      prioridad: prioridad || undefined,
      estado: estado || undefined,
      responsable: responsable || undefined,
      privada: privada !== undefined ? privada : undefined,
    },
    include: { hermano: { include: { user: true } } },
  })

  return jsonResponse(peticion)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.ORACION, ACCIONES.ELIMINAR)

  const peticion = await prisma.peticionOracion.findUnique({ where: { id } })
  if (!peticion) return errorResponse('Petición no encontrada', 404)

  await prisma.peticionOracion.delete({ where: { id } })
  return jsonResponse({ message: 'Petición eliminada' }, 200)
})
