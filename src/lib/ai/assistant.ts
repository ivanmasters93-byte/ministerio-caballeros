import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts'
import { prisma } from '@/lib/prisma'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface AssistantContext {
  events?: Array<Record<string, unknown>>
  announcements?: Array<Record<string, unknown>>
  hermanos?: Array<Record<string, unknown>>
  redes?: Array<Record<string, unknown>>
  seguimientos?: Array<Record<string, unknown>>
  peticiones?: Array<Record<string, unknown>>
  finanzas?: Record<string, unknown>
  documentos?: Array<Record<string, unknown>>
}

/**
 * Get comprehensive context from the database for the AI assistant
 */
export async function buildAssistantContext(): Promise<AssistantContext> {
  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  try {
    const [
      events,
      announcements,
      redes,
      hermanos,
      seguimientos,
      documentos,
      finanzas,
    ] = await Promise.all([
      // Próximos eventos (30 días)
      prisma.evento.findMany({
        where: { fecha: { gte: now, lte: in30Days } },
        include: { red: true },
        orderBy: { fecha: 'asc' },
        take: 10,
      }),

      // Anuncios activos
      prisma.anuncio.findMany({
        where: { activo: true },
        include: { red: true },
        orderBy: { prioridad: 'desc', createdAt: 'desc' },
        take: 10,
      }),

      // Redes with member counts
      prisma.red.findMany({
        include: {
          _count: { select: { miembros: true } },
          lideres: { select: { id: true, name: true } },
        },
      }),

      // Hermanos activos
      prisma.hermano.findMany({
        where: { estado: 'ACTIVO' },
        include: { user: true },
        take: 50,
      }),

      // Seguimientos pendientes (próximo contacto dentro de 7 días)
      prisma.seguimiento.findMany({
        where: {
          estado: { in: ['ABIERTO', 'EN_PROCESO'] },
          proximoContacto: { gte: now, lte: in7Days },
        },
        include: { hermano: { include: { user: true } } },
        orderBy: { proximoContacto: 'asc' },
        take: 10,
      }),

      // Documentos
      prisma.documento.findMany({
        where: { activo: true },
        orderBy: { publicadoEn: 'desc' },
        take: 10,
      }),

      // Finanzas summary
      prisma.metaFinanciera.findFirst({
        where: { activa: true },
        orderBy: { createdAt: 'desc' },
      }).then((meta) => {
        if (!meta) return { metaTotal: 0, recaudado: 0, porcentaje: 0 }
        return {
          metaTotal: meta.montoMeta,
          recaudado: meta.montoActual,
          porcentaje: (meta.montoActual / meta.montoMeta) * 100 || 0,
        }
      }),
    ])

    return {
      events,
      announcements,
      redes,
      hermanos,
      seguimientos,
      documentos,
      finanzas,
    }
  } catch (error) {
    console.error('Error building assistant context:', error)
    return {}
  }
}

export async function getAssistantResponse(
  message: string,
  context?: AssistantContext
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key') {
    // Use mock response if no API key
    return mockResponse(message, context || {})
  }

  try {
    // Build context if not provided
    const finalContext = context || (await buildAssistantContext())

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(message, finalContext),
        },
      ],
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return content.text
    }
    return 'No pude generar una respuesta en este momento.'
  } catch (error) {
    console.error('AI Assistant error:', error)
    return mockResponse(message, context || {})
  }
}

/**
 * Process a WhatsApp message and generate a response
 */
export async function processWhatsAppMessage(message: string): Promise<string> {
  const context = await buildAssistantContext()
  return getAssistantResponse(message, context)
}

