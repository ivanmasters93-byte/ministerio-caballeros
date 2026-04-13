import { NextRequest, NextResponse } from 'next/server'
import { LIBRO_FILE_MAP } from '@/lib/biblia/data'
import { LIBROS_BIBLIA } from '@/lib/biblia/libros'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim().toLowerCase()

  if (!q || q.length < 3) {
    return NextResponse.json(
      { error: 'El parametro q debe tener al menos 3 caracteres' },
      { status: 400 }
    )
  }

  try {
    const resultados: Array<{
      libro: string
      capitulo: number
      versiculo: number
      texto: string
      referencia: string
    }> = []

    // Search through all books (limited to first 20 matches for performance)
    const MAX_RESULTS = 20

    for (const libroInfo of LIBROS_BIBLIA) {
      if (resultados.length >= MAX_RESULTS) break

      const abbrev = LIBRO_FILE_MAP[libroInfo.nombre]
      if (!abbrev) continue

      try {
        const filePath = path.join(process.cwd(), 'public', 'biblia', 'books', `${abbrev}.json`)
        const raw = await readFile(filePath, 'utf-8')
        const bookData = JSON.parse(raw) as {
          chapters: Array<{ number: number; verses: string[] }>
        }

        for (const chapter of bookData.chapters) {
          if (resultados.length >= MAX_RESULTS) break
          for (let vi = 0; vi < chapter.verses.length; vi++) {
            if (resultados.length >= MAX_RESULTS) break
            const texto = chapter.verses[vi]
            if (texto.toLowerCase().includes(q)) {
              resultados.push({
                libro: libroInfo.nombre,
                capitulo: chapter.number,
                versiculo: vi + 1,
                texto: texto.trim(),
                referencia: `${libroInfo.nombre} ${chapter.number}:${vi + 1}`,
              })
            }
          }
        }
      } catch {
        // Skip books that fail to load
      }
    }

    return NextResponse.json({
      query: q,
      total: resultados.length,
      resultados,
    })
  } catch (err) {
    console.error('[biblia/buscar]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
