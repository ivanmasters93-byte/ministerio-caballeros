import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getPaginationParams, buildPaginatedResponse, getSearchParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { createHermanoSchema, validateBody } from '@/lib/validations'
import { Prisma, EstadoHermano } from '@prisma/client'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.HERMANOS, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)

  const search = getSearchParam(searchParams, 'search')
  const redId = getSearchParam(searchParams, 'redId')
  const estado = getSearchParam(searchParams, 'estado')

  const whereConditions: Prisma.HermanoWhereInput = {}

  if (search) {
    whereConditions.user = {
      name: {
        contains: search,
      },
    }
  } else if (redId || estado) {
    whereConditions.user = {}
    if (redId) {
      whereConditions.user.redes = {
        some: { redId },
      }
    }
  }

  if (estado) {
    whereConditions.estado = estado as EstadoHermano
  }

  const [hermanos, total] = await Promise.all([
    prisma.hermano.findMany({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      include: {
        user: {
          include: {
            redes: { include: { red: true } },
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
      skip,
      take: limit,
    }),
    prisma.hermano.count({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    }),
  ])

  return jsonResponse(buildPaginatedResponse(hermanos, total, page, limit))
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requirePermiso(RECURSOS.HERMANOS, ACCIONES.CREAR)

  const body = await req.json()
  const validation = validateBody(createHermanoSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { name, email, phone, password, redId, fechaNacimiento, direccion, ocupacion, estadoCivil } = validation.data

  const hashedPassword = await bcrypt.hash(password || 'hermano123', 10)

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'HERMANO',
        ...(redId ? { redes: { create: { redId } } } : {}),
        hermano: {
          create: {
            fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
            direccion,
            ocupacion,
            estadoCivil,
            estado: 'NUEVO',
          },
        },
      },
      include: {
        hermano: true,
        redes: { include: { red: true } },
      },
    })

    return jsonResponse(user, 201)
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'P2002') {
      return errorResponse('El email ya está registrado', 409)
    }
    throw error
  }
})
