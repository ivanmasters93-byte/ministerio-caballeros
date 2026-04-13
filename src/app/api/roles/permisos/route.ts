import { NextRequest } from 'next/server'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getSearchParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES, obtenerPermisosUsuario, establecerPermiso } from '@/lib/permissions'
import { z } from 'zod'
import prisma from '@/lib/prisma'

// Schema for setting custom permissions
const setPermissionSchema = z.object({
  userId: z.string().min(1, 'Usuario requerido'),
  recurso: z.string().min(1, 'Recurso requerido'),
  accion: z.string().min(1, 'Acción requerida'),
  permitido: z.boolean(),
})

function validateSetPermission(data: unknown): { success: true; data: { userId: string; recurso: string; accion: string; permitido: boolean } } | { success: false; error: string } {
  const result = setPermissionSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    return { success: false, error: errors }
  }
  return { success: true, data: result.data }
}

export const GET = withErrorHandling(async (req: NextRequest) => {
  // Only LIDER_GENERAL can view custom permissions
  await requirePermiso(RECURSOS.ROLES, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const userId = getSearchParam(searchParams, 'userId')

  if (!userId) return errorResponse('userId es requerido')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return errorResponse('Usuario no encontrado', 404)

  const permisos = await obtenerPermisosUsuario(userId, user.role)

  return jsonResponse({
    userId,
    userName: user.name,
    role: user.role,
    permisos,
  })
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  // Only LIDER_GENERAL can set custom permissions
  await requirePermiso(RECURSOS.ROLES, ACCIONES.GESTIONAR)

  const body = await req.json()
  const validation = validateSetPermission(body)
  if (!validation.success) return errorResponse(validation.error)

  const { userId, recurso, accion, permitido } = validation.data

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return errorResponse('Usuario no encontrado', 404)

  const permiso = await establecerPermiso(userId, recurso, accion, permitido)

  return jsonResponse({
    success: true,
    permiso,
    message: `Permiso actualizado para ${user.name}`,
  })
})

export const PUT = withErrorHandling(async (req: NextRequest) => {
  // Only LIDER_GENERAL can update permissions
  await requirePermiso(RECURSOS.ROLES, ACCIONES.GESTIONAR)

  const body = await req.json()
  const validation = validateSetPermission(body)
  if (!validation.success) return errorResponse(validation.error)

  const { userId, recurso, accion, permitido } = validation.data

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return errorResponse('Usuario no encontrado', 404)

  const permiso = await establecerPermiso(userId, recurso, accion, permitido)

  const updatedPermisos = await obtenerPermisosUsuario(userId, user.role)

  return jsonResponse({
    success: true,
    permiso,
    permisos: updatedPermisos,
    message: `Permiso actualizado para ${user.name}`,
  })
})
