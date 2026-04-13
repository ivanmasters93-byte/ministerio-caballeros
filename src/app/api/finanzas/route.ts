import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getNumberParam, getSearchParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { createCuotaSchema, validateBody } from '@/lib/validations'
import { Prisma, EstadoCuota } from '@prisma/client'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.FINANZAS, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)

  const mes = getNumberParam(searchParams, 'mes')
  const anio = getNumberParam(searchParams, 'anio')
  const redId = getSearchParam(searchParams, 'redId')
  const estado = getSearchParam(searchParams, 'estado')

  const now = new Date()
  const targetMes = mes || now.getMonth() + 1
  const targetAnio = anio || now.getFullYear()

  const whereConditions: Prisma.CuotaWhereInput = {
    mes: targetMes,
    anio: targetAnio,
  }

  if (redId) {
    whereConditions.redId = redId
  }

  if (estado) {
    whereConditions.estado = estado as EstadoCuota
  }

  const [cuotas, hermanos, meta] = await Promise.all([
    prisma.cuota.findMany({
      where: whereConditions,
      include: {
        hermano: { include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } } },
      },
      orderBy: { fecha: 'desc' },
    }),
    prisma.hermano.findMany({
      where: { estado: { in: ['ACTIVO', 'NUEVO'] } },
      include: { user: { select: { id: true, name: true, email: true, phone: true, role: true, redes: { include: { red: true } } } } },
    }),
    prisma.metaFinanciera.findFirst({
      where: { mes: targetMes, anio: targetAnio, activa: true },
    }),
  ])

  // Build contribution map
  const pagadasIds = new Set(cuotas.filter((c) => c.estado === 'PAGADA').map((c) => c.hermanoId))
  const totalRecaudado = cuotas.filter((c) => c.estado === 'PAGADA').reduce((sum, c) => sum + c.monto, 0)
  const pendientes = hermanos.filter((h) => !pagadasIds.has(h.id))
  const aportaron = hermanos.filter((h) => pagadasIds.has(h.id))

  return jsonResponse({
    cuotas,
    totalRecaudado,
    totalEsperado: hermanos.length * 10, // $10 default per hermano
    pendientes,
    aportaron,
    meta,
    mes: targetMes,
    anio: targetAnio,
    porcentaje: hermanos.length > 0 ? Math.round((aportaron.length / hermanos.length) * 100) : 0,
  })
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requirePermiso(RECURSOS.FINANZAS, ACCIONES.CREAR)

  const body = await req.json()
  const validation = validateBody(createCuotaSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { hermanoId, monto, mes, anio, tipo, concepto, redId, creadoPor } = validation.data

  const cuota = await prisma.cuota.create({
    data: {
      hermanoId,
      monto,
      mes,
      anio,
      tipo: tipo || 'MENSUAL',
      estado: 'PENDIENTE',
      concepto,
      redId,
      creadoPor,
    },
    include: { hermano: { include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } } } },
  })

  return jsonResponse(cuota, 201)
})
