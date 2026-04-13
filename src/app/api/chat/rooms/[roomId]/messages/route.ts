import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  _req: Request,
  context: { params: Promise<{ roomId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })

  const { roomId } = await context.params

  // Verify membership
  const membership = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId: session.user.id } },
  })
  if (!membership) return NextResponse.json([], { status: 403 })

  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: { sender: { select: { id: true, name: true } } },
  })

  return NextResponse.json(messages)
}

export async function POST(
  req: Request,
  context: { params: Promise<{ roomId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const { roomId } = await context.params
  const body = await req.json()
  const { content } = body

  if (!content?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  // Verify membership
  const membership = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId: session.user.id } },
  })
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const message = await prisma.chatMessage.create({
    data: {
      roomId,
      senderId: session.user.id,
      content: content.trim(),
    },
    include: { sender: { select: { id: true, name: true } } },
  })

  // Update room timestamp
  await prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() },
  })

  // Increment unread for other members
  await prisma.chatRoomMember.updateMany({
    where: { roomId, userId: { not: session.user.id } },
    data: { unreadCount: { increment: 1 } },
  })

  return NextResponse.json(message)
}
