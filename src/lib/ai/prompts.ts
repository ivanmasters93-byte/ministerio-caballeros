export const SYSTEM_PROMPT = `Eres el Asistente Ministerial de GEDEONES - Ministerio de Caballeros. Tu nombre es "Asistente Ministerial".

REGLAS FUNDAMENTALES:
1. SOLO responde con información real que se te proporcione en el contexto. NUNCA inventes datos.
2. Si no tienes información sobre algo, di claramente: "No tengo información sobre eso en el sistema."
3. Para asuntos pastorales sensibles (crisis personales, conflictos, peticiones privadas), SIEMPRE escala al liderazgo: "Este asunto requiere atención pastoral directa. Te recomiendo contactar al líder de tu red."
4. Responde en español, de manera cálida pero profesional.
5. Sé conciso y directo. Mantén respuestas bajo 200 palabras a menos que sea necesario profundizar.

ESTRUCTURA DEL MINISTERIO:
- Líder General: Javier Rodríguez
- 3 Redes de Hermanos:
  * Red Menor (18-30 años) - Enfoque en crecimiento espiritual joven
  * Red Media (31-40 años) - Madurez y liderazgo
  * Red Mayor (41-75 años) - Sabiduría y mentoría
- Cada red tiene múltiples líderes asignados
- Estructura de roles: Líder General > Líderes de Red > Secretarios > Asistentes > Hermanos

TEMAS QUE PUEDES ABORDAR:
✓ Eventos, reuniones, actividades (fechas, horas, links)
✓ Anuncios y recordatorios
✓ Información sobre redes y liderazgo
✓ Recursos disponibles, documentos, devocionales
✓ Información general sobre hermanos (número, redes)
✓ Próximos contactos y seguimientos (si tienes acceso)
✓ Finanzas generales (metas, situación general, NO datos personales)

TEMAS SENSIBLES - SIEMPRE ESCALA:
✗ Asuntos personales/íntimos de hermanos
✗ Crisis emocionales, suicidio, drogas, problemas legales
✗ Conflictos interpersonales que requieren consejería
✗ Datos financieros personales de hermanos
✗ Informacion privada o médica
✗ Decisiones pastorales que requieren liderazgo

FORMATO DE RESPUESTAS:
- Para eventos: Incluye título, fecha, hora, tipo, red (si aplica), y links (Zoom/YouTube)
- Para anuncios: Incluye prioridad, contenido resumido
- Para finanzas: Incluye contexto de meta y progreso general
- Para seguimientos: Incluye tipo, estado, próximo contacto si es público

INSTRUCCIONES ESPECIALES:
- Si pregunta por eventos próximos, ordena por fecha y incluye máximo 5
- Si pregunta por anuncios, prioriza por severidad (URGENTE > ALTA > NORMAL > BAJA)
- Si pregunta por finanzas, NO incluyas datos de hermanos individuales
- Si pregunta por hermanos con seguimiento, ordena por fecha de próximo contacto
- Si la pregunta es vaga, pide aclaraciones
- Si necesita datos que no tienes acceso, explica la limitación

TU OBJETIVO:
Ser un asistente útil, informativo y pastoral que ayude al Ministerio a comunicarse mejor y mantener a la comunidad informada y conectada.`

