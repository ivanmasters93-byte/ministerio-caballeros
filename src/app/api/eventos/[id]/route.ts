import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'

export const GET = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.EVENTOS, ACCIONES.LEER)

  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      red: true,
      anuncios: true,
      asistencias: {
        include: { detalles: true },
      },
    },
  })

  if (!evento) return errorResponse('Evento no encontrado', 404)
  return jsonResponse(evento)
})

export const PUT = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.EVENTOS, ACCIONES.EDITAR)

  const body = await req.json()
  const { titulo, descripcion, fecha, hora, tipo, zoomLink, youtubeLink, jitsiEnabled, jitsiRoomId, grabacionUrl, redId } = body

  // Auto-generate room ID when enabling jitsi without providing one
  let resolvedRoomId = jitsiRoomId !== undefined ? (jitsiRoomId || null) : undefined
  if (jitsiEnabled && !jitsiRoomId) {
    const { generateRoomId } = await import('@/lib/jitsi/config')
    resolvedRoomId = generateRoomId(id, titulo || 'reunion')
  }

  const updateData: Record<string, unknown> = {
    titulo,
    descripcion,
    fecha: fecha ? new Date(fecha) : undefined,
    hora,
    tipo,
    zoomLink: zoomLink || null,
    youtubeLink: youtubeLink || null,
    redId: redId || null,
  }

  if (typeof jitsiEnabled !== 'undefined') updateData.jitsiEnabled = Boolean(jitsiEnabled)
  if (resolvedRoomId !== undefined) updateData.jitsiRoomId = resolvedRoomId
  if (typeof grabacionUrl !== 'undefined') updateData.grabacionUrl = grabacionUrl || null

  const evento = await prisma.evento.update({
    where: { id },
    data: updateData,
    include: { red: true },
  })

  return jsonResponse(evento)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.EVENTOS, ACCIONES.ELIMINAR)

  const evento = await prisma.evento.findUnique({ where: { id } })
  if (!evento) return errorResponse('Evento no encontrado', 404)

  await prisma.evento.delete({ where: { id } })
  return jsonResponse({ message: 'Evento eliminado' }, 200)
})
