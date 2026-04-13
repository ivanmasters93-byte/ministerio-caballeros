import { NextRequest } from 'next/server'
import { fetchTranscript } from 'youtube-transcript-plus'
import { withErrorHandling, requireAuth, jsonResponse, errorResponse } from '@/lib/api-helpers'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAuth()

  const videoId = req.nextUrl.searchParams.get('videoId')
  if (!videoId) return errorResponse('videoId requerido')

  try {
    const items = await fetchTranscript(videoId)

    if (!items || items.length === 0) {
      return errorResponse('No se encontro transcripcion para este video.', 404)
    }

    // Clean and join all transcript text
    const text = items
      .map((i: { text: string }) => i.text)
      .join(' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()

    return jsonResponse({
      transcript: text,
      wordCount: text.split(/\s+/).length,
      segments: items.length,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return errorResponse(`No se pudo extraer la transcripcion: ${msg}`, 500)
  }
})
