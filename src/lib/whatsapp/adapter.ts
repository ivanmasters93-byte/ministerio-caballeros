import { WhatsAppAdapter, SendMessageResult, ConnectionStatus, WhatsAppMessage, TemplateMessage, InteractiveMessagePayload, MetaBusinessAPIConfig } from './types'
import { MockWhatsAppAdapter } from './mock'

interface MetaApiResponse {
  messages?: Array<{ id: string }>
  error?: { message: string }
  [key: string]: unknown
}

let adapterInstance: WhatsAppAdapter | null = null

export function getWhatsAppAdapter(): WhatsAppAdapter {
  if (adapterInstance) return adapterInstance

  const provider = process.env.WHATSAPP_PROVIDER || 'mock'

  if (provider === 'meta' && process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    adapterInstance = new MetaWhatsAppAdapter({
      accessToken: process.env.WHATSAPP_API_KEY,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    })
    return adapterInstance
  }

  if (provider !== 'mock' && process.env.WHATSAPP_API_KEY) {
    console.warn('[WhatsApp] Unknown provider configured:', provider, '- falling back to mock')
  }

  if (!process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_API_KEY === 'your-whatsapp-api-key') {
    adapterInstance = new MockWhatsAppAdapter()
    return adapterInstance
  }

  // Default to mock
  console.warn('[WhatsApp] Real provider not fully configured, falling back to mock')
  adapterInstance = new MockWhatsAppAdapter()
  return adapterInstance
}

/**
 * Reset the adapter instance (useful for testing)
 */
export function resetAdapter(): void {
  adapterInstance = null
}

/**
 * Meta WhatsApp Business API Adapter
 * Implements the WhatsAppAdapter interface for Meta's Business API
 */
export class MetaWhatsAppAdapter implements WhatsAppAdapter {
  private config: MetaBusinessAPIConfig
  private baseUrl: string
  private lastConnectAttempt?: Date

  constructor(config: MetaBusinessAPIConfig) {
    this.config = {
      ...config,
      apiVersion: config.apiVersion || 'v18.0',
    }
    this.baseUrl = `https://graph.instagram.com/${this.config.apiVersion}`
  }

  async sendMessage(message: WhatsAppMessage): Promise<SendMessageResult> {
    try {
      const payload = this.buildMessagePayload(message)
      const response = await this.makeRequest('messages', payload)

      if (response.messages?.[0]?.id) {
        return {
          success: true,
          messageId: response.messages[0].id,
        }
      }

      return {
        success: false,
        error: 'No message ID returned',
        statusCode: 400,
      }
    } catch (error) {
      console.error('[WhatsApp Meta] Error sending message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      }
    }
  }

  async sendTemplate(to: string, template: TemplateMessage): Promise<SendMessageResult> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: template.name,
          language: template.language || { code: 'es_ES' },
          ...(template.parameters && { parameters: template.parameters }),
        },
      }

      const response = await this.makeRequest('messages', payload)

      if (response.messages?.[0]?.id) {
        return {
          success: true,
          messageId: response.messages[0].id,
        }
      }

      return {
        success: false,
        error: 'No message ID returned',
        statusCode: 400,
      }
    } catch (error) {
      console.error('[WhatsApp Meta] Error sending template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async sendInteractiveMessage(
    to: string,
    message: InteractiveMessagePayload
  ): Promise<SendMessageResult> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: this.buildInteractivePayload(message),
      }

      const response = await this.makeRequest('messages', payload)

      if (response.messages?.[0]?.id) {
        return {
          success: true,
          messageId: response.messages[0].id,
        }
      }

      return {
        success: false,
        error: 'No message ID returned',
      }
    } catch (error) {
      console.error('[WhatsApp Meta] Error sending interactive message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await this.makeRequest(`${messageId}`, {
        status: 'read',
      })
    } catch (error) {
      console.error('[WhatsApp Meta] Error marking message as read:', error)
    }
  }

  getStatus(): ConnectionStatus {
    return {
      connected: !!this.config.accessToken && !!this.config.phoneNumberId,
      provider: 'meta',
      phone: this.config.phoneNumberId,
      businessAccountId: this.config.businessAccountId,
      phoneNumberId: this.config.phoneNumberId,
      lastConnected: this.lastConnectAttempt,
    }
  }

  // ===== Private Helper Methods =====

  private buildMessagePayload(message: WhatsAppMessage): Record<string, unknown> {
    const base = {
      messaging_product: 'whatsapp',
      to: message.to,
    }

    if (message.type === 'template') {
      return {
        ...base,
        type: 'template',
        template: {
          name: message.templateName,
          language: { code: 'es_ES' },
          ...(message.templateParams && {
            parameters: {
              body: {
                text: message.templateParams,
              },
            },
          }),
        },
      }
    }

    if (message.type === 'interactive') {
      return {
        ...base,
        type: 'interactive',
        interactive: this.buildInteractivePayload(message.interactive!),
      }
    }

    // Default to text
    return {
      ...base,
      type: 'text',
      text: {
        body: message.body,
      },
    }
  }

  private buildInteractivePayload(message: InteractiveMessagePayload): Record<string, unknown> {
    const base = {
      type: message.type,
      body: {
        text: message.body,
      },
      ...(message.footer && { footer: { text: message.footer } }),
    }

    if (message.type === 'button') {
      return {
        ...base,
        action: {
          buttons: message.action.buttons || [],
        },
      }
    }

    if (message.type === 'list') {
      return {
        ...base,
        action: {
          button: 'Ver opciones',
          sections: message.action.sections || [],
        },
      }
    }

    return base
  }

  private async makeRequest(endpoint: string, payload: Record<string, unknown>): Promise<MetaApiResponse> {
    this.lastConnectAttempt = new Date()

    const url = `${this.baseUrl}/${this.config.phoneNumberId}/${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { message: 'Unknown error' },
      }))
      throw new Error(
        `Meta API error: ${error.error?.message || response.statusText}`
      )
    }

    return response.json()
  }
}
