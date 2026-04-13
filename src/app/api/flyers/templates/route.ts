import { NextResponse } from 'next/server'
import { FLYER_TEMPLATES } from '@/lib/flyers/templates'

export async function GET() {
  return NextResponse.json(FLYER_TEMPLATES)
}
