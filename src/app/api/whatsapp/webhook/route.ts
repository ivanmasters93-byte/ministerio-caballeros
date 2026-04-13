import { NextRequest, NextResponse } from 'next/server'
import { getWhatsAppAdapter } from '@/lib/whatsapp/adapter'
import { processWhatsAppMessage } from '@/lib/ai/assistant'
import { prisma } from '@/lib/prisma'
import { WhatsAppWebhookPayload, IncomingMessage, MessageStatus } from '@/lib/whatsapp/types'

/**
 * GET /api/whatsapp/webhook
 * Verify webhook subscription from Meta
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Subscription verified')
    return new Response(challenge, { status: 200 })
  }

  console.warn('[WhatsApp Webhook] Verification failed')
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/**
 * POST /api/whatsapp/webhook
 * Process incoming messages and status updates from Meta
 */
export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppWebhookPayload = await request.json()

    // Handle different types of changes
    const entry = body.entry?.[0]
    if (!entry) {
      console.warn('[WhatsApp Webhook] No entry in payload')
      return NextResponse.json({ status: 'ok' })
    }

    const changes = entry.changes || []

    for (const change of changes) {
      if (change.field === 'messages') {
        await handleMessages(change.value.messages || [])
      } else if (change.field === 'message_status') {
        await handleMessageStatus(change.value.statuses || [])
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing webhook:', error)
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  }
}

/**
 * Handle incoming messages
 */
async function handleMessages(messages: IncomingMessage[]): Promise<void> {
  const adapter = getWhatsAppAdapter()

  for (const msg of messages) {
    console.log(`[WhatsApp] Incoming message from ${msg.from}: ${msg.type}`)

    // Store incoming message in database
    try {
      await prisma.mensajeWhatsApp.create({
        data: {
          telefono: msg.from,
          mensaje: msg.text?.body || `[${msg.type}]`,
          direccion: 'entrante',
          tipo: msg.type,
          messageId: msg.id,
          estado: 'recibido',
        },
      })
    } catch (error) {
      console.error('[WhatsApp] Error storing incoming message:', error)
    }

    // Process different message types
    if (msg.type === 'text' && msg.text?.body) {
      await handleTextMessage(msg.from, msg.text.body)
    } else if (msg.type === 'interactive' && msg.interactive) {
      await handleInteractiveMessage(msg.from, msg.interactive)
    } else if (msg.type === 'image' || msg.type === 'video' || msg.type === 'document') {
      await handleMediaMessage(msg.from, msg.type)
    } else if (msg.type === 'location' && msg.location) {
      await handleLocationMessage(msg.from, msg.location)
    }

    // Mark as read if possible
    if (msg.id && adapter.markMessageAsRead) {
      await adapter.markMessageAsRead(msg.id).catch((err) => {
        console.error('[WhatsApp] Error marking message as read:', err)
      })
    }
  }
}

/**
 * Handle text messages - route to AI assistant
 */
async function handleTextMessage(from: string, body: string): Promise<void> {
  const adapter = getWhatsAppAdapter()

  try {
    // Process message with AI assistant
    const response = await processWhatsAppMessage(body)

    // Send response back
    const result = await adapter.sendMessage({
      to: from,
      body: response,
      type: 'text',
    })

    // Store outgoing message
    if (result.success) {
      await prisma.mensajeWhatsApp.create({
        data: {
          telefono: from,
          mensaje: response,
          direccion: 'saliente',
          tipo: 'texto',
          messageId: result.messageId,
          estado: 'enviado',
        },
      })
    }

    console.log(`[WhatsApp] Response sent to ${from}:`, result)
  } catch (error) {
    console.error('[WhatsApp] Error processing text message:', error)

    // Send error response
    try {
      await adapter.sendMessage({
        to: from,
        body: 'Lo siento, ocurrió un error procesando tu mensaje. Por favor intenta nuevamente.',
        type: 'text',
      })
    } catch (sendError) {
      console.error('[WhatsApp] Error sending error message:', sendError)
    }
  }
}

/**
 * Handle interactive messages (buttons, list replies)
 */
async function handleInteractiveMessage(from: string, interactive: { button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } }): Promise<void> {
  const adapter = getWhatsAppAdapter()

  try {
    let responseText = ''

    if (interactive.button_reply) {
      const { id, title } = interactive.button_reply
      responseText = `Recibimos tu selección: "${title}". Gracias por responder.`
      console.log(`[WhatsApp] Button reply from ${from}: ${id} - ${title}`)
    } else if (interactive.list_reply) {
      const { id, title } = interactive.list_reply
      responseText = `Recibimos tu selección: "${title}". Gracias por responder.`
      console.log(`[WhatsApp] List reply from ${from}: ${id} - ${title}`)
    }

    if (responseText) {
      await adapter.sendMessage({
        to: from,
        body: responseText,
        type: 'text',
      })
    }
  } catch (error) {
    console.error('[WhatsApp] Error handling interactive message:', error)
  }
}

/**
 * Handle media messages
 */
async function handleMediaMessage(from: string, mediaType: string): Promise<void> {
  const adapter = getWhatsAppAdapter()

  const responseMap: Record<string, string> = {
    image: 'Gracias por enviar una imagen. En este momento no procesamos imágenes, pero tu mensaje fue registrado.',
    video: 'Gracias por enviar un video. En este momento no procesamos videos, pero tu mensaje fue registrado.',
    document: 'Gracias por enviar un documento. Fue registrado en el sistema.',
  }

  const response = responseMap[mediaType] || 'Gracias por tu mensaje.'

  try {
    await adapter.sendMessage({
      to: from,
      body: response,
      type: 'text',
    })
  } catch (error) {
    console.error('[WhatsApp] Error responding to media message:', error)
  }
}

/**
 * Handle location messages
 */
async function handleLocationMessage(from: string, location: { latitude: number; longitude: number; name?: string; address?: string }): Promise<void> {
  const adapter = getWhatsAppAdapter()

  try {
    const response =
      'Recibimos tu ubicación. Gracias por compartirla. Los líderes pueden contactarte al respecto si es necesario.'

    await adapter.sendMessage({
      to: from,
      body: response,
      type: 'text',
    })

    console.log(
      `[WhatsApp] Location received from ${from}:`,
      location.latitude,
      location.longitude
    )
  } catch (error) {
    console.error('[WhatsApp] Error responding to location message:', error)
  }
}

/**
 * Handle message status updates
 */
async function handleMessageStatus(statuses: MessageStatus[]): Promise<void> {
  for (const status of statuses) {
    console.log(`[WhatsApp] Message ${status.id} status: ${status.status}`)

    try {
      await prisma.mensajeWhatsApp.updateMany({
        where: { messageId: status.id },
        data: {
          estado: status.status,
        },
      })
    } catch (error) {
      console.error('[WhatsApp] Error updating message status:', error)
    }
  }
}
