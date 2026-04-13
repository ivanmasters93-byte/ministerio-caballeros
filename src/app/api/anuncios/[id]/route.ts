import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'

export const GET = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.ANUNCIOS, ACCIONES.LEER)

  const anuncio = await prisma.anuncio.findUnique({
    where: { id },
    include: { red: true, evento: true },
  })

  if (!anuncio) return errorResponse('Anuncio no encontrado', 404)
  return jsonResponse(anuncio)
})

export const PUT = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.ANUNCIOS, ACCIONES.EDITAR)

  const body = await req.json()
  const { titulo, contenido, tipo, prioridad, activo, expiraEn, redId, eventoId } = body

  const anuncio = await prisma.anuncio.update({
    where: { id },
    data: {
      titulo,
      contenido,
      tipo,
      prioridad,
      activo,
      expiraEn: expiraEn ? new Date(expiraEn) : null,
      redId: redId || null,
      eventoId: eventoId || null,
    },
    include: { red: true },
  })

  return jsonResponse(anuncio)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.ANUNCIOS, ACCIONES.ELIMINAR)

  const anuncio = await prisma.anuncio.findUnique({ where: { id } })
  if (!anuncio) return errorResponse('Anuncio no encontrado', 404)

  await prisma.anuncio.delete({ where: { id } })
  return jsonResponse({ message: 'Anuncio eliminado' }, 200)
})
