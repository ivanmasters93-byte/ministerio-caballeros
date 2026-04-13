import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withErrorHandling,
  requirePermiso,
  jsonResponse,
  errorResponse,
} from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { EstadoPredica } from '@prisma/client'

const predicaInclude = {
  creador: { select: { id: true, name: true } },
  red: { select: { id: true, nombre: true } },
  evento: { select: { id: true, titulo: true } },
}

export const GET = withErrorHandling(
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { id } = await context.params
    await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.LEER)

    const predica = await prisma.predica.findUnique({
      where: { id },
      include: predicaInclude,
    })

    if (!predica) return errorResponse('Prédica no encontrada', 404)

    return jsonResponse(predica)
  }
)

export const PATCH = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { id } = await context.params
    await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.EDITAR)

    const predica = await prisma.predica.findUnique({ where: { id } })
    if (!predica) return errorResponse('Prédica no encontrada', 404)

    const body = await req.json()
    const {
      titulo,
      predicador,
      fecha,
      duracion,
      audioUrl,
      transcripcion,
      resumen,
      puntosClave,
      preguntasReflexion,
      versiculosCitados,
      estado,
      eventoId,
      redId,
    } = body

    const updated = await prisma.predica.update({
      where: { id },
      data: {
        titulo: titulo !== undefined ? titulo : undefined,
        predicador: predicador !== undefined ? predicador : undefined,
        fecha: fecha ? new Date(fecha) : undefined,
        duracion: duracion !== undefined ? Number(duracion) : undefined,
        audioUrl: audioUrl !== undefined ? audioUrl : undefined,
        transcripcion: transcripcion !== undefined ? transcripcion : undefined,
        resumen: resumen !== undefined ? resumen : undefined,
        puntosClave: puntosClave !== undefined ? JSON.stringify(puntosClave) : undefined,
        preguntasReflexion:
          preguntasReflexion !== undefined ? JSON.stringify(preguntasReflexion) : undefined,
        versiculosCitados:
          versiculosCitados !== undefined ? JSON.stringify(versiculosCitados) : undefined,
        estado: estado !== undefined ? (estado as EstadoPredica) : undefined,
        eventoId: eventoId !== undefined ? eventoId : undefined,
        redId: redId !== undefined ? redId : undefined,
      },
      include: predicaInclude,
    })

    return jsonResponse(updated)
  }
)

export const DELETE = withErrorHandling(
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { id } = await context.params
    await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.ELIMINAR)

    const predica = await prisma.predica.findUnique({ where: { id } })
    if (!predica) return errorResponse('Prédica no encontrada', 404)

    await prisma.predica.delete({ where: { id } })

    return jsonResponse({ message: 'Prédica eliminada' })
  }
)
