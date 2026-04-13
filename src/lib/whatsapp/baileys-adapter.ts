import {
  WhatsAppAdapter,
  WhatsAppMessage,
  SendMessageResult,
  ConnectionStatus,
  TemplateMessage,
  InteractiveMessagePayload,
} from './types'
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  ConnectionState,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import * as QRCode from 'qrcode'
import { EventEmitter } from 'events'
import * as path from 'path'

export type BaileysConnectionState = 'disconnected' | 'connecting' | 'connected'

export interface BaileysEvents {
  qr: (qr: string) => void
  connected: () => void
  disconnected: (reason: string) => void
  message: (msg: { from: string; body: string; messageId: string; timestamp: number }) => void
  'connection-update': (state: BaileysConnectionState) => void
}

export class BaileysConnection extends EventEmitter {
  private socket: WASocket | null = null
  private state: BaileysConnectionState = 'disconnected'
  private currentQR: string | null = null
  private currentQRDataURI: string | null = null
  private lastConnected: Date | null = null
  private phoneNumber: string | null = null
  private authDir: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(authDir?: string) {
    super()
    this.authDir = authDir || path.join(process.cwd(), '.whatsapp-auth')
  }

  async connect(): Promise<void> {
    if (this.state === 'connecting' || this.state === 'connected') {
      return
    }

    this.updateState('connecting')

    try {
      const { state: authState, saveCreds } = await useMultiFileAuthState(this.authDir)

      this.socket = makeWASocket({
        auth: authState,
        printQRInTerminal: true,
      })

      this.socket.ev.on('creds.update', saveCreds)

      this.socket.ev.on('connection.update', (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
          this.currentQR = qr
          this.generateQRDataURI(qr)
          this.emit('qr', qr)
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut

          console.log('[Baileys] Connection closed. Status code:', statusCode)

          this.currentQR = null
          this.currentQRDataURI = null

          if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`[Baileys] Reconnecting... attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
            this.updateState('disconnected')
            setTimeout(() => this.connect(), 3000)
          } else {
            this.updateState('disconnected')
            this.emit('disconnected', statusCode === DisconnectReason.loggedOut ? 'logged_out' : 'connection_lost')
          }
        }

        if (connection === 'open') {
          console.log('[Baileys] Connected successfully')
          this.currentQR = null
          this.currentQRDataURI = null
          this.lastConnected = new Date()
          this.reconnectAttempts = 0
          this.phoneNumber = this.socket?.user?.id?.split(':')[0] || null
          this.updateState('connected')
          this.emit('connected')
        }
      })

      this.socket.ev.on('messages.upsert', (m) => {
        for (const msg of m.messages) {
          if (msg.key.fromMe) continue

          const from = msg.key.remoteJid?.replace('@s.whatsapp.net', '') || ''
          const body = msg.message?.conversation
            || msg.message?.extendedTextMessage?.text
            || ''

          if (from && body) {
            this.emit('message', {
              from,
              body,
              messageId: msg.key.id || '',
              timestamp: msg.messageTimestamp as number,
            })
          }
        }
      })
    } catch (error) {
      console.error('[Baileys] Error connecting:', error)
      this.updateState('disconnected')
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      await this.socket.logout().catch(() => {})
      this.socket = null
    }
    this.currentQR = null
    this.currentQRDataURI = null
    this.phoneNumber = null
    this.updateState('disconnected')
  }

  async reconnect(): Promise<void> {
    if (this.socket) {
      this.socket.end(undefined)
      this.socket = null
    }
    this.reconnectAttempts = 0
    this.updateState('disconnected')
    await this.connect()
  }

  getConnectionState(): BaileysConnectionState {
    return this.state
  }

  getQRDataURI(): string | null {
    return this.currentQRDataURI
  }

  getPhoneNumber(): string | null {
    return this.phoneNumber
  }

  getLastConnected(): Date | null {
    return this.lastConnected
  }

  getAdapter(): BaileysWhatsAppAdapter {
    return new BaileysWhatsAppAdapter(this)
  }

  getSocket(): WASocket | null {
    return this.socket
  }

  private updateState(newState: BaileysConnectionState): void {
    this.state = newState
    this.emit('connection-update', newState)
  }

  private async generateQRDataURI(qr: string): Promise<void> {
    try {
      this.currentQRDataURI = await QRCode.toDataURL(qr)
    } catch (err) {
      console.error('[Baileys] Error generating QR data URI:', err)
    }
  }
}

/**
 * Baileys WhatsApp Adapter
 * Implements the WhatsAppAdapter interface using @whiskeysockets/baileys
 */
export class BaileysWhatsAppAdapter implements WhatsAppAdapter {
  private connection: BaileysConnection

  constructor(connection: BaileysConnection) {
    this.connection = connection
  }

  private formatJid(phone: string): string {
    // Remove any non-digit characters except leading +
    const cleaned = phone.replace(/[^\d]/g, '')
    return `${cleaned}@s.whatsapp.net`
  }

  async sendMessage(message: WhatsAppMessage): Promise<SendMessageResult> {
    const socket = this.connection.getSocket()
    if (!socket || this.connection.getConnectionState() !== 'connected') {
      return {
        success: false,
        error: 'WhatsApp not connected',
        statusCode: 503,
      }
    }

    try {
      const jid = this.formatJid(message.to)

      if (message.type === 'text') {
        const result = await socket.sendMessage(jid, { text: message.body })
        return {
          success: true,
          messageId: result?.key?.id || undefined,
        }
      }

      if (message.type === 'interactive' && message.interactive) {
        return this.sendInteractiveMessage(message.to, message.interactive)
      }

      if (message.type === 'template') {
        // Baileys doesn't support templates directly; send as text
        const result = await socket.sendMessage(jid, { text: message.body })
        return {
          success: true,
          messageId: result?.key?.id || undefined,
        }
      }

      // Default: send as text
      const result = await socket.sendMessage(jid, { text: message.body })
      return {
        success: true,
        messageId: result?.key?.id || undefined,
      }
    } catch (error) {
      console.error('[Baileys] Error sending message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      }
    }
  }

  async sendTemplate(to: string, template: TemplateMessage): Promise<SendMessageResult> {
    // Baileys doesn't support Business API templates;
    // send template content as a plain text message
    const socket = this.connection.getSocket()
    if (!socket || this.connection.getConnectionState() !== 'connected') {
      return {
        success: false,
        error: 'WhatsApp not connected',
        statusCode: 503,
      }
    }

    try {
      const jid = this.formatJid(to)
      const bodyText = template.parameters?.body?.text?.join(' ') || template.name
      const result = await socket.sendMessage(jid, { text: bodyText })

      return {
        success: true,
        messageId: result?.key?.id || undefined,
      }
    } catch (error) {
      console.error('[Baileys] Error sending template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      }
    }
  }

  async sendInteractiveMessage(
    to: string,
    message: InteractiveMessagePayload
  ): Promise<SendMessageResult> {
    // Baileys doesn't support interactive messages natively;
    // send as a formatted text with numbered options
    const socket = this.connection.getSocket()
    if (!socket || this.connection.getConnectionState() !== 'connected') {
      return {
        success: false,
        error: 'WhatsApp not connected',
        statusCode: 503,
      }
    }

    try {
      const jid = this.formatJid(to)
      let text = message.body

      if (message.action.buttons?.length) {
        text += '\n\n'
        message.action.buttons.forEach((btn, i) => {
          text += `${i + 1}. ${btn.reply.title}\n`
        })
      }

      if (message.action.sections?.length) {
        text += '\n\n'
        for (const section of message.action.sections) {
          if (section.title) text += `*${section.title}*\n`
          section.rows.forEach((row, i) => {
            text += `${i + 1}. ${row.title}`
            if (row.description) text += ` - ${row.description}`
            text += '\n'
          })
        }
      }

      if (message.footer) {
        text += `\n_${message.footer}_`
      }

      const result = await socket.sendMessage(jid, { text })
      return {
        success: true,
        messageId: result?.key?.id || undefined,
      }
    } catch (error) {
      console.error('[Baileys] Error sending interactive message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      }
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const socket = this.connection.getSocket()
    if (!socket || this.connection.getConnectionState() !== 'connected') {
      return
    }

    try {
      await socket.readMessages([{ id: messageId, remoteJid: '' }])
    } catch (error) {
      console.error('[Baileys] Error marking message as read:', error)
    }
  }

  getStatus(): ConnectionStatus {
    return {
      connected: this.connection.getConnectionState() === 'connected',
      provider: 'baileys',
      phone: this.connection.getPhoneNumber() || undefined,
      lastConnected: this.connection.getLastConnected() || undefined,
    }
  }
}
