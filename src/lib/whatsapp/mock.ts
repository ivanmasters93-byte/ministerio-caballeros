import {
  WhatsAppAdapter,
  WhatsAppMessage,
  SendMessageResult,
  ConnectionStatus,
  Conversation,
  ConversationMessage,
  TemplateMessage,
  InteractiveMessagePayload,
} from './types'

export class MockWhatsAppAdapter implements WhatsAppAdapter {
  private conversations: Map<string, Conversation> = new Map()
  private messageLog: ConversationMessage[] = []
  private messageIdCounter = 0

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData(): void {
    // Initialize with some mock conversations for testing
    this.conversations.set('+1234567890', {
      phone: '+1234567890',
      status: 'active',
      messageCount: 0,
      firstMessageAt: new Date(),
      lastMessageAt: new Date(),
    })
  }

  async sendMessage(message: WhatsAppMessage): Promise<SendMessageResult> {
    const messageId = this.generateMessageId()

    try {
      const conversationMessage: ConversationMessage = {
        id: messageId,
        phone: message.to,
        direction: 'outgoing',
        type: message.type,
        body: message.body,
        status: 'sent',
        messageId: messageId,
        timestamp: new Date(),
        metadata: {
          templateName: message.templateName,
          templateParams: message.templateParams,
        },
      }

      this.recordMessage(message.to, conversationMessage)

      console.log(
        '[WhatsApp MOCK] Message sent:',
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            to: message.to,
            message: message.body.substring(0, 100),
            messageId,
            type: message.type,
          },
          null,
          2
        )
      )

      return {
        success: true,
        messageId: messageId,
      }
    } catch (error) {
      console.error('[WhatsApp MOCK] Error sending message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      }
    }
  }

  async sendTemplate(to: string, template: TemplateMessage): Promise<SendMessageResult> {
    const messageId = this.generateMessageId()

    try {
      const body = template.parameters?.body?.text?.join(' ') || template.name

      const conversationMessage: ConversationMessage = {
        id: messageId,
        phone: to,
        direction: 'outgoing',
        type: 'template',
        body: `[Template: ${template.name}] ${body}`,
        status: 'sent',
        messageId: messageId,
        timestamp: new Date(),
        metadata: {
          templateName: template.name,
          templateLanguage: template.language?.code,
        },
      }

      this.recordMessage(to, conversationMessage)

      console.log('[WhatsApp MOCK] Template message sent:', {
        to,
        template: template.name,
        messageId,
      })

      return {
        success: true,
        messageId: messageId,
      }
    } catch (error) {
      console.error('[WhatsApp MOCK] Error sending template:', error)
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
    const messageId = this.generateMessageId()

    try {
      const conversationMessage: ConversationMessage = {
        id: messageId,
        phone: to,
        direction: 'outgoing',
        type: 'interactive',
        body: message.body,
        status: 'sent',
        messageId: messageId,
        timestamp: new Date(),
        metadata: {
          interactiveType: message.type,
          buttons: message.action.buttons?.length || 0,
          sections: message.action.sections?.length || 0,
        },
      }

      this.recordMessage(to, conversationMessage)

      console.log('[WhatsApp MOCK] Interactive message sent:', {
        to,
        type: message.type,
        messageId,
      })

      return {
        success: true,
        messageId: messageId,
      }
    } catch (error) {
      console.error('[WhatsApp MOCK] Error sending interactive message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  getStatus(): ConnectionStatus {
    return {
      connected: false,
      provider: 'mock',
      phone: undefined,
      businessAccountId: undefined,
      phoneNumberId: undefined,
      lastConnected: new Date(),
    }
  }

  // ===== Additional Helper Methods =====

  /**
   * Record a message in the conversation history
   */
  private recordMessage(phone: string, message: ConversationMessage): void {
    // Add to message log
    this.messageLog.push(message)

    // Update or create conversation
    const conversation = this.conversations.get(phone) || {
      phone,
      status: 'active',
      messageCount: 0,
      firstMessageAt: new Date(),
    }

    conversation.lastMessageAt = message.timestamp
    conversation.lastMessage = message
    conversation.messageCount += 1

    this.conversations.set(phone, conversation)
  }

  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `mock-${Date.now()}-${++this.messageIdCounter}`
  }

  /**
   * Get message log (for testing/debugging)
   */
  getMessageLog(): ConversationMessage[] {
    return [...this.messageLog]
  }

  /**
   * Get messages from a specific conversation
   */
  getConversationMessages(phone: string): ConversationMessage[] {
    return this.messageLog.filter((m) => m.phone === phone)
  }

  /**
   * Get conversation by phone number
   */
  getConversation(phone: string): Conversation | undefined {
    const conversation = this.conversations.get(phone)
    if (conversation) {
      return {
        ...conversation,
        messages: this.getConversationMessages(phone),
      }
    }
    return undefined
  }

  /**
   * Get recent messages across all conversations
   */
  getRecentMessages(limit: number = 10): ConversationMessage[] {
    return this.messageLog.slice(-limit)
  }

  /**
   * Get all conversations
   */
  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values()).map((conv) => ({
      ...conv,
      messages: this.getConversationMessages(conv.phone),
    }))
  }

  /**
   * Add an incoming message (simulating received message)
   */
  addIncomingMessage(phone: string, body: string, externalMessageId?: string): ConversationMessage {
    const message: ConversationMessage = {
      id: externalMessageId || this.generateMessageId(),
      phone,
      direction: 'incoming',
      type: 'text',
      body,
      status: 'received',
      messageId: externalMessageId,
      timestamp: new Date(),
    }

    this.recordMessage(phone, message)
    return message
  }

  /**
   * Mark conversation as read
   */
  markConversationAsRead(phone: string): void {
    const conversation = this.conversations.get(phone)
    if (conversation) {
      conversation.messages?.forEach((m) => {
        if (m.direction === 'incoming' && m.status !== 'read') {
          m.status = 'read'
        }
      })
    }
  }

  /**
   * Clear conversation history
   */
  clearConversation(phone: string): void {
    this.messageLog = this.messageLog.filter((m) => m.phone !== phone)
    this.conversations.delete(phone)
  }

  /**
   * Clear all data
   */
  reset(): void {
    this.conversations.clear()
    this.messageLog = []
    this.messageIdCounter = 0
    this.initializeMockData()
  }
}
