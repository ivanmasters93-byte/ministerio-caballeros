import { NextResponse } from 'next/server'
import { getCurrentQR, getStatus } from '@/lib/whatsapp/connection'

export async function GET() {
  const qr = getCurrentQR()
  const status = getStatus()

  return NextResponse.json({
    qr,
    status: status.state,
    connected: status.connected,
    phone: status.phone || null,
  })
}
