import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })

  const rooms = await prisma.chatRoom.findMany({
    where: {
      miembros: { some: { userId: session.user.id } },
    },
    include: {
      miembros: {
        include: { user: { select: { id: true, name: true } } },
      },
      mensajes: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const formatted = rooms.map(room => {
    const membership = room.miembros.find(m => m.userId === session.user!.id)
    const lastMessage = room.mensajes[0] || null

    return {
      id: room.id,
      nombre: room.nombre,
      tipo: room.tipo,
      descripcion: room.descripcion,
      miembros: room.miembros.map(m => ({ user: m.user })),
      lastMessage: lastMessage
        ? { content: lastMessage.content, createdAt: lastMessage.createdAt, sender: lastMessage.sender }
        : null,
      unreadCount: membership?.unreadCount || 0,
    }
  })

  return NextResponse.json(formatted)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const body = await req.json()
  const { tipo, targetUserId, nombre } = body

  if (tipo === 'PRIVADO' && targetUserId) {
    // Check if private chat already exists
    const existing = await prisma.chatRoom.findFirst({
      where: {
        tipo: 'PRIVADO',
        AND: [
          { miembros: { some: { userId: session.user.id } } },
          { miembros: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        miembros: { include: { user: { select: { id: true, name: true } } } },
      },
    })

    if (existing) return NextResponse.json(existing)

    const room = await prisma.chatRoom.create({
      data: {
        tipo: 'PRIVADO',
        miembros: {
          create: [{ userId: session.user.id }, { userId: targetUserId }],
        },
      },
      include: {
        miembros: { include: { user: { select: { id: true, name: true } } } },
      },
    })

    return NextResponse.json(room)
  }

  if (tipo === 'GRUPO') {
    const room = await prisma.chatRoom.create({
      data: {
        nombre: nombre || 'Nuevo Grupo',
        tipo: 'GRUPO',
        miembros: { create: { userId: session.user.id } },
      },
      include: {
        miembros: { include: { user: { select: { id: true, name: true } } } },
      },
    })

    return NextResponse.json(room)
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
