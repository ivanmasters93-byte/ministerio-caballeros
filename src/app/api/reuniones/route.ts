import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { generateRoomId } from '@/lib/jitsi/config'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.EVENTOS, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') // 'proximas' | 'anteriores' | null (todas)

  const ahora = new Date()

  const whereBase = { jitsiEnabled: true }

  let whereCondition = {}
  if (tipo === 'proximas') {
    whereCondition = { ...whereBase, fecha: { gte: ahora } }
  } else if (tipo === 'anteriores') {
    whereCondition = { ...whereBase, fecha: { lt: ahora } }
  } else {
    whereCondition = whereBase
  }

  const reuniones = await prisma.evento.findMany({
    where: whereCondition,
    include: { red: true },
    orderBy: { fecha: tipo === 'anteriores' ? 'desc' : 'asc' },
    take: 50,
  })

  return jsonResponse(reuniones)
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.EVENTOS, ACCIONES.CREAR)

  const body = await req.json()
  const { titulo, descripcion, hora, redId } = body

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    return errorResponse('El titulo debe tener al menos 3 caracteres')
  }

  // Create an instant meeting with today's date
  const tempId = Math.random().toString(36).slice(2, 10)
  const roomId = generateRoomId(tempId, titulo.trim())

  const reunion = await prisma.evento.create({
    data: {
      titulo: titulo.trim(),
      descripcion: descripcion || null,
      fecha: new Date(),
      hora: hora || null,
      tipo: 'REUNION',
      jitsiEnabled: true,
      jitsiRoomId: roomId,
      redId: redId || null,
    },
    include: { red: true },
  })

  // Update the room ID now that we have the real cuid
  const updated = await prisma.evento.update({
    where: { id: reunion.id },
    data: { jitsiRoomId: generateRoomId(reunion.id, titulo.trim()) },
    include: { red: true },
  })

  return jsonResponse(updated, 201)
})
