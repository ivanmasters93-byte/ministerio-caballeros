import { describe, it, expect } from 'vitest'
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/ai/prompts'

describe('SYSTEM_PROMPT', () => {
  it('contains ministry identity', () => {
    expect(SYSTEM_PROMPT).toContain('Ministerio de Caballeros')
    expect(SYSTEM_PROMPT).toContain('Asistente Ministerial')
  })

  it('mentions Javier Rodríguez as leader', () => {
    expect(SYSTEM_PROMPT).toContain('Javier Rodríguez')
  })

  it('defines three networks', () => {
    expect(SYSTEM_PROMPT).toContain('Red Menor')
    expect(SYSTEM_PROMPT).toContain('Red Media')
    expect(SYSTEM_PROMPT).toContain('Red Mayor')
  })

  it('includes escalation rules for sensitive topics', () => {
    expect(SYSTEM_PROMPT).toContain('SIEMPRE ESCALA')
  })

  it('instructs to never invent data', () => {
    expect(SYSTEM_PROMPT).toContain('NUNCA inventes datos')
  })

  it('instructs Spanish language responses', () => {
    expect(SYSTEM_PROMPT).toContain('español')
  })
})

describe('buildUserPrompt', () => {
  it('includes user message', () => {
    const result = buildUserPrompt('¿Cuándo es la próxima reunión?', {})
    expect(result).toContain('¿Cuándo es la próxima reunión?')
    expect(result).toContain('PREGUNTA DEL USUARIO')
  })

  it('includes events context', () => {
    const result = buildUserPrompt('Eventos', {
      events: [{ titulo: 'Culto Especial', fecha: '2026-05-01', tipo: 'CULTO' }],
    })
    expect(result).toContain('EVENTOS PRÓXIMOS')
    expect(result).toContain('Culto Especial')
  })

  it('includes announcements context', () => {
    const result = buildUserPrompt('Anuncios', {
      announcements: [{ prioridad: 'URGENTE', titulo: 'Reunión Urgente', contenido: 'Información importante' }],
    })
    expect(result).toContain('ANUNCIOS ACTIVOS')
    expect(result).toContain('Reunión Urgente')
    expect(result).toContain('URGENTE')
  })

  it('includes redes summary', () => {
    const result = buildUserPrompt('Redes', {
      redes: [
        { nombre: 'Red Menor', _count: { miembros: 40 } },
        { nombre: 'Red Mayor', _count: { miembros: 35 } },
      ],
    })
    expect(result).toContain('RESUMEN DE REDES')
    expect(result).toContain('Red Menor')
    expect(result).toContain('40')
  })

  it('includes hermanos count', () => {
    const result = buildUserPrompt('Hermanos', {
      hermanos: [{}, {}, {}],
    })
    expect(result).toContain('Total de hermanos activos: 3')
  })

  it('includes seguimientos context', () => {
    const result = buildUserPrompt('Seguimientos', {
      seguimientos: [
        {
          hermano: { user: { name: 'Carlos López' } },
          tipo: 'LLAMADA',
          proximoContacto: '2026-04-15',
          estado: 'ABIERTO',
        },
      ],
    })
    expect(result).toContain('SEGUIMIENTOS PENDIENTES')
    expect(result).toContain('Carlos López')
    expect(result).toContain('LLAMADA')
  })

  it('includes finanzas summary', () => {
    const result = buildUserPrompt('Finanzas', {
      finanzas: { metaTotal: 500, recaudado: 250, porcentaje: 50 },
    })
    expect(result).toContain('RESUMEN FINANCIERO')
    expect(result).toContain('500.00')
    expect(result).toContain('250.00')
    expect(result).toContain('50.0%')
  })

  it('includes documentos context', () => {
    const result = buildUserPrompt('Documentos', {
      documentos: [{ titulo: 'Devocional Marzo', tipo: 'DEVOCIONAL', descripcion: 'Reflexiones' }],
    })
    expect(result).toContain('DOCUMENTOS DISPONIBLES')
    expect(result).toContain('Devocional Marzo')
  })

  it('handles empty context gracefully', () => {
    const result = buildUserPrompt('Hola', {})
    expect(result).toContain('Hola')
    expect(result).not.toContain('EVENTOS PRÓXIMOS')
    expect(result).not.toContain('ANUNCIOS ACTIVOS')
  })

  it('limits events to 5', () => {
    const events = Array.from({ length: 10 }, (_, i) => ({
      titulo: `Evento ${i}`,
      fecha: '2026-05-01',
      tipo: 'REUNION',
    }))
    const result = buildUserPrompt('Eventos', { events })
    // Should contain Evento 0 through 4 but not 5+
    expect(result).toContain('Evento 0')
    expect(result).toContain('Evento 4')
    expect(result).not.toContain('Evento 5')
  })
})
