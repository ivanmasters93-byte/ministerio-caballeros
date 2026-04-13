import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const secret = (process.env.NEXTAUTH_SECRET || '').trim().replace(/\\n$/, '')
  if (!key || !secret || key !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [totalUsers, hermanos, redes, recentHermanos] = await Promise.all([
    prisma.user.count(),
    prisma.hermano.count(),
    prisma.red.findMany({
      select: { nombre: true, tipo: true, _count: { select: { miembros: true } } }
    }),
    prisma.hermano.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true, phone: true, createdAt: true } } }
    })
  ])

  return NextResponse.json({
    totalUsers,
    totalHermanos: hermanos,
    redes: redes.map(r => ({ nombre: r.nombre, tipo: r.tipo, miembros: r._count.miembros })),
    ultimosRegistros: recentHermanos.map(h => ({
      nombre: h.user.name,
      email: h.user.email,
      telefono: h.user.phone,
      estado: h.estado,
      registrado: h.createdAt,
    }))
  })
}
