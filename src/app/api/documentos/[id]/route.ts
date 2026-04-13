import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'

export const GET = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  const documento = await prisma.documento.findUnique({
    where: { id },
  })

  if (!documento) return errorResponse('Documento no encontrado', 404)
  return jsonResponse(documento)
})

export const PUT = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.EDITAR)

  const body = await req.json()
  const { titulo, descripcion, tipo, url, redId, categoria, activo } = body

  const documento = await prisma.documento.update({
    where: { id },
    data: {
      titulo: titulo || undefined,
      descripcion: descripcion || undefined,
      tipo: tipo || undefined,
      url: url || undefined,
      redId: redId || undefined,
      categoria: categoria || undefined,
      activo: activo !== undefined ? activo : undefined,
    },
  })

  return jsonResponse(documento)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.ELIMINAR)

  const documento = await prisma.documento.findUnique({ where: { id } })
  if (!documento) return errorResponse('Documento no encontrado', 404)

  await prisma.documento.delete({ where: { id } })
  return jsonResponse({ message: 'Documento eliminado' }, 200)
})
