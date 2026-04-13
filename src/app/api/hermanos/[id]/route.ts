import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'

export const GET = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.HERMANOS, ACCIONES.LEER)

  const hermano = await prisma.hermano.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          redes: { include: { red: true } },
          permisos: true,
        },
      },
      peticionesOracion: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      visitas: {
        orderBy: { fecha: 'desc' },
        take: 10,
      },
      seguimientos: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      asistencias: {
        orderBy: { asistencia: { fecha: 'desc' } },
        take: 10,
        include: { asistencia: true },
      },
      cuotas: {
        orderBy: { fecha: 'desc' },
        take: 12,
      },
    },
  })

  if (!hermano) return errorResponse('Hermano no encontrado', 404)

  return jsonResponse(hermano)
})

export const PUT = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.HERMANOS, ACCIONES.EDITAR)

  const body = await req.json()
  const { estado, notas, fechaNacimiento, direccion, ocupacion, estadoCivil } = body

  const hermano = await prisma.hermano.update({
    where: { id },
    data: {
      estado: estado || undefined,
      notas: notas !== undefined ? notas : undefined,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
      direccion: direccion !== undefined ? direccion : undefined,
      ocupacion: ocupacion !== undefined ? ocupacion : undefined,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  return jsonResponse(hermano)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  const { id } = await context.params
  await requirePermiso(RECURSOS.HERMANOS, ACCIONES.ELIMINAR)

  const hermano = await prisma.hermano.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } },
  })

  if (!hermano) return errorResponse('Hermano no encontrado', 404)

  // Eliminar usuario y sus relaciones en cascada
  await prisma.user.delete({
    where: { id: hermano.userId },
  })

  return jsonResponse({ message: 'Hermano eliminado' }, 200)
})
