import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withErrorHandling,
  requireAuth,
  jsonResponse,
  errorResponse,
  forbiddenResponse,
  NotFoundError,
} from '@/lib/api-helpers'

// ============================================================
// GET /api/liderazgo
// Returns the full leadership structure: lider general,
// secretario, asistente, and each red with its lideres.
// Requires authentication only (all roles can view leadership).
// ============================================================
export const GET = withErrorHandling(async (_req: NextRequest) => {
  await requireAuth()

  // Fetch single leader by role helper
  const findByRole = (role: string) =>
    prisma.user.findFirst({
      where: { role: role as never },
      select: { id: true, name: true, email: true, phone: true, role: true },
    })

  const [liderGeneral, secretario, asistente, redes] = await Promise.all([
    findByRole('LIDER_GENERAL'),
    findByRole('SECRETARIO'),
    findByRole('ASISTENTE'),
    prisma.red.findMany({
      orderBy: { tipo: 'asc' },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        edadMin: true,
        edadMax: true,
        lideres: {
          select: { id: true, name: true, email: true, phone: true, role: true },
        },
        _count: { select: { miembros: true } },
      },
    }),
  ])

  return jsonResponse({
    liderGeneral,
    secretario,
    asistente,
    redes,
  })
})

// ============================================================
// PUT /api/liderazgo
// Allows LIDER_GENERAL to assign/update leaders of a red.
// Body: { redId: string, liderId: string }
// Connects the user as a lider of the given red, replacing
// any previous leaders (max 2 per red enforced on client,
// but not enforced server-side to allow flexibility).
// Body: { redId: string, liderIds: string[] }
// ============================================================
export const PUT = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth()

  if (session.user.role !== 'LIDER_GENERAL') {
    return forbiddenResponse('Solo el Líder General puede asignar líderes de red')
  }

  let body: { redId?: string; liderIds?: string[] }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Cuerpo de solicitud inválido')
  }

  const { redId, liderIds } = body

  if (!redId || typeof redId !== 'string') {
    return errorResponse('redId es requerido')
  }
  if (!Array.isArray(liderIds)) {
    return errorResponse('liderIds debe ser un arreglo de IDs')
  }
  if (liderIds.length > 2) {
    return errorResponse('Una red puede tener máximo 2 líderes')
  }

  // Verify the red exists
  const red = await prisma.red.findUnique({ where: { id: redId } })
  if (!red) throw new NotFoundError('Red no encontrada')

  // Verify all liderIds exist and auto-promote to LIDER_RED
  if (liderIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: liderIds } },
      select: { id: true, role: true },
    })
    if (users.length !== liderIds.length) {
      return errorResponse('Uno o más usuarios no existen')
    }
    // Auto-promote: change role to LIDER_RED for anyone who isn't already
    const toPromote = users.filter(u => u.role !== 'LIDER_RED' && u.role !== 'LIDER_GENERAL')
    for (const u of toPromote) {
      await prisma.user.update({
        where: { id: u.id },
        data: { role: 'LIDER_RED' },
      })
    }
  }

  // Disconnect current leaders and connect new ones atomically
  const updatedRed = await prisma.red.update({
    where: { id: redId },
    data: {
      lideres: {
        set: liderIds.map(id => ({ id })),
      },
    },
    select: {
      id: true,
      nombre: true,
      tipo: true,
      edadMin: true,
      edadMax: true,
      lideres: {
        select: { id: true, name: true, email: true, phone: true, role: true },
      },
    },
  })

  return jsonResponse(updatedRed)
})
