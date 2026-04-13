import { NextRequest, NextResponse } from 'next/server'

const CANVA_API = 'https://api.canva.com/rest/v1'

function headers() {
  const token = process.env.CANVA_API_TOKEN
  if (!token) throw new Error('NO_TOKEN')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

// Save a generated candidate to the user's Canva account
export async function POST(req: NextRequest) {
  try {
    const { candidate_id, job_id, title } = await req.json()

    if (!candidate_id) {
      return NextResponse.json({ success: false, error: 'candidate_id requerido' }, { status: 400 })
    }
    if (!process.env.CANVA_API_TOKEN) {
      return NextResponse.json({ success: false, error: 'CANVA_API_TOKEN no configurado', setup_required: true }, { status: 503 })
    }

    const response = await fetch(`${CANVA_API}/designs`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        candidate_id,
        job_id,
        title: title ?? 'Flyer GEDEONES GP',
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error('[Canva save]', response.status, text)
      return NextResponse.json(
        { success: false, error: `Error guardando diseño (${response.status})` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      design_id: data.design?.id,
      edit_url:  data.design?.urls?.edit_url  ?? data.design?.url,
      view_url:  data.design?.urls?.view_url,
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[/api/flyers/save]', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
