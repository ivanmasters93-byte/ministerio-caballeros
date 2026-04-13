import { NextRequest, NextResponse } from 'next/server'
import { libroToFileName } from '@/lib/biblia/data'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const libro = searchParams.get('libro')
  const capituloStr = searchParams.get('capitulo')
  const versiculo = searchParams.get('versiculo') ?? undefined

  if (!libro || !capituloStr) {
    return NextResponse.json(
      { error: 'Parametros requeridos: libro, capitulo' },
      { status: 400 }
    )
  }

  const capitulo = parseInt(capituloStr, 10)
  if (isNaN(capitulo) || capitulo < 1) {
    return NextResponse.json({ error: 'Capitulo invalido' }, { status: 400 })
  }

  try {
    const abbrev = libroToFileName(libro)
    const filePath = path.join(process.cwd(), 'public', 'biblia', 'books', `${abbrev}.json`)

    const raw = await readFile(filePath, 'utf-8')
    const bookData = JSON.parse(raw) as {
      abbrev: string
      chapters: Array<{ number: number; verses: string[] }>
    }

    const chapter = bookData.chapters.find((c) => c.number === capitulo)
    if (!chapter) {
      return NextResponse.json(
        { error: `Capitulo ${capitulo} no encontrado en ${libro}` },
        { status: 404 }
      )
    }

    const versiculos = chapter.verses.map((texto, i) => ({
      libro,
      capitulo,
      versiculo: i + 1,
      texto: texto.trim(),
      referencia: `${libro} ${capitulo}:${i + 1}`,
    }))

    // Filter to specific verse if requested
    const filtered = versiculo
      ? versiculos.filter((v) => String(v.versiculo) === versiculo)
      : versiculos

    return NextResponse.json({
      libro,
      capitulo,
      versiculo: versiculo ?? null,
      versiculos: filtered,
      textoCompleto: filtered.map((v) => v.texto).join(' '),
    })
  } catch (err) {
    console.error('[biblia/versiculo]', err)
    return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 })
  }
}
