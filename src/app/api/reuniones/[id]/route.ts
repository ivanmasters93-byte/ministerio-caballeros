import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'

export const GET = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.EVENTOS, ACCIONES.LEER)

  const reunion = await prisma.evento.findUnique({
    where: { id },
    include: { red: true },
  })

  if (!reunion) return errorResponse('Reunion no encontrada', 404)
  if (!reunion.jitsiEnabled) return errorResponse('Esta reunion no tiene video habilitado', 400)

  return jsonResponse(reunion)
})

export const PATCH = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.EVENTOS, ACCIONES.EDITAR)

  const body = await req.json()
  const { grabacionUrl, jitsiEnabled, jitsiRoomId } = body

  const data: Record<string, unknown> = {}
  if (typeof grabacionUrl !== 'undefined') data.grabacionUrl = grabacionUrl || null
  if (typeof jitsiEnabled !== 'undefined') data.jitsiEnabled = Boolean(jitsiEnabled)
  if (typeof jitsiRoomId !== 'undefined') data.jitsiRoomId = jitsiRoomId || null

  if (Object.keys(data).length === 0) {
    return errorResponse('No se proporcionaron campos para actualizar')
  }

  const reunion = await prisma.evento.update({
    where: { id },
    data,
    include: { red: true },
  })

  return jsonResponse(reunion)
})
