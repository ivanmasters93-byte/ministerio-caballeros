/**
 * Servicio de transcripción de audio para prédicas.
 * Usa Groq Whisper API (gratuito) como opción principal.
 */

export async function transcribirAudio(audioBuffer: Buffer, fileName: string): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY

  if (!GROQ_API_KEY) {
    return ''
  }

  try {
    const formData = new FormData()
    const rawBuffer = audioBuffer.buffer instanceof ArrayBuffer
      ? audioBuffer.buffer
      : audioBuffer.buffer.slice(0)
    const blob = new Blob([rawBuffer as ArrayBuffer], { type: detectMimeType(fileName) })
    formData.append('file', blob, fileName)
    formData.append('model', 'whisper-large-v3')
    formData.append('language', 'es')
    formData.append('response_format', 'text')

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Transcripcion] Groq error:', response.status, errorText)
      return ''
    }

    const text = await response.text()
    return text.trim()
  } catch (error) {
    console.error('[Transcripcion] Error llamando a Groq:', error)
    return ''
  }
}

function detectMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    webm: 'audio/webm',
    flac: 'audio/flac',
    mp4: 'audio/mp4',
  }
  return mimeTypes[ext ?? ''] ?? 'audio/mpeg'
}
