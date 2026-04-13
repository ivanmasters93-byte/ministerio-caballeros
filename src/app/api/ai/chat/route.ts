import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requireAuth, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { chatMessageSchema, validateBody } from '@/lib/validations'
import { getAssistantResponse } from '@/lib/ai/assistant'

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireAuth()

  const body = await req.json()
  const validation = validateBody(chatMessageSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { message } = validation.data

  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [events, announcements, redes, hermanos, seguimientos, peticiones] = await Promise.all([
    prisma.evento.findMany({
      where: { fecha: { gte: now, lte: in30Days } },
      include: { red: true },
      orderBy: { fecha: 'asc' },
      take: 10,
    }),
    prisma.anuncio.findMany({
      where: { activo: true },
      include: { red: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.red.findMany({
      include: { _count: { select: { miembros: true } } },
    }),
    prisma.hermano.findMany({
      where: { estado: 'ACTIVO' },
      include: { user: true },
      take: 20,
    }),
    prisma.seguimiento.findMany({
      where: { estado: { in: ['ABIERTO', 'EN_PROCESO'] } },
      include: { hermano: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.peticionOracion.findMany({
      where: { estado: { in: ['ACTIVA', 'EN_ORACION'] } },
      include: { hermano: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const response = await getAssistantResponse(message, {
    events,
    announcements,
    redes,
    hermanos,
    seguimientos,
    peticiones,
  })

  return jsonResponse({ response })
})
