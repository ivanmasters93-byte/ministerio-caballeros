import { NextRequest } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
import { withErrorHandling, requireAuth, jsonResponse, errorResponse } from '@/lib/api-helpers'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAuth()

  const videoId = req.nextUrl.searchParams.get('videoId')
  if (!videoId) return errorResponse('videoId requerido')

  try {
    // youtube-transcript package handles all the scraping internally
    const items = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'es' })

    if (!items || items.length === 0) {
      // Retry with English
      try {
        const enItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
        if (enItems && enItems.length > 0) {
          const text = enItems.map(i => i.text).join(' ').replace(/\s+/g, ' ').trim()
          return jsonResponse({ transcript: text, wordCount: text.split(/\s+/).length, lang: 'en' })
        }
      } catch {
        // fall through
      }

      // Retry without language preference
      try {
        const anyItems = await YoutubeTranscript.fetchTranscript(videoId)
        if (anyItems && anyItems.length > 0) {
          const text = anyItems.map(i => i.text).join(' ').replace(/\s+/g, ' ').trim()
          return jsonResponse({ transcript: text, wordCount: text.split(/\s+/).length, lang: 'auto' })
        }
      } catch {
        // fall through
      }

      return errorResponse('No se encontraron subtitulos para este video.', 404)
    }

    const text = items.map(i => i.text).join(' ').replace(/\s+/g, ' ').trim()

    return jsonResponse({
      transcript: text,
      wordCount: text.split(/\s+/).length,
      lang: 'es',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'

    // Check if it's a "no transcript" error vs a network error
    if (msg.includes('Could not get') || msg.includes('No transcript') || msg.includes('disabled')) {
      return errorResponse('Este video no tiene transcripcion disponible en YouTube.', 404)
    }

    return errorResponse(`Error extrayendo transcripcion: ${msg}`, 500)
  }
})
