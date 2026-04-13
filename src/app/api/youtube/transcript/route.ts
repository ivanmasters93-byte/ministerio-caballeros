import { NextRequest } from 'next/server'
import { withErrorHandling, requireAuth, jsonResponse, errorResponse } from '@/lib/api-helpers'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAuth()

  const videoId = req.nextUrl.searchParams.get('videoId')
  if (!videoId) return errorResponse('videoId requerido')

  try {
    // Use YouTube's timedtext API directly — no API key needed
    // First try Spanish captions, then auto-generated
    const langs = ['es', 'en']

    for (const lang of langs) {
      try {
        const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (data.events && data.events.length > 0) {
            const text = data.events
              .filter((e: { segs?: Array<{ utf8: string }> }) => e.segs)
              .map((e: { segs: Array<{ utf8: string }> }) =>
                e.segs.map((s: { utf8: string }) => s.utf8).join('')
              )
              .join(' ')
              .replace(/\n/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()

            if (text) {
              return jsonResponse({ transcript: text, lang, source: 'youtube_captions' })
            }
          }
        }
      } catch {
        continue
      }
    }

    // Try auto-generated captions via page scraping
    try {
      const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: { 'Accept-Language': 'es' }
      })
      const html = await pageRes.text()

      // Extract caption track URL from the page
      const captionMatch = html.match(/"captionTracks":\s*\[(.*?)\]/)
      if (captionMatch) {
        const tracks = JSON.parse(`[${captionMatch[1]}]`)
        // Prefer Spanish, then any available
        const track = tracks.find((t: { languageCode: string }) => t.languageCode === 'es')
          || tracks.find((t: { languageCode: string }) => t.languageCode === 'en')
          || tracks[0]

        if (track?.baseUrl) {
          const captionUrl = track.baseUrl.replace(/\\u0026/g, '&') + '&fmt=json3'
          const captionRes = await fetch(captionUrl)
          if (captionRes.ok) {
            const data = await captionRes.json()
            if (data.events) {
              const text = data.events
                .filter((e: { segs?: Array<{ utf8: string }> }) => e.segs)
                .map((e: { segs: Array<{ utf8: string }> }) =>
                  e.segs.map((s: { utf8: string }) => s.utf8).join('')
                )
                .join(' ')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()

              if (text) {
                return jsonResponse({
                  transcript: text,
                  lang: track.languageCode,
                  source: 'youtube_auto'
                })
              }
            }
          }
        }
      }
    } catch {
      // Fall through
    }

    return errorResponse('No se encontraron subtitulos para este video. El video debe tener subtitulos activados en YouTube.', 404)
  } catch {
    return errorResponse('Error al obtener la transcripcion', 500)
  }
})
