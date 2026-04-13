import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      hermano: {
        select: {
          fechaNacimiento: true,
          direccion: true,
          ocupacion: true,
          estadoCivil: true,
          estado: true,
        },
      },
      redes: {
        include: { red: { select: { nombre: true, tipo: true } } },
        take: 1,
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    name: user.name,
    email: user.email,
    phone: user.phone,
    fechaNacimiento: user.hermano?.fechaNacimiento,
    direccion: user.hermano?.direccion,
    ocupacion: user.hermano?.ocupacion,
    estadoCivil: user.hermano?.estadoCivil,
    estado: user.hermano?.estado || 'ACTIVO',
    red: user.redes[0]?.red || null,
  })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const body = await req.json()
  const { phone, direccion, ocupacion, estadoCivil } = body

  if (phone !== undefined) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phone },
    })
  }

  const hermano = await prisma.hermano.findUnique({ where: { userId: session.user.id } })

  if (hermano) {
    await prisma.hermano.update({
      where: { userId: session.user.id },
      data: {
        ...(direccion !== undefined && { direccion }),
        ...(ocupacion !== undefined && { ocupacion }),
        ...(estadoCivil !== undefined && { estadoCivil }),
      },
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      hermano: {
        select: { fechaNacimiento: true, direccion: true, ocupacion: true, estadoCivil: true, estado: true },
      },
      redes: { include: { red: { select: { nombre: true, tipo: true } } }, take: 1 },
    },
  })

  return NextResponse.json({
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    fechaNacimiento: user?.hermano?.fechaNacimiento,
    direccion: user?.hermano?.direccion,
    ocupacion: user?.hermano?.ocupacion,
    estadoCivil: user?.hermano?.estadoCivil,
    estado: user?.hermano?.estado || 'ACTIVO',
    red: user?.redes?.[0]?.red || null,
  })
}
