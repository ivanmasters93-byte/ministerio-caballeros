import { NextResponse } from 'next/server'
import { getStatus, disconnect, reconnect, getConnection } from '@/lib/whatsapp/connection'

export async function GET() {
  const status = getStatus()

  return NextResponse.json({
    status: status.state,
    connected: status.connected,
    provider: status.provider,
    phone: status.phone || null,
    lastConnected: status.lastConnected || null,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'disconnect') {
      await disconnect()
      return NextResponse.json({ success: true, message: 'Disconnected' })
    }

    if (action === 'reconnect') {
      await reconnect()
      return NextResponse.json({ success: true, message: 'Reconnecting...' })
    }

    if (action === 'connect') {
      getConnection()
      return NextResponse.json({ success: true, message: 'Connecting...' })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use: connect, disconnect, reconnect' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[WhatsApp API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
