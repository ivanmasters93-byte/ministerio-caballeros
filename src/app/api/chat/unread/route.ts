import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ total: 0 })

  const memberships = await prisma.chatRoomMember.findMany({
    where: { userId: session.user.id },
    select: { unreadCount: true },
  })

  const total = memberships.reduce((sum, m) => sum + m.unreadCount, 0)
  return NextResponse.json({ total })
}
