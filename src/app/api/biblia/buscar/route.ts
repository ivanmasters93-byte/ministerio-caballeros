import { NextRequest, NextResponse } from 'next/server'
import { BIBLE_API_BASE, DEFAULT_VERSION } from '@/lib/biblia/data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const version = searchParams.get('version') ?? DEFAULT_VERSION

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: 'El parámetro q debe tener al menos 2 caracteres' },
      { status: 400 }
    )
  }

  try {
    const url = `${BIBLE_API_BASE}/?q[]=${encodeURIComponent(q)}&translation=${version}`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error en la búsqueda: ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()

    const resultados = (data.verses ?? []).map((v: { book_name?: string; chapter?: number; verse?: number; text?: string }) => ({
      libro: v.book_name ?? '',
      capitulo: v.chapter ?? 0,
      versiculo: v.verse ?? 0,
      texto: (v.text ?? '').trim(),
      referencia: `${v.book_name ?? ''} ${v.chapter ?? ''}:${v.verse ?? ''}`,
    }))

    return NextResponse.json({
      query: q,
      version,
      total: resultados.length,
      resultados,
    })
  } catch (err) {
    console.error('[biblia/buscar]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
