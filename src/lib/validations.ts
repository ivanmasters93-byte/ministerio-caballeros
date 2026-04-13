import { z } from 'zod'

// ============================================================
// HERMANOS
// ============================================================
export const createHermanoSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  redId: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  direccion: z.string().optional(),
  ocupacion: z.string().optional(),
  estadoCivil: z.string().optional(),
})

export const updateHermanoSchema = z.object({
  estado: z.enum(['ACTIVO', 'PENDIENTE', 'INACTIVO', 'NUEVO', 'REQUIERE_SEGUIMIENTO']).optional(),
  fechaNacimiento: z.string().optional(),
  direccion: z.string().optional(),
  ocupacion: z.string().optional(),
  estadoCivil: z.string().optional(),
  notas: z.string().optional(),
})

// ============================================================
// EVENTOS
// ============================================================
export const createEventoSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  fecha: z.string(),
  hora: z.string().optional(),
  tipo: z.enum(['REUNION', 'CULTO', 'RETIRO', 'CAPACITACION', 'SOCIAL', 'OTRO']),
  zoomLink: z.string().url().optional().or(z.literal('')),
  youtubeLink: z.string().url().optional().or(z.literal('')),
  jitsiEnabled: z.boolean().optional(),
  jitsiRoomId: z.string().optional(),
  grabacionUrl: z.string().url().optional().or(z.literal('')),
  redId: z.string().optional(),
  esRecurrente: z.boolean().optional(),
  patron: z.string().optional(),
})

export const updateEventoSchema = createEventoSchema.partial()

// ============================================================
// ANUNCIOS
// ============================================================
export const createAnuncioSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  contenido: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  tipo: z.enum(['GENERAL', 'URGENTE', 'RECORDATORIO', 'EVENTO']),
  prioridad: z.enum(['BAJA', 'NORMAL', 'ALTA', 'URGENTE']).optional(),
  paraTodasRedes: z.boolean().optional(),
  redId: z.string().optional(),
  eventoId: z.string().optional(),
  expiraEn: z.string().optional(),
})

export const updateAnuncioSchema = createAnuncioSchema.partial().extend({
  activo: z.boolean().optional(),
})

// ============================================================
// ASISTENCIA
// ============================================================
export const createAsistenciaSchema = z.object({
  eventoId: z.string().min(1, 'Evento requerido'),
  redId: z.string().min(1, 'Red requerida'),
  fecha: z.string(),
  detalles: z.array(z.object({
    hermanoId: z.string(),
    presente: z.boolean(),
    nota: z.string().optional(),
  })).min(1, 'Debe incluir al menos un hermano'),
})

// ============================================================
// SEGUIMIENTO
// ============================================================
export const createSeguimientoSchema = z.object({
  hermanoId: z.string().min(1, 'Hermano requerido'),
  tipo: z.enum(['LLAMADA', 'VISITA', 'NOTA', 'ALERTA']),
  descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  responsableId: z.string().min(1, 'Responsable requerido'),
  estado: z.enum(['ABIERTO', 'EN_PROCESO', 'CERRADO']).optional(),
  proximoContacto: z.string().optional(),
  privado: z.boolean().optional(),
})

export const updateSeguimientoSchema = createSeguimientoSchema.partial()

// ============================================================
// PETICIONES DE ORACIÓN
// ============================================================
export const createPeticionSchema = z.object({
  hermanoId: z.string().min(1, 'Hermano requerido'),
  descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  prioridad: z.enum(['BAJA', 'NORMAL', 'ALTA', 'URGENTE']).optional(),
  responsable: z.string().optional(),
  privada: z.boolean().optional(),
})

export const updatePeticionSchema = z.object({
  estado: z.enum(['ACTIVA', 'EN_ORACION', 'RESPONDIDA', 'CERRADA']).optional(),
  prioridad: z.enum(['BAJA', 'NORMAL', 'ALTA', 'URGENTE']).optional(),
  descripcion: z.string().optional(),
  responsable: z.string().optional(),
})

// ============================================================
// VISITAS
// ============================================================
export const createVisitaSchema = z.object({
  hermanoId: z.string().min(1, 'Hermano requerido'),
  fecha: z.string(),
  tipo: z.enum(['PASTORAL', 'SOCIAL', 'EMERGENCIA']),
  notas: z.string().optional(),
  realizadaPor: z.string().min(1, 'Requerido quién realizó la visita'),
})

// ============================================================
// DOCUMENTOS
// ============================================================
export const createDocumentoSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  tipo: z.enum(['DEVOCIONAL', 'CALENDARIO', 'AGENDA', 'PDF', 'ENLACE', 'MATERIAL']),
  url: z.string().url('URL inválida'),
  redId: z.string().optional(),
  categoria: z.string().optional(),
})

export const updateDocumentoSchema = createDocumentoSchema.partial().extend({
  activo: z.boolean().optional(),
})

// ============================================================
// FINANZAS
// ============================================================
export const createCuotaSchema = z.object({
  hermanoId: z.string().min(1, 'Hermano requerido'),
  monto: z.number().positive('El monto debe ser positivo'),
  mes: z.number().min(1).max(12),
  anio: z.number().min(2020).max(2050),
  tipo: z.enum(['MENSUAL', 'ESPECIAL', 'OFRENDA', 'DONACION']).optional(),
  concepto: z.string().optional(),
  redId: z.string().optional(),
  creadoPor: z.string().min(1, 'Creador requerido'),
})

export const updateCuotaSchema = z.object({
  estado: z.enum(['PENDIENTE', 'PAGADA', 'EXONERADA']).optional(),
  monto: z.number().positive().optional(),
  concepto: z.string().optional(),
})

export const createMetaSchema = z.object({
  nombre: z.string().min(3),
  montoMeta: z.number().positive(),
  mes: z.number().min(1).max(12),
  anio: z.number().min(2020).max(2050),
  redId: z.string().optional(),
  descripcion: z.string().optional(),
})

// ============================================================
// REDES
// ============================================================
export const createRedSchema = z.object({
  nombre: z.string().min(2),
  tipo: z.enum(['MENOR', 'MEDIA', 'MAYOR']),
  edadMin: z.number().min(0),
  edadMax: z.number().min(1),
})

export const updateRedSchema = createRedSchema.partial()

// ============================================================
// PERMISOS
// ============================================================
export const updatePermisoSchema = z.object({
  userId: z.string().min(1),
  recurso: z.string().min(1),
  accion: z.string().min(1),
  permitido: z.boolean(),
})

// ============================================================
// AI CHAT
// ============================================================
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'El mensaje no puede estar vacío').max(2000),
})

// ============================================================
// PAGINACIÓN
// ============================================================
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// ============================================================
// HELPERS
// ============================================================
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    return { success: false, error: errors }
  }
  return { success: true, data: result.data }
}
