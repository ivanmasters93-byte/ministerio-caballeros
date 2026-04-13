import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getPaginationParams, buildPaginatedResponse, getSearchParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { Role } from '@prisma/client'
import { z } from 'zod'

// Schema for updating user role
const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'Usuario requerido'),
  role: z.enum(['LIDER_GENERAL', 'LIDER_RED', 'SECRETARIO', 'ASISTENTE', 'HERMANO']),
})

function validateUpdateRole(data: unknown): { success: true; data: { userId: string; role: string } } | { success: false; error: string } {
  const result = updateUserRoleSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    return { success: false, error: errors }
  }
  return { success: true, data: result.data }
}

export const GET = withErrorHandling(async (req: NextRequest) => {
  // Only LIDER_GENERAL can view roles
  await requirePermiso(RECURSOS.ROLES, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)
  const search = getSearchParam(searchParams, 'search')
  const role = getSearchParam(searchParams, 'role')

  const whereConditions: { OR?: Array<{ name?: { contains: string }; email?: { contains: string } }>; role?: Role } = {}

  if (search) {
    whereConditions.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ]
  }

  if (role) {
    whereConditions.role = role as Role
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        redes: { select: { redId: true } },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.user.count({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    }),
  ])

  return jsonResponse(buildPaginatedResponse(users, total, page, limit))
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  // Only LIDER_GENERAL can update roles
  await requirePermiso(RECURSOS.ROLES, ACCIONES.GESTIONAR)

  const body = await req.json()
  const validation = validateUpdateRole(body)
  if (!validation.success) return errorResponse(validation.error)

  const { userId, role } = validation.data

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return errorResponse('Usuario no encontrado', 404)

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: role as Role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      redes: { select: { redId: true } },
    },
  })

  return jsonResponse(updated)
})
