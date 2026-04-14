import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const notificaciones = await prisma.notificacion.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { userId: null },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const unread = notificaciones.filter(n => !n.leida).length
  return NextResponse.json({ notificaciones, unread })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const notificacion = await prisma.notificacion.create({
    data: {
      tipo: body.tipo || 'info',
      severidad: body.severidad || 'info',
      titulo: body.titulo,
      mensaje: body.mensaje,
      userId: body.userId || null,
      relatedId: body.relatedId || null,
      metadatos: body.metadatos ? JSON.stringify(body.metadatos) : null,
    },
  })
  return NextResponse.json(notificacion)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()

  if (body.marcarTodas) {
    await prisma.notificacion.updateMany({
      where: {
        OR: [{ userId: session.user.id }, { userId: null }],
        leida: false,
      },
      data: { leida: true },
    })
    return NextResponse.json({ ok: true })
  }

  if (body.id) {
    await prisma.notificacion.update({
      where: { id: body.id },
      data: { leida: true },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Parametros invalidos' }, { status: 400 })
}
