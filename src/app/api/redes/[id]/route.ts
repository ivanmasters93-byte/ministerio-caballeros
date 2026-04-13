import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'

export const GET = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.REDES, ACCIONES.LEER)

  const red = await prisma.red.findUnique({
    where: { id },
    include: {
      lideres: { select: { id: true, name: true, email: true } },
      miembros: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
      eventos: {
        orderBy: { fecha: 'desc' },
        take: 10,
      },
      anuncios: {
        where: { activo: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      asistencias: {
        orderBy: { fecha: 'desc' },
        take: 5,
      },
      _count: {
        select: {
          miembros: true,
          eventos: true,
          anuncios: true,
        },
      },
    },
  })

  if (!red) return errorResponse('Red no encontrada', 404)

  return jsonResponse(red)
})

export const PUT = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.REDES, ACCIONES.EDITAR)

  const body = await req.json()
  const { nombre, edadMin, edadMax } = body

  if (!nombre) return errorResponse('El nombre es requerido')

  const red = await prisma.red.update({
    where: { id },
    data: {
      nombre,
      edadMin: edadMin ? parseInt(edadMin) : undefined,
      edadMax: edadMax ? parseInt(edadMax) : undefined,
    },
    include: {
      lideres: { select: { id: true, name: true } },
      _count: { select: { miembros: true } },
    },
  })

  return jsonResponse(red)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.REDES, ACCIONES.ELIMINAR)

  // Verificar que no tiene miembros antes de eliminar
  const red = await prisma.red.findUnique({
    where: { id },
    include: { _count: { select: { miembros: true } } },
  })

  if (!red) return errorResponse('Red no encontrada', 404)
  if (red._count.miembros > 0) {
    return errorResponse('No se puede eliminar una red que tiene miembros', 400)
  }

  await prisma.red.delete({ where: { id } })

  return jsonResponse({ message: 'Red eliminada' }, 200)
})
