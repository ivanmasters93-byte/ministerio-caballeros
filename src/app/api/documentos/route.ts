import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandling, requirePermiso, jsonResponse, errorResponse, getPaginationParams, buildPaginatedResponse, getSearchParam } from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { createDocumentoSchema, validateBody } from '@/lib/validations'
import { Prisma, TipoDocumento } from '@prisma/client'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.LEER)

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)

  const tipo = getSearchParam(searchParams, 'tipo')
  const categoria = getSearchParam(searchParams, 'categoria')
  const redId = getSearchParam(searchParams, 'redId')
  const search = getSearchParam(searchParams, 'search')

  const whereConditions: Prisma.DocumentoWhereInput = {
    activo: true,
  }

  if (tipo) {
    whereConditions.tipo = tipo as TipoDocumento
  }

  if (categoria) {
    whereConditions.categoria = categoria
  }

  if (redId) {
    whereConditions.redId = redId
  }

  if (search) {
    whereConditions.OR = [
      { titulo: { contains: search } },
      { descripcion: { contains: search } },
    ]
  }

  const [documentos, total] = await Promise.all([
    prisma.documento.findMany({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      orderBy: { publicadoEn: 'desc' },
      skip,
      take: limit,
    }),
    prisma.documento.count({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    }),
  ])

  return jsonResponse(buildPaginatedResponse(documentos, total, page, limit))
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.CREAR)

  const body = await req.json()
  const validation = validateBody(createDocumentoSchema, body)
  if (!validation.success) return errorResponse(validation.error)

  const { titulo, descripcion, tipo, url, redId, categoria } = validation.data

  const documento = await prisma.documento.create({
    data: {
      titulo,
      descripcion,
      tipo,
      url,
      redId,
      categoria,
      activo: true,
    },
  })

  return jsonResponse(documento, 201)
})
