import { NextResponse } from 'next/server'
import { getCurrentQR, getStatus } from '@/lib/whatsapp/connection'
import { getAuthSession } from '@/lib/api-helpers'

export async function GET() {
  const session = await getAuthSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const qr = getCurrentQR()
  const status = getStatus()

  return NextResponse.json({
    qr,
    status: status.state,
    connected: status.connected,
    phone: status.phone || null,
  })
}
