import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getNumberParam, getSearchParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { createMetaSchema, validateBody } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.FINANZAS, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)

  const mes = getNumberParam(searchParams, 'mes')
  const anio = getNumberParam(searchParams, 'anio')
  const redId = getSearchParam(searchParams, 'redId')
  const activa = searchParams.get('activa') === 'true'

  const now = new Date()

  const whereConditions: Prisma.MetaFinancieraWhereInput = {
    mes: mes || now.getMonth() + 1,
    anio: anio || now.getFullYear(),
  }

  if (redId) {
    whereConditions.redId = redId
  }

  if (activa) {
    whereConditions.activa = true
  }

  const metas = await prisma.metaFinanciera.findMany({
    where: whereConditions,
    orderBy: { createdAt: 'desc' },
  })

  return jsonResponse(metas)
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requirePermiso(RECURSOS.FINANZAS, ACCIONES.CREAR)

  const body = await req.json()
  const validation = validateBody(createMetaSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { nombre, montoMeta, mes, anio, redId, descripcion } = validation.data

  const meta = await prisma.metaFinanciera.create({
    data: {
      nombre,
      montoMeta,
      mes,
      anio,
      redId,
      descripcion,
      activa: true,
      montoActual: 0,
    },
  })

  return jsonResponse(meta, 201)
})

export const PUT = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.FINANZAS, ACCIONES.EDITAR)

  const { searchParams } = new URL(req.url)
  const id = getSearchParam(searchParams, 'id')

  if (!id) return errorResponse('ID de meta requerido')

  const body = await req.json()
  const { montoActual, activa } = body

  const meta = await prisma.metaFinanciera.findUnique({ where: { id } })
  if (!meta) return errorResponse('Meta no encontrada', 404)

  const updated = await prisma.metaFinanciera.update({
    where: { id },
    data: {
      ...(montoActual !== undefined && { montoActual }),
      ...(activa !== undefined && { activa }),
    },
  })

  return jsonResponse(updated)
})
