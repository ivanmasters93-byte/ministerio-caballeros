import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const secret = (process.env.NEXTAUTH_SECRET || '').trim().replace(/\\n$/, '')
  if (!key || !secret || key !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [totalUsers, totalHermanos, redes, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.hermano.count(),
    prisma.red.findMany({
      select: { nombre: true, tipo: true, _count: { select: { miembros: true } } }
    }),
    prisma.user.findMany({
      where: { role: 'HERMANO' },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        hermano: { select: { estado: true, ocupacion: true, estadoCivil: true } },
        redes: { select: { red: { select: { nombre: true } } } },
      }
    })
  ])

  return NextResponse.json({
    totalUsers,
    totalHermanos,
    redes: redes.map(r => ({ nombre: r.nombre, tipo: r.tipo, miembros: r._count.miembros })),
    ultimosRegistros: recentUsers.map(u => ({
      nombre: u.name,
      email: u.email,
      telefono: u.phone,
      estado: u.hermano?.estado ?? 'N/A',
      ocupacion: u.hermano?.ocupacion ?? '',
      red: u.redes[0]?.red?.nombre ?? 'Sin red',
      registrado: u.createdAt,
    }))
  })
}
