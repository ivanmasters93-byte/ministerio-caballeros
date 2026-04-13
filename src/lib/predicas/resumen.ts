/**
 * Servicio de generación de resúmenes para prédicas.
 * Usa Groq (gratuito) con Llama como opción principal,
 * y Anthropic Claude como fallback si está disponible.
 */

export interface ResumenPredica {
  resumen: string
  puntosClave: string[]
  preguntasReflexion: string[]
  versiculosCitados: string[]
}

const PROMPT_TEMPLATE = (titulo: string, predicador: string, transcripcion: string) => `Eres un asistente pastoral que ayuda a procesar prédicas y sermones.

Analiza la siguiente prédica y genera una respuesta estructurada en formato JSON válido.

Título: ${titulo}
Predicador: ${predicador}

Transcripción:
${transcripcion.slice(0, 8000)}

Responde ÚNICAMENTE con un JSON válido en este formato exacto (sin texto adicional, sin markdown):
{
  "resumen": "Resumen conciso de 2-3 párrafos que capture los puntos principales de la prédica",
  "puntosClave": ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
  "preguntasReflexion": ["Pregunta de reflexión 1", "Pregunta de reflexión 2"],
  "versiculosCitados": ["Juan 3:16", "Salmos 23:1"]
}`

export async function generarResumen(
  transcripcion: string,
  titulo: string,
  predicador: string
): Promise<ResumenPredica> {
  const prompt = PROMPT_TEMPLATE(titulo, predicador, transcripcion)

  // Intentar primero con Groq (gratuito)
  const groqResult = await intentarGroq(prompt)
  if (groqResult) return groqResult

  // Fallback a Anthropic si está configurado
  const anthropicResult = await intentarAnthropic(prompt)
  if (anthropicResult) return anthropicResult

  // Resultado vacío si ningún servicio está disponible
  return {
    resumen: '',
    puntosClave: [],
    preguntasReflexion: [],
    versiculosCitados: [],
  }
}

async function intentarGroq(prompt: string): Promise<ResumenPredica | null> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) return null

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      console.error('[Resumen] Groq error:', response.status)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    return parseJsonResponse(content)
  } catch (error) {
    console.error('[Resumen] Error con Groq:', error)
    return null
  }
}

async function intentarAnthropic(prompt: string): Promise<ResumenPredica | null> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) return null

  try {
    const { Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]?.type === 'text' ? message.content[0].text : ''
    return parseJsonResponse(content)
  } catch (error) {
    console.error('[Resumen] Error con Anthropic:', error)
    return null
  }
}

function parseJsonResponse(content: string): ResumenPredica | null {
  try {
    // Extraer JSON si viene envuelto en markdown
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])

    return {
      resumen: typeof parsed.resumen === 'string' ? parsed.resumen : '',
      puntosClave: Array.isArray(parsed.puntosClave)
        ? parsed.puntosClave.filter((p: unknown) => typeof p === 'string')
        : [],
      preguntasReflexion: Array.isArray(parsed.preguntasReflexion)
        ? parsed.preguntasReflexion.filter((p: unknown) => typeof p === 'string')
        : [],
      versiculosCitados: Array.isArray(parsed.versiculosCitados)
        ? parsed.versiculosCitados.filter((v: unknown) => typeof v === 'string')
        : [],
    }
  } catch {
    return null
  }
}
