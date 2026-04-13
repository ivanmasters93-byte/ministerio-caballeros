import { NextResponse } from 'next/server'
import { getVersiculoDelDia } from '@/lib/biblia/versiculos-diarios'

export async function GET() {
  try {
    const versiculo = getVersiculoDelDia()
    const hoy = new Date().toISOString().split('T')[0]

    return NextResponse.json({
      referencia: versiculo.referencia,
      texto: versiculo.texto,
      fecha: hoy,
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener versículo del día' }, { status: 500 })
  }
}
