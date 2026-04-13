import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withErrorHandling,
  requirePermiso,
  jsonResponse,
  errorResponse,
} from '@/lib/api-helpers'
import { RECURSOS, ACCIONES } from '@/lib/permissions'
import { transcribirAudio } from '@/lib/predicas/transcripcion'

export const POST = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { id } = await context.params
    await requirePermiso(RECURSOS.DOCUMENTOS, ACCIONES.EDITAR)

    const predica = await prisma.predica.findUnique({ where: { id } })
    if (!predica) return errorResponse('Prédica no encontrada', 404)

    // Verificar si hay audio (desde URL o multipart)
    const contentType = req.headers.get('content-type') ?? ''

    let transcripcion = ''

    if (contentType.includes('multipart/form-data')) {
      // Audio enviado directamente como archivo
      const formData = await req.formData()
      const audioFile = formData.get('audio') as File | null

      if (!audioFile) return errorResponse('No se proporcionó archivo de audio')

      const buffer = Buffer.from(await audioFile.arrayBuffer())

      // Marcar como transcribiendo
      await prisma.predica.update({
        where: { id },
        data: { estado: 'TRANSCRIBIENDO' },
      })

      transcripcion = await transcribirAudio(buffer, audioFile.name)
    } else {
      // Transcripción manual enviada como JSON
      const body = await req.json()
      transcripcion = body.transcripcion ?? ''
    }

    if (!transcripcion) {
      await prisma.predica.update({
        where: { id },
        data: { estado: 'ERROR' },
      })
      return errorResponse(
        'No se pudo obtener la transcripción. Verifica que GROQ_API_KEY esté configurado o proporciona la transcripción manualmente.',
        422
      )
    }

    const updated = await prisma.predica.update({
      where: { id },
      data: {
        transcripcion,
        estado: 'TRANSCRITA',
      },
      include: {
        creador: { select: { id: true, name: true } },
        red: { select: { id: true, nombre: true } },
      },
    })

    return jsonResponse(updated)
  }
)
