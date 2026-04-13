import { NextRequest } from 'next/server'
import { withErrorHandling, requireAuth, jsonResponse, errorResponse } from '@/lib/api-helpers'

// Use edge runtime — runs on Cloudflare's network, NOT blocked by YouTube
export const runtime = 'edge'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAuth()

  const videoId = req.nextUrl.searchParams.get('videoId')
  if (!videoId) return errorResponse('videoId requerido')

  try {
    // Fetch YouTube page from edge (Cloudflare IPs, not blocked)
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Accept': 'text/html',
      },
    })

    if (!pageRes.ok) return errorResponse('No se pudo acceder a YouTube', 502)
    const html = await pageRes.text()

    // Extract timedtext URLs
    const urls: string[] = []
    const regex = /https:\/\/www\.youtube\.com\/api\/timedtext[^"\\]*/g
    let match
    while ((match = regex.exec(html)) !== null) {
      urls.push(match[0].replace(/\\u0026/g, '&'))
    }

    if (urls.length === 0) {
      return errorResponse('Este video no tiene subtitulos disponibles.', 404)
    }

    // Prefer Spanish
    const sorted = [
      ...urls.filter(u => u.includes('lang=es')),
      ...urls.filter(u => !u.includes('lang=es')),
    ]

    for (const captionUrl of sorted) {
      try {
        const res = await fetch(captionUrl)
        if (!res.ok) continue
        const body = await res.text()

        // Parse XML
        if (body.includes('<text')) {
          const parts: string[] = []
          const textRegex = /<text[^>]*>([^<]*)<\/text>/g
          let m
          while ((m = textRegex.exec(body)) !== null) {
            parts.push(
              m[1]
                .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
            )
          }
          const text = parts.join(' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
          if (text.length > 100) {
            return jsonResponse({ transcript: text, wordCount: text.split(/\s+/).length })
          }
        }

        // Try JSON
        try {
          const data = JSON.parse(body)
          if (data.events) {
            const text = data.events
              .filter((e: {segs?: unknown[]}) => e.segs)
              .map((e: {segs: Array<{utf8: string}>}) => e.segs.map(s => s.utf8).join(''))
              .join(' ').replace(/\s+/g, ' ').trim()
            if (text.length > 100) {
              return jsonResponse({ transcript: text, wordCount: text.split(/\s+/).length })
            }
          }
        } catch { /* not json */ }
      } catch { continue }
    }

    return errorResponse('Se encontraron subtitulos pero no se pudieron procesar.', 422)
  } catch {
    return errorResponse('Error conectando con YouTube.', 500)
  }
})
