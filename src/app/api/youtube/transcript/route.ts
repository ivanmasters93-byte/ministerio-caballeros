import { NextRequest } from 'next/server'
import { withErrorHandling, requireAuth, jsonResponse, errorResponse } from '@/lib/api-helpers'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAuth()

  const videoId = req.nextUrl.searchParams.get('videoId')
  if (!videoId || videoId.length !== 11) return errorResponse('videoId invalido')

  // Fetch the YouTube watch page to extract caption track URLs
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept-Language': 'es-ES,es;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  }

  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers })
    if (!pageRes.ok) return errorResponse('No se pudo acceder al video de YouTube', 502)
    const html = await pageRes.text()

    // Extract all timedtext URLs from the page
    const urlPattern = /https:\/\/www\.youtube\.com\/api\/timedtext[^"\\]*/g
    const urls: string[] = []
    let match
    while ((match = urlPattern.exec(html)) !== null) {
      urls.push(match[0].replace(/\\u0026/g, '&'))
    }

    if (urls.length === 0) {
      return errorResponse('Este video no tiene subtitulos disponibles en YouTube. Usa el metodo de microfono.', 404)
    }

    // Try each URL — prefer Spanish
    const sortedUrls = [
      ...urls.filter(u => u.includes('lang=es')),
      ...urls.filter(u => u.includes('lang=en')),
      ...urls.filter(u => !u.includes('lang=es') && !u.includes('lang=en')),
    ]

    for (const captionUrl of sortedUrls) {
      try {
        const res = await fetch(captionUrl, { headers })
        if (!res.ok) continue
        const body = await res.text()

        // Try JSON format
        if (body.startsWith('{') || body.startsWith('[')) {
          try {
            const data = JSON.parse(body)
            if (data.events) {
              const text = data.events
                .filter((e: { segs?: unknown[] }) => e.segs)
                .map((e: { segs: Array<{ utf8: string }> }) =>
                  e.segs.map(s => s.utf8).join('')
                )
                .join(' ')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()

              if (text.length > 100) {
                return jsonResponse({
                  transcript: text,
                  wordCount: text.split(/\s+/).length,
                  source: 'youtube_json',
                })
              }
            }
          } catch { /* not JSON */ }
        }

        // Try XML format
        if (body.includes('<text')) {
          const parts: string[] = []
          const textPattern = /<text[^>]*>([^<]*)<\/text>/g
          let m
          while ((m = textPattern.exec(body)) !== null) {
            const decoded = m[1]
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'")
            parts.push(decoded)
          }
          const text = parts.join(' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
          if (text.length > 100) {
            return jsonResponse({
              transcript: text,
              wordCount: text.split(/\s+/).length,
              source: 'youtube_xml',
            })
          }
        }
      } catch {
        continue
      }
    }

    return errorResponse('Se encontraron subtitulos pero no se pudieron procesar. Usa el metodo de microfono.', 422)
  } catch {
    return errorResponse('Error conectando con YouTube. Intenta de nuevo.', 500)
  }
})
