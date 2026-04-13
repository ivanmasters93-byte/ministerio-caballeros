import { BaileysConnection, BaileysConnectionState } from './baileys-adapter'
import type { ConnectionStatus } from './types'

// Module-level singleton - persists across API route invocations in the same process
let instance: BaileysConnection | null = null

/**
 * Get or create the singleton Baileys connection.
 * Automatically starts connecting if not already connected.
 */
export function getConnection(): BaileysConnection {
  if (!instance) {
    instance = new BaileysConnection()

    // Set up message handler (log for now, will be extended)
    instance.on('message', (msg: { from: string; body: string; messageId: string; timestamp: number }) => {
      console.log('[Baileys] Incoming message:', {
        from: msg.from,
        body: msg.body.substring(0, 100),
        messageId: msg.messageId,
      })
    })

    instance.on('connected', () => {
      console.log('[Baileys] Connection established and ready')
    })

    instance.on('disconnected', (reason: string) => {
      console.log('[Baileys] Disconnected:', reason)
    })

    instance.on('qr', () => {
      console.log('[Baileys] New QR code generated - scan from WhatsApp mobile app')
    })

    // Start connecting
    instance.connect().catch((err) => {
      console.error('[Baileys] Initial connection failed:', err)
    })
  }

  return instance
}

/**
 * Get the current QR code as a base64 data URI.
 * Returns null if no QR is currently available.
 */
export function getCurrentQR(): string | null {
  if (!instance) return null
  return instance.getQRDataURI()
}

/**
 * Get the current connection status.
 */
export function getStatus(): ConnectionStatus & { state: BaileysConnectionState } {
  if (!instance) {
    return {
      connected: false,
      provider: 'baileys',
      state: 'disconnected',
    }
  }

  const adapter = instance.getAdapter()
  const status = adapter.getStatus()

  return {
    ...status,
    state: instance.getConnectionState(),
  }
}

/**
 * Disconnect and clean up the connection.
 */
export async function disconnect(): Promise<void> {
  if (instance) {
    await instance.disconnect()
    instance = null
  }
}

/**
 * Reconnect (disconnect then connect again).
 */
export async function reconnect(): Promise<void> {
  if (instance) {
    await instance.reconnect()
  } else {
    // Create a new instance
    getConnection()
  }
}
