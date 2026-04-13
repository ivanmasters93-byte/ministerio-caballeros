import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/biblia/data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const libro = searchParams.get('libro')
  const capituloStr = searchParams.get('capitulo')
  const versiculo = searchParams.get('versiculo') ?? undefined

  if (!libro || !capituloStr) {
    return NextResponse.json(
      { error: 'Parámetros requeridos: libro, capitulo' },
      { status: 400 }
    )
  }

  const capitulo = parseInt(capituloStr, 10)
  if (isNaN(capitulo) || capitulo < 1) {
    return NextResponse.json({ error: 'Capítulo inválido' }, { status: 400 })
  }

  try {
    const url = buildApiUrl(libro, capitulo, versiculo)
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error al obtener datos de la Biblia: ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()

    // Normalize response from bible-api.com
    const versiculos = (data.verses ?? []).map((v: { book_name?: string; chapter?: number; verse?: number; text?: string }) => ({
      libro: libro,
      capitulo: v.chapter ?? capitulo,
      versiculo: v.verse ?? 1,
      texto: (v.text ?? '').trim(),
      referencia: `${libro} ${v.chapter ?? capitulo}:${v.verse ?? 1}`,
    }))

    return NextResponse.json({
      libro,
      capitulo,
      versiculo: versiculo ?? null,
      versiculos,
      textoCompleto: data.text ?? '',
    })
  } catch (err) {
    console.error('[biblia/versiculo]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
