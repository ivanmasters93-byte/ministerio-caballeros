import { describe, it, expect } from 'vitest'
import {
  createHermanoSchema,
  updateHermanoSchema,
  createEventoSchema,
  updateEventoSchema,
  createAnuncioSchema,
  createAsistenciaSchema,
  createSeguimientoSchema,
  createPeticionSchema,
  updatePeticionSchema,
  createVisitaSchema,
  createDocumentoSchema,
  createCuotaSchema,
  updateCuotaSchema,
  createMetaSchema,
  createRedSchema,
  updatePermisoSchema,
  chatMessageSchema,
  paginationSchema,
  validateBody,
} from '@/lib/validations'

// ============================================================
// createHermanoSchema
// ============================================================
describe('createHermanoSchema', () => {
  it('accepts valid data', () => {
    const result = createHermanoSchema.safeParse({
      name: 'Juan García',
      email: 'juan@test.com',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short name', () => {
    const result = createHermanoSchema.safeParse({
      name: 'J',
      email: 'juan@test.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = createHermanoSchema.safeParse({
      name: 'Juan García',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields', () => {
    const result = createHermanoSchema.safeParse({
      name: 'Juan García',
      email: 'juan@test.com',
      phone: '+507 6789 1234',
      redId: 'red-1',
      fechaNacimiento: '1990-01-15',
      direccion: 'Calle 50, Panamá',
      ocupacion: 'Ingeniero',
      estadoCivil: 'Casado',
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================
// updateHermanoSchema
// ============================================================
describe('updateHermanoSchema', () => {
  it('accepts valid estado', () => {
    const result = updateHermanoSchema.safeParse({ estado: 'ACTIVO' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid estado', () => {
    const result = updateHermanoSchema.safeParse({ estado: 'INVALIDO' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid estados', () => {
    const estados = ['ACTIVO', 'PENDIENTE', 'INACTIVO', 'NUEVO', 'REQUIERE_SEGUIMIENTO']
    estados.forEach((estado) => {
      expect(updateHermanoSchema.safeParse({ estado }).success).toBe(true)
    })
  })
})

// ============================================================
// createEventoSchema
// ============================================================
describe('createEventoSchema', () => {
  it('accepts valid evento', () => {
    const result = createEventoSchema.safeParse({
      titulo: 'Reunión Semanal',
      fecha: '2026-04-15',
      tipo: 'REUNION',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short title', () => {
    const result = createEventoSchema.safeParse({
      titulo: 'AB',
      fecha: '2026-04-15',
      tipo: 'REUNION',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid tipo', () => {
    const result = createEventoSchema.safeParse({
      titulo: 'Reunión',
      fecha: '2026-04-15',
      tipo: 'INVALIDO',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid tipos', () => {
    const tipos = ['REUNION', 'CULTO', 'RETIRO', 'CAPACITACION', 'SOCIAL', 'OTRO']
    tipos.forEach((tipo) => {
      expect(
        createEventoSchema.safeParse({
          titulo: 'Evento Test',
          fecha: '2026-04-15',
          tipo,
        }).success
      ).toBe(true)
    })
  })

  it('accepts optional zoom and youtube links', () => {
    const result = createEventoSchema.safeParse({
      titulo: 'Reunión Virtual',
      fecha: '2026-04-15',
      tipo: 'REUNION',
      zoomLink: 'https://zoom.us/j/123456',
      youtubeLink: 'https://youtube.com/watch?v=abc',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for optional url fields', () => {
    const result = createEventoSchema.safeParse({
      titulo: 'Reunión',
      fecha: '2026-04-15',
      tipo: 'REUNION',
      zoomLink: '',
      youtubeLink: '',
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================
// updateEventoSchema
// ============================================================
describe('updateEventoSchema', () => {
  it('accepts partial updates', () => {
    const result = updateEventoSchema.safeParse({ titulo: 'Nuevo título' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = updateEventoSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ============================================================
// createAnuncioSchema
// ============================================================
describe('createAnuncioSchema', () => {
  it('accepts valid anuncio', () => {
    const result = createAnuncioSchema.safeParse({
      titulo: 'Nuevo Anuncio',
      contenido: 'Este es un contenido suficientemente largo para el anuncio',
      tipo: 'GENERAL',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short contenido', () => {
    const result = createAnuncioSchema.safeParse({
      titulo: 'Anuncio',
      contenido: 'Corto',
      tipo: 'GENERAL',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all tipo options', () => {
    const tipos = ['GENERAL', 'URGENTE', 'RECORDATORIO', 'EVENTO']
    tipos.forEach((tipo) => {
      expect(
        createAnuncioSchema.safeParse({
          titulo: 'Test Anuncio',
          contenido: 'Contenido suficientemente largo aquí',
          tipo,
        }).success
      ).toBe(true)
    })
  })
})

// ============================================================
// createAsistenciaSchema
// ============================================================
describe('createAsistenciaSchema', () => {
  it('accepts valid asistencia', () => {
    const result = createAsistenciaSchema.safeParse({
      eventoId: 'evt-1',
      redId: 'red-1',
      fecha: '2026-04-12',
      detalles: [{ hermanoId: 'h-1', presente: true }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty detalles array', () => {
    const result = createAsistenciaSchema.safeParse({
      eventoId: 'evt-1',
      redId: 'red-1',
      fecha: '2026-04-12',
      detalles: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing eventoId', () => {
    const result = createAsistenciaSchema.safeParse({
      redId: 'red-1',
      fecha: '2026-04-12',
      detalles: [{ hermanoId: 'h-1', presente: true }],
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================
// createSeguimientoSchema
// ============================================================
describe('createSeguimientoSchema', () => {
  it('accepts valid seguimiento', () => {
    const result = createSeguimientoSchema.safeParse({
      hermanoId: 'h-1',
      tipo: 'LLAMADA',
      descripcion: 'Llamada de seguimiento pastoral',
      responsableId: 'user-1',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid tipo', () => {
    const result = createSeguimientoSchema.safeParse({
      hermanoId: 'h-1',
      tipo: 'INVALIDO',
      descripcion: 'Seguimiento',
      responsableId: 'user-1',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid tipos', () => {
    const tipos = ['LLAMADA', 'VISITA', 'NOTA', 'ALERTA']
    tipos.forEach((tipo) => {
      expect(
        createSeguimientoSchema.safeParse({
          hermanoId: 'h-1',
          tipo,
          descripcion: 'Descripción válida',
          responsableId: 'user-1',
        }).success
      ).toBe(true)
    })
  })
})

// ============================================================
// createPeticionSchema / updatePeticionSchema
// ============================================================
describe('createPeticionSchema', () => {
  it('accepts valid peticion', () => {
    const result = createPeticionSchema.safeParse({
      hermanoId: 'h-1',
      descripcion: 'Petición de oración por salud',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short descripcion', () => {
    const result = createPeticionSchema.safeParse({
      hermanoId: 'h-1',
      descripcion: 'Hol',
    })
    expect(result.success).toBe(false)
  })
})

describe('updatePeticionSchema', () => {
  it('accepts valid estado update', () => {
    const result = updatePeticionSchema.safeParse({ estado: 'RESPONDIDA' })
    expect(result.success).toBe(true)
  })

  it('accepts all valid estados', () => {
    const estados = ['ACTIVA', 'EN_ORACION', 'RESPONDIDA', 'CERRADA']
    estados.forEach((estado) => {
      expect(updatePeticionSchema.safeParse({ estado }).success).toBe(true)
    })
  })
})

// ============================================================
// createVisitaSchema
// ============================================================
describe('createVisitaSchema', () => {
  it('accepts valid visita', () => {
    const result = createVisitaSchema.safeParse({
      hermanoId: 'h-1',
      fecha: '2026-04-12',
      tipo: 'PASTORAL',
      realizadaPor: 'user-1',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid tipo', () => {
    const result = createVisitaSchema.safeParse({
      hermanoId: 'h-1',
      fecha: '2026-04-12',
      tipo: 'OTRO',
      realizadaPor: 'user-1',
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================
// createDocumentoSchema
// ============================================================
describe('createDocumentoSchema', () => {
  it('accepts valid documento', () => {
    const result = createDocumentoSchema.safeParse({
      titulo: 'Devocional Semanal',
      tipo: 'DEVOCIONAL',
      url: 'https://example.com/doc.pdf',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid url', () => {
    const result = createDocumentoSchema.safeParse({
      titulo: 'Devocional',
      tipo: 'DEVOCIONAL',
      url: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all tipo options', () => {
    const tipos = ['DEVOCIONAL', 'CALENDARIO', 'AGENDA', 'PDF', 'ENLACE', 'MATERIAL']
    tipos.forEach((tipo) => {
      expect(
        createDocumentoSchema.safeParse({
          titulo: 'Test Doc',
          tipo,
          url: 'https://example.com/doc',
        }).success
      ).toBe(true)
    })
  })
})

// ============================================================
// createCuotaSchema / updateCuotaSchema
// ============================================================
describe('createCuotaSchema', () => {
  it('accepts valid cuota', () => {
    const result = createCuotaSchema.safeParse({
      hermanoId: 'h-1',
      monto: 10,
      mes: 4,
      anio: 2026,
      creadoPor: 'user-1',
    })
    expect(result.success).toBe(true)
  })

  it('rejects negative monto', () => {
    const result = createCuotaSchema.safeParse({
      hermanoId: 'h-1',
      monto: -5,
      mes: 4,
      anio: 2026,
      creadoPor: 'user-1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid mes', () => {
    const result = createCuotaSchema.safeParse({
      hermanoId: 'h-1',
      monto: 10,
      mes: 13,
      anio: 2026,
      creadoPor: 'user-1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects anio out of range', () => {
    const result = createCuotaSchema.safeParse({
      hermanoId: 'h-1',
      monto: 10,
      mes: 4,
      anio: 2019,
      creadoPor: 'user-1',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateCuotaSchema', () => {
  it('accepts valid estado update', () => {
    const result = updateCuotaSchema.safeParse({ estado: 'PAGADA' })
    expect(result.success).toBe(true)
  })

  it('accepts all valid estados', () => {
    const estados = ['PENDIENTE', 'PAGADA', 'EXONERADA']
    estados.forEach((estado) => {
      expect(updateCuotaSchema.safeParse({ estado }).success).toBe(true)
    })
  })
})

// ============================================================
// createMetaSchema
// ============================================================
describe('createMetaSchema', () => {
  it('accepts valid meta', () => {
    const result = createMetaSchema.safeParse({
      nombre: 'Meta Abril',
      montoMeta: 500,
      mes: 4,
      anio: 2026,
    })
    expect(result.success).toBe(true)
  })

  it('rejects zero montoMeta', () => {
    const result = createMetaSchema.safeParse({
      nombre: 'Meta',
      montoMeta: 0,
      mes: 4,
      anio: 2026,
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================
// createRedSchema
// ============================================================
describe('createRedSchema', () => {
  it('accepts valid red', () => {
    const result = createRedSchema.safeParse({
      nombre: 'Red Menor',
      tipo: 'MENOR',
      edadMin: 18,
      edadMax: 30,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid tipo', () => {
    const result = createRedSchema.safeParse({
      nombre: 'Red',
      tipo: 'INVALIDO',
      edadMin: 18,
      edadMax: 30,
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid tipos', () => {
    const tipos = ['MENOR', 'MEDIA', 'MAYOR']
    tipos.forEach((tipo) => {
      expect(
        createRedSchema.safeParse({
          nombre: 'Red Test',
          tipo,
          edadMin: 18,
          edadMax: 30,
        }).success
      ).toBe(true)
    })
  })
})

// ============================================================
// updatePermisoSchema
// ============================================================
describe('updatePermisoSchema', () => {
  it('accepts valid permiso update', () => {
    const result = updatePermisoSchema.safeParse({
      userId: 'user-1',
      recurso: 'hermanos',
      accion: 'editar',
      permitido: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing fields', () => {
    const result = updatePermisoSchema.safeParse({
      userId: 'user-1',
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================
// chatMessageSchema
// ============================================================
describe('chatMessageSchema', () => {
  it('accepts valid message', () => {
    const result = chatMessageSchema.safeParse({ message: 'Hola' })
    expect(result.success).toBe(true)
  })

  it('rejects empty message', () => {
    const result = chatMessageSchema.safeParse({ message: '' })
    expect(result.success).toBe(false)
  })

  it('rejects too long message', () => {
    const result = chatMessageSchema.safeParse({ message: 'a'.repeat(2001) })
    expect(result.success).toBe(false)
  })

  it('accepts message at max length', () => {
    const result = chatMessageSchema.safeParse({ message: 'a'.repeat(2000) })
    expect(result.success).toBe(true)
  })
})

// ============================================================
// paginationSchema
// ============================================================
describe('paginationSchema', () => {
  it('accepts valid pagination', () => {
    const result = paginationSchema.safeParse({ page: 1, limit: 20 })
    expect(result.success).toBe(true)
  })

  it('applies defaults', () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('caps limit at 100', () => {
    const result = paginationSchema.safeParse({ limit: 200 })
    expect(result.success).toBe(false)
  })
})

// ============================================================
// validateBody helper
// ============================================================
describe('validateBody', () => {
  it('returns success with valid data', () => {
    const result = validateBody(chatMessageSchema, { message: 'Hola' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message).toBe('Hola')
    }
  })

  it('returns error with invalid data', () => {
    const result = validateBody(chatMessageSchema, { message: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })

  it('returns descriptive error messages', () => {
    const result = validateBody(createHermanoSchema, { name: 'J', email: 'bad' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('nombre')
    }
  })
})
