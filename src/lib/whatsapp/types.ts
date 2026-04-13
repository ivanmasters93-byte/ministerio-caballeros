// ===== Basic Message Types =====

export interface WhatsAppMessage {
  to: string
  body: string
  type: 'text' | 'template' | 'interactive'
  templateName?: string
  templateParams?: string[]
  interactive?: InteractiveMessagePayload
}

export interface InteractiveMessagePayload {
  type: 'button' | 'list'
  body: string
  footer?: string
  action: {
    buttons?: Array<{
      type: 'reply'
      reply: {
        id: string
        title: string
      }
    }>
    sections?: Array<{
      title?: string
      rows: Array<{
        id: string
        title: string
        description?: string
      }>
    }>
  }
}

export interface TemplateMessage {
  name: string
  language?: {
    code: string
  }
  parameters?: {
    body?: {
      text?: string[]
    }
    header?: {
      text?: string
    }
    footer?: {
      text?: string
    }
  }
}

// ===== Webhook Types =====

export interface WhatsAppWebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<WebhookChange>
  }>
}

export interface WebhookChange {
  value: WebhookValue
  field: string
}

export interface WebhookValue {
  messages?: Array<IncomingMessage>
  statuses?: Array<MessageStatus>
  contacts?: Array<Contact>
  errors?: Array<WebhookError>
}

export interface IncomingMessage {
  from: string
  id: string
  timestamp: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'interactive' | 'template'
  text?: {
    body: string
  }
  image?: MediaObject
  video?: MediaObject
  audio?: MediaObject
  document?: MediaObject
  location?: LocationObject
  interactive?: InteractiveObject
}

export interface MediaObject {
  id: string
  mime_type?: string
  caption?: string
  link?: string
}

export interface LocationObject {
  latitude: number
  longitude: number
  name?: string
  address?: string
}

export interface InteractiveObject {
  type: 'button_reply' | 'list_reply'
  button_reply?: {
    id: string
    title: string
  }
  list_reply?: {
    id: string
    title: string
    description?: string
  }
}

export interface MessageStatus {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  recipient_id?: string
  errors?: Array<{
    code: number
    title: string
    message: string
  }>
}

export interface Contact {
  profile: {
    name: string
  }
  wa_id: string
}

export interface WebhookError {
  code: number
  title: string
  message: string
  error_data?: {
    details: string
  }
}

// ===== Adapter Interface =====

export interface WhatsAppAdapter {
  sendMessage(message: WhatsAppMessage): Promise<SendMessageResult>
  sendTemplate(to: string, template: TemplateMessage): Promise<SendMessageResult>
  sendInteractiveMessage(
    to: string,
    message: InteractiveMessagePayload
  ): Promise<SendMessageResult>
  getStatus(): ConnectionStatus
  markMessageAsRead?(messageId: string): Promise<void>
}

export interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
  statusCode?: number
}

export interface ConnectionStatus {
  connected: boolean
  provider: string
  phone?: string
  businessAccountId?: string
  phoneNumberId?: string
  lastConnected?: Date
}

// ===== Conversation Types =====

export interface ConversationMessage {
  id: string
  phone: string
  direction: 'incoming' | 'outgoing'
  type: string
  body?: string
  status?: string
  messageId?: string
  timestamp: Date
  userId?: string
  metadata?: Record<string, unknown>
}

export interface Conversation {
  id?: string
  phone: string
  lastMessage?: ConversationMessage
  messageCount: number
  firstMessageAt?: Date
  lastMessageAt?: Date
  status: 'active' | 'closed' | 'archived'
  userId?: string
  messages?: ConversationMessage[]
}

// ===== Meta Business API Types =====

export interface MetaBusinessAPIConfig {
  accessToken: string
  businessAccountId: string
  phoneNumberId: string
  apiVersion?: string
}

export interface MetaPhoneNumberInfo {
  verified_name: string
  display_phone_number: string
  quality_rating?: string
}
