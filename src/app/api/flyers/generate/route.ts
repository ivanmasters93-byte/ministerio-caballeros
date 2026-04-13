import { NextRequest, NextResponse } from 'next/server'

// ============================================================
// Canva Connect API — AI Design Generation
// Docs: https://www.canva.com/developers/docs/connect/
// Auth: Personal Access Token (Bearer)
// ============================================================

const CANVA_API = 'https://api.canva.com/rest/v1'

function headers() {
  const token = process.env.CANVA_API_TOKEN
  if (!token) throw new Error('NO_TOKEN')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

// Build a rich natural-language prompt for Canva's AI
function buildPrompt(data: {
  titulo: string
  subtitulo?: string
  categoria?: string
  fechaHora?: string
  lugar?: string
  descripcion?: string
}) {
  const categoryStyle: Record<string, string> = {
    ayuno:      'dark dramatic green background with spiritual light rays, cross and flame symbols, powerful fasting prayer atmosphere',
    culto:      'rich deep purple and gold church service design, light rays from above, cross, majestic and reverent',
    revival:    'bold red and orange fire background, dramatic flames, powerful revival atmosphere, high energy',
    retiro:     'peaceful mountain nature background, blue and gold spiritual retreat, contemplative atmosphere',
    alabanza:   'vibrant purple worship design, musical notes, praise and worship concert style, energetic',
    transporte: 'bold blue dynamic design, transportation announcement, free community event, bright and clear',
    general:    'professional church ministry design, clean layout, gold accents on dark background',
  }
  const style = categoryStyle[data.categoria ?? 'general'] ?? categoryStyle.general

  const parts = [
    `Professional church event flyer for GEDEONES GP Ministerio de Caballeros, Colón, Panamá.`,
    `Event title: "${data.titulo}".`,
  ]
  if (data.subtitulo) parts.push(`Subtitle: "${data.subtitulo}".`)
  if (data.fechaHora) parts.push(`Date and time: ${data.fechaHora}.`)
  if (data.lugar)    parts.push(`Location: ${data.lugar}.`)
  if (data.descripcion) parts.push(`Details: ${data.descripcion}.`)
  parts.push(`Visual style: ${style}.`)
  parts.push(`Include ministry name "GEDEONES GP" and "Ministerio de Caballeros". Spanish language. High quality, ready to share on WhatsApp. Professional megachurch flyer.`)

  return parts.join(' ')
}

export async function GET() {
  return NextResponse.json({
    canva_configured: !!process.env.CANVA_API_TOKEN,
    status: process.env.CANVA_API_TOKEN ? 'ready' : 'token_required',
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // --- No token → return setup instructions ---
    if (!process.env.CANVA_API_TOKEN) {
      return NextResponse.json({
        success: false,
        setup_required: true,
        message: 'Agrega CANVA_API_TOKEN en .env.local para activar la generación con IA',
        steps: [
          'Ve a https://www.canva.com/developers/',
          'Crea o accede a tu app de desarrollador',
          'Genera un Personal Access Token (PAT)',
          'Agrega CANVA_API_TOKEN=tu_token en .env.local',
          'Reinicia el servidor: npm run dev',
        ],
      })
    }

    const prompt = buildPrompt(body)

    // --- Call Canva's design generation endpoint ---
    const response = await fetch(`${CANVA_API}/designs/generate`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        query: prompt,
        design_type: 'flyer',
      }),
    })

    // Handle API errors
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error('[Canva API]', response.status, text)

      // 401 = bad token
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Token de Canva inválido. Verifica CANVA_API_TOKEN en .env.local.' },
          { status: 401 }
        )
      }
      // 403 = missing scopes
      if (response.status === 403) {
        return NextResponse.json(
          { success: false, error: 'Tu token de Canva no tiene los permisos necesarios. Genera uno nuevo con todos los scopes.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { success: false, error: `Error de Canva (${response.status}). Intenta de nuevo.` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const designs = data.job?.result?.generated_designs ?? data.generated_designs ?? []

    return NextResponse.json({ success: true, designs, job_id: data.job?.id })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[/api/flyers/generate]', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
