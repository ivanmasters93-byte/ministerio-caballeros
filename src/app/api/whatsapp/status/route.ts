import { NextRequest, NextResponse } from 'next/server'
import { getWhatsAppAdapter } from '@/lib/whatsapp/adapter'
import { auth } from '@/lib/auth'

/**
 * GET /api/whatsapp/status
 * Return WhatsApp connection status and provider information
 *
 * Requires authentication
 */
export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get adapter status
    const adapter = getWhatsAppAdapter()
    const status = adapter.getStatus()

    return NextResponse.json({
      success: true,
      status: {
        connected: status.connected,
        provider: status.provider,
        phone: status.phone || 'No configurado',
        businessAccountId: status.businessAccountId,
        phoneNumberId: status.phoneNumberId,
        lastConnected: status.lastConnected,
      },
      // Meta-specific info
      ...(status.provider === 'meta' && {
        meta: {
          apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
          webhookConfigured: !!process.env.WHATSAPP_VERIFY_TOKEN,
        },
      }),
      // Mock-specific info
      ...(status.provider === 'mock' && {
        mock: {
          message: 'Using mock adapter. Configure WHATSAPP_PROVIDER and credentials for production.',
        },
      }),
    })
  } catch (error) {
    console.error('[WhatsApp Status] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
