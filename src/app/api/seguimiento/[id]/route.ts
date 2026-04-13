import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'

export const GET = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.SEGUIMIENTO, ACCIONES.LEER)

  const seguimiento = await prisma.seguimiento.findUnique({
    where: { id },
    include: {
      hermano: { include: { user: true } },
    },
  })

  if (!seguimiento) return errorResponse('Seguimiento no encontrado', 404)
  return jsonResponse(seguimiento)
})

export const PUT = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.SEGUIMIENTO, ACCIONES.EDITAR)

  const body = await req.json()
  const { tipo, descripcion, responsableId, estado, proximoContacto, privado } = body

  const seguimiento = await prisma.seguimiento.update({
    where: { id },
    data: {
      tipo: tipo || undefined,
      descripcion: descripcion || undefined,
      responsableId: responsableId || undefined,
      estado: estado || undefined,
      proximoContacto: proximoContacto ? new Date(proximoContacto) : undefined,
      privado: privado !== undefined ? privado : undefined,
    },
    include: { hermano: { include: { user: true } } },
  })

  return jsonResponse(seguimiento)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.SEGUIMIENTO, ACCIONES.ELIMINAR)

  const seguimiento = await prisma.seguimiento.findUnique({ where: { id } })
  if (!seguimiento) return errorResponse('Seguimiento no encontrado', 404)

  await prisma.seguimiento.delete({ where: { id } })
  return jsonResponse({ message: 'Seguimiento eliminado' }, 200)
})
