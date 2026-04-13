import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withErrorHandling,
  requirePermiso,
  jsonResponse,
  errorResponse,
} from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { generarResumen } from '@/lib/predicas/resumen'

export const POST = withErrorHandling(
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { id } = await context.params
    await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.EDITAR)

    const predica = await prisma.predica.findUnique({ where: { id } })
    if (!predica) return errorResponse('Prédica no encontrada', 404)

    if (!predica.transcripcion) {
      return errorResponse(
        'La prédica no tiene transcripción. Primero transcribe el audio.',
        422
      )
    }

    // Marcar como procesando
    await prisma.predica.update({
      where: { id },
      data: { estado: 'PROCESANDO' },
    })

    const resultado = await generarResumen(
      predica.transcripcion,
      predica.titulo,
      predica.predicador
    )

    if (!resultado.resumen) {
      await prisma.predica.update({
        where: { id },
        data: { estado: 'TRANSCRITA' },
      })
      return errorResponse(
        'No se pudo generar el resumen. Verifica que GROQ_API_KEY o ANTHROPIC_API_KEY estén configurados.',
        422
      )
    }

    const updated = await prisma.predica.update({
      where: { id },
      data: {
        resumen: resultado.resumen,
        puntosClave: JSON.stringify(resultado.puntosClave),
        preguntasReflexion: JSON.stringify(resultado.preguntasReflexion),
        versiculosCitados: JSON.stringify(resultado.versiculosCitados),
        estado: 'COMPLETA',
      },
      include: {
        creador: { select: { id: true, name: true } },
        red: { select: { id: true, nombre: true } },
      },
    })

    return jsonResponse(updated)
  }
)