export function buildUserPrompt(
  message: string,
  context: {
    events?: Array<Record<string, unknown>>
    announcements?: Array<Record<string, unknown>>
    hermanos?: Array<Record<string, unknown>>
    redes?: Array<Record<string, unknown>>
    seguimientos?: Array<Record<string, unknown>>
    finanzas?: Record<string, unknown>
    documentos?: Array<Record<string, unknown>>
  }
): string {
  let contextStr = ''

  type EventItem = { titulo?: unknown; fecha?: unknown; hora?: unknown; tipo?: unknown; red?: { nombre?: unknown }; descripcion?: unknown; zoomLink?: unknown; youtubeLink?: unknown }
  type AnuncioItem = { prioridad?: unknown; titulo?: unknown; contenido?: unknown; tipo?: unknown; expiraEn?: unknown }
  type RedItem = { nombre?: unknown; _count?: { miembros?: unknown } }
  type SeguimientoItem = { hermano?: { user?: { name?: unknown } }; tipo?: unknown; proximoContacto?: unknown; estado?: unknown }
  type FinanzasItem = { metaTotal?: number; recaudado?: number; porcentaje?: number }
  type DocItem = { titulo?: unknown; tipo?: unknown; descripcion?: unknown }

  // Events
  if (context.events && context.events.length > 0) {
    contextStr += '\n\n==== EVENTOS PRÓXIMOS ====\n'
    context.events.slice(0, 5).forEach((e) => {
      const ev = e as EventItem
      contextStr += `• ${ev.titulo}\n`
      contextStr += `  Fecha: ${new Date(ev.fecha as string).toLocaleDateString('es-ES')} ${ev.hora || ''}\n`
      contextStr += `  Tipo: ${ev.tipo}\n`
      if (ev.red) contextStr += `  Red: ${ev.red.nombre}\n`
      if (ev.descripcion) contextStr += `  Descripción: ${ev.descripcion}\n`
      if (ev.zoomLink) contextStr += `  Zoom: ${ev.zoomLink}\n`
      if (ev.youtubeLink) contextStr += `  YouTube: ${ev.youtubeLink}\n`
    })
  }

  // Announcements
  if (context.announcements && context.announcements.length > 0) {
    contextStr += '\n\n==== ANUNCIOS ACTIVOS ====\n'
    context.announcements.slice(0, 5).forEach((a) => {
      const ann = a as AnuncioItem
      contextStr += `[${ann.prioridad}] ${ann.titulo}\n`
      contextStr += `  ${ann.contenido}\n`
      if (ann.tipo) contextStr += `  Tipo: ${ann.tipo}\n`
      if (ann.expiraEn)
        contextStr += `  Expira: ${new Date(ann.expiraEn as string).toLocaleDateString('es-ES')}\n`
    })
  }

  // Networks summary
  if (context.redes && context.redes.length > 0) {
    contextStr += '\n\n==== RESUMEN DE REDES ====\n'
    context.redes.forEach((r) => {
      const red = r as RedItem
      contextStr += `• ${red.nombre}: ${red._count?.miembros || 0} miembros\n`
    })
  }

  // Hermanos count
  if (context.hermanos && context.hermanos.length > 0) {
    contextStr += `\n==== INFORMACIÓN DE HERMANOS ====\n`
    contextStr += `Total de hermanos activos: ${context.hermanos.length}\n`
  }

  // Follow-ups/Seguimientos
  if (context.seguimientos && context.seguimientos.length > 0) {
    contextStr += '\n\n==== SEGUIMIENTOS PENDIENTES ====\n'
    context.seguimientos.slice(0, 5).forEach((s) => {
      const seg = s as SeguimientoItem
      const hermanoName = seg.hermano?.user?.name || 'Hermano'
      contextStr += `• ${hermanoName} - ${seg.tipo}\n`
      contextStr += `  Próximo contacto: ${seg.proximoContacto ? new Date(seg.proximoContacto as string).toLocaleDateString('es-ES') : 'No programado'}\n`
      contextStr += `  Estado: ${seg.estado}\n`
    })
  }

  // Finances summary
  if (context.finanzas) {
    const fin = context.finanzas as FinanzasItem
    contextStr += '\n\n==== RESUMEN FINANCIERO ====\n'
    contextStr += `Meta total: $${fin.metaTotal?.toFixed(2) || '0.00'}\n`
    contextStr += `Recaudado: $${fin.recaudado?.toFixed(2) || '0.00'}\n`
    contextStr += `Progreso: ${fin.porcentaje?.toFixed(1) || '0'}%\n`
  }

  // Documents
  if (context.documentos && context.documentos.length > 0) {
    contextStr += '\n\n==== DOCUMENTOS DISPONIBLES ====\n'
    context.documentos.slice(0, 5).forEach((d) => {
      const doc = d as DocItem
      contextStr += `• ${doc.titulo} (${doc.tipo})\n`
      if (doc.descripcion) contextStr += `  ${doc.descripcion}\n`
    })
  }

  return `${contextStr}\n\n==== PREGUNTA DEL USUARIO ====\n${message}`
}
