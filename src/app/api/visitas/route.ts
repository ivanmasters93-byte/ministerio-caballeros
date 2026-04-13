import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.VISITAS, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const hermanoId = searchParams.get('hermanoId')

  const visitas = await prisma.visita.findMany({
    where: {
      ...(hermanoId && { hermanoId }),
    },
    include: {
      hermano: { include: { user: true } },
    },
    orderBy: { fecha: 'desc' },
    take: 100,
  })

  return jsonResponse(visitas)
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.VISITAS, ACCIONES.CREAR)

  const body = await req.json()
  const { hermanoId, fecha, tipo, notas, realizadaPor } = body

  if (!hermanoId || !fecha || !tipo) {
    return errorResponse('Hermano, fecha y tipo son requeridos', 400)
  }

  const visita = await prisma.visita.create({
    data: {
      hermanoId,
      fecha: new Date(fecha),
      tipo,
      notas: notas || null,
      realizadaPor: realizadaPor || 'Sistema',
    },
    include: { hermano: { include: { user: true } } },
  })

  return jsonResponse(visita, 201)
})
