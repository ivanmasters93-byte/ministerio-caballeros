import { NextRequest } from 'next/server'
import { withErrorHandling, requireAuth, jsonResponse, errorResponse } from '@/lib/api-helpers'

// Extract transcript from YouTube video page
async function getYouTubeTranscript(videoId: string): Promise<{ text: string; lang: string; source: string } | null> {
  // Method 1: Fetch the YouTube watch page and extract captionTracks
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml',
  }

  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers })
    if (!pageRes.ok) return null

    const html = await pageRes.text()

    // Extract captionTracks from the page's player response
    const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/)
    if (!captionMatch) {
      // Try alternate pattern
      const altMatch = html.match(/captionTracks.*?(\[.*?\])/)
      if (!altMatch) return null
    }

    let tracks: Array<{ baseUrl: string; languageCode: string; kind?: string }> = []
    try {
      const rawMatch = html.match(/"captionTracks":\s*(\[.*?\])/)
      if (rawMatch) {
        const cleaned = rawMatch[1].replace(/\\"/g, '"').replace(/\\u0026/g, '&')
        tracks = JSON.parse(cleaned)
      }
    } catch {
      // Try regex extraction of individual baseUrls
      const urlMatches = html.matchAll(/baseUrl":"(https:\/\/www\.youtube\.com\/api\/timedtext[^"]*?)"/g)
      for (const m of urlMatches) {
        const url = m[1].replace(/\\u0026/g, '&')
        const langMatch = url.match(/lang=([a-z]{2})/)
        tracks.push({
          baseUrl: url,
          languageCode: langMatch ? langMatch[1] : 'unknown',
          kind: url.includes('kind=asr') ? 'asr' : undefined,
        })
      }
    }

    if (tracks.length === 0) return null

    // Prefer: Spanish manual > Spanish ASR > English > any
    const priority = [
      tracks.find(t => t.languageCode === 'es' && t.kind !== 'asr'),
      tracks.find(t => t.languageCode === 'es'),
      tracks.find(t => t.languageCode === 'en'),
      tracks[0],
    ]

    for (const track of priority) {
      if (!track?.baseUrl) continue
      try {
        const captionUrl = track.baseUrl + (track.baseUrl.includes('fmt=') ? '' : '&fmt=json3')
        const captionRes = await fetch(captionUrl.replace(/\\u0026/g, '&'), { headers })
        if (!captionRes.ok) continue

        const contentType = captionRes.headers.get('content-type') || ''

        if (contentType.includes('json')) {
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

            if (text.length > 50) {
              return { text, lang: track.languageCode, source: 'youtube_captions' }
            }
          }
        } else {
          // XML format
          const xml = await captionRes.text()
          const textMatches = xml.matchAll(/<text[^>]*>([^<]*)<\/text>/g)
          const parts: string[] = []
          for (const m of textMatches) {
            parts.push(m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
          }
          const text = parts.join(' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
          if (text.length > 50) {
            return { text, lang: track.languageCode, source: 'youtube_xml' }
          }
        }
      } catch {
        continue
      }
    }
  } catch {
    // Fall through
  }

  // Method 2: Try direct timedtext API with ASR
  const langs = ['es', 'en']
  for (const lang of langs) {
    for (const kind of ['asr', '']) {
      try {
        const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}${kind ? `&kind=${kind}` : ''}`
        const res = await fetch(url, { headers })
        if (!res.ok) continue
        const xml = await res.text()
        if (!xml.includes('<text')) continue

        const textMatches = xml.matchAll(/<text[^>]*>([^<]*)<\/text>/g)
        const parts: string[] = []
        for (const m of textMatches) {
          parts.push(m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
        }
        const text = parts.join(' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
        if (text.length > 50) {
          return { text, lang, source: `timedtext_${kind || 'manual'}` }
        }
      } catch {
        continue
      }
    }
  }

  return null
}

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAuth()

  const videoId = req.nextUrl.searchParams.get('videoId')
  if (!videoId || videoId.length !== 11) return errorResponse('videoId invalido')

  const result = await getYouTubeTranscript(videoId)
  if (result) {
    return jsonResponse({
      transcript: result.text,
      lang: result.lang,
      source: result.source,
      wordCount: result.text.split(/\s+/).length,
    })
  }

  return errorResponse(
    'No se pudo obtener la transcripcion. Esto pasa cuando el video no tiene subtitulos generados por YouTube. Usa el metodo de microfono como alternativa.',
    404
  )
})