function mockResponse(message: string, context: AssistantContext): string {
  const lowerMsg = message.toLowerCase()

  type EventRecord = { titulo?: unknown; fecha?: unknown; hora?: unknown; zoomLink?: unknown }
  type RedRecord = { nombre?: unknown; _count?: { miembros?: unknown } }
  type AnuncioRecord = { prioridad?: unknown; titulo?: unknown; contenido?: string }
  type DocRecord = { titulo?: unknown; tipo?: unknown }

  // Events/Meetings
  if (lowerMsg.includes('evento') || lowerMsg.includes('reunión') || lowerMsg.includes('actividad') || lowerMsg.includes('próximo')) {
    if (context.events && context.events.length > 0) {
      const eventList = context.events
        .slice(0, 3)
        .map((e) => {
          const ev = e as EventRecord
          return `• ${ev.titulo} - ${new Date(ev.fecha as string).toLocaleDateString('es-ES')} ${ev.hora || ''}${ev.zoomLink ? ' (Zoom disponible)' : ''}`
        })
        .join('\n')
      return `Los próximos eventos son:\n${eventList}\n\nPara más detalles, consulta la sección de Agenda.`
    }
    return 'No hay eventos próximos registrados en el sistema.'
  }

  // Hermanos/Members
  if (lowerMsg.includes('hermano') || lowerMsg.includes('miembro') || lowerMsg.includes('cuántos')) {
    const total = context.hermanos?.length || 0
    const byNetwork = context.redes?.map((r) => {
      const red = r as RedRecord
      return `${red.nombre}: ${red._count?.miembros || 0}`
    }).join(', ')
    return `Actualmente hay ${total} hermanos activos en el sistema. Por redes: ${byNetwork || 'sin información'}. Puedes consultar la lista completa en la sección de Hermanos.`
  }

  // Announcements
  if (lowerMsg.includes('anuncio') || lowerMsg.includes('noticia')) {
    if (context.announcements && context.announcements.length > 0) {
      const annList = context.announcements
        .slice(0, 2)
        .map((a) => {
          const ann = a as AnuncioRecord
          return `[${ann.prioridad}] ${ann.titulo}: ${ann.contenido?.substring(0, 100) || ''}...`
        })
        .join('\n\n')
      return `Anuncios activos:\n\n${annList}`
    }
    return 'No hay anuncios activos en este momento.'
  }

  // Zoom/Links
  if (lowerMsg.includes('zoom') || lowerMsg.includes('enlace') || lowerMsg.includes('link')) {
    const eventsWithZoom = context.events?.filter((e) => (e as EventRecord).zoomLink) || []
    if (eventsWithZoom.length > 0) {
      return `Eventos con enlace de Zoom:\n${eventsWithZoom.map((e) => {
        const ev = e as EventRecord
        return `• ${ev.titulo}: ${ev.zoomLink}`
      }).join('\n')}`
    }
    return 'No hay enlaces de Zoom disponibles para eventos próximos.'
  }

  // Networks
  if (lowerMsg.includes('red') || lowerMsg.includes('grupos')) {
    if (context.redes && context.redes.length > 0) {
      const redList = context.redes
        .map((r) => {
          const red = r as RedRecord
          return `• ${red.nombre}: ${red._count?.miembros || 0} miembros`
        })
        .join('\n')
      return `Nuestras redes:\n${redList}`
    }
    return 'No hay información de redes disponible.'
  }

  // Documents/Resources
  if (lowerMsg.includes('documento') || lowerMsg.includes('recurso') || lowerMsg.includes('material') || lowerMsg.includes('devocional')) {
    if (context.documentos && context.documentos.length > 0) {
      const docList = context.documentos
        .slice(0, 3)
        .map((d) => {
          const doc = d as DocRecord
          return `• ${doc.titulo} (${doc.tipo})`
        })
        .join('\n')
      return `Recursos disponibles:\n${docList}\n\nPara más documentos, visita la sección de Recursos.`
    }
    return 'No hay documentos disponibles en este momento.'
  }

  // Default greeting
  return 'Hola, soy el Asistente Ministerial. Puedo ayudarte con información sobre eventos, reuniones, anuncios, hermanos y recursos del ministerio. ¿En qué puedo servirte?'
}
