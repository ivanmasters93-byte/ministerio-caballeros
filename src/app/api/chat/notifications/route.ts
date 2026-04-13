import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ messages: [] })

  const url = new URL(req.url)
  const since = url.searchParams.get('since')
  if (!since) return NextResponse.json({ messages: [] })

  const memberships = await prisma.chatRoomMember.findMany({
    where: { userId: session.user.id },
    select: { roomId: true },
  })

  const roomIds = memberships.map(m => m.roomId)
  if (roomIds.length === 0) return NextResponse.json({ messages: [] })

  const messages = await prisma.chatMessage.findMany({
    where: {
      roomId: { in: roomIds },
      senderId: { not: session.user.id },
      createdAt: { gt: new Date(since) },
    },
    include: {
      sender: { select: { name: true } },
      room: {
        select: {
          nombre: true,
          tipo: true,
          miembros: { include: { user: { select: { id: true, name: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 10,
  })

  const formatted = messages.map(m => ({
    id: m.id,
    content: m.content,
    senderName: m.sender.name,
    roomId: m.roomId,
    roomName: m.room.tipo === 'GRUPO' ? (m.room.nombre || 'Chat Grupal') : m.sender.name,
    createdAt: m.createdAt,
  }))

  return NextResponse.json({ messages: formatted })
}
