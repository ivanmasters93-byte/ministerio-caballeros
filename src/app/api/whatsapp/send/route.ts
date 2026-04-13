import { NextRequest, NextResponse } from 'next/server'
import { getWhatsAppAdapter } from '@/lib/whatsapp/adapter'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

// Validation schema
const SendMessageSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  message: z.string().min(1).max(4096),
  type: z.enum(['text', 'template', 'interactive']).default('text'),
  templateName: z.string().optional(),
  templateParams: z.array(z.string()).optional(),
})

type SendMessageRequest = z.infer<typeof SendMessageSchema>

/**
 * POST /api/whatsapp/send
 * Send a message to a phone number
 *
 * Body:
 * {
 *   "to": "+34123456789",
 *   "message": "Hello, world!",
 *   "type": "text" // optional: "text", "template", "interactive"
 * }
 *
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()

    let validatedData: SendMessageRequest
    try {
      validatedData = SendMessageSchema.parse(body)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validación fallida',
          details: error instanceof z.ZodError ? error.issues : [],
        },
        { status: 400 }
      )
    }

    // Get adapter
    const adapter = getWhatsAppAdapter()

    // Send message based on type
    let result
    if (validatedData.type === 'template') {
      result = await adapter.sendTemplate(validatedData.to, {
        name: validatedData.templateName || 'default',
        parameters: validatedData.templateParams ? {
          body: { text: validatedData.templateParams },
        } : undefined,
      })
    } else {
      result = await adapter.sendMessage({
        to: validatedData.to,
        body: validatedData.message,
        type: validatedData.type || 'text',
      })
    }

    // Log message to database if successful
    if (result.success && result.messageId) {
      try {
        await prisma.mensajeWhatsApp.create({
          data: {
            telefono: validatedData.to,
            mensaje: validatedData.message,
            direccion: 'saliente',
            tipo: validatedData.type || 'texto',
            messageId: result.messageId,
            estado: 'enviado',
            userId: session.user?.id,
          },
        })
      } catch (dbError) {
        console.error('[WhatsApp Send] Error logging message to database:', dbError)
        // Don't fail the request if database logging fails
      }
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        to: validatedData.to,
        message: 'Mensaje enviado correctamente',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Error al enviar mensaje',
          statusCode: result.statusCode,
        },
        { status: result.statusCode || 500 }
      )
    }
  } catch (error) {
    console.error('[WhatsApp Send] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/whatsapp/send
 * Return usage documentation
 */
export async function GET() {
  return NextResponse.json({
    message: 'POST a este endpoint con un JSON:',
    example: {
      to: '+34123456789',
      message: 'Hola, este es un mensaje de prueba',
      type: 'text',
    },
    description: {
      to: 'Número telefónico en formato internacional (+país código)',
      message: 'Contenido del mensaje',
      type: 'Tipo de mensaje: text, template, o interactive',
    },
  })
}
