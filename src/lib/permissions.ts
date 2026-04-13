import { Role } from '@prisma/client'
import prisma from './prisma'

// ============================================================
// RECURSOS Y ACCIONES DEL SISTEMA
// ============================================================
export const RECURSOS = {
  HERMANOS: 'hermanos',
  REDES: 'redes',
  EVENTOS: 'eventos',
  ANUNCIOS: 'anuncios',
  ASISTENCIA: 'asistencia',
  SEGUIMIENTO: 'seguimiento',
  ORACION: 'oracion',
  DOCUMENTOS: 'documentos',
  FINANZAS: 'finanzas',
  ROLES: 'roles',
  WHATSAPP: 'whatsapp',
  IA: 'ia',
  VISITAS: 'visitas',
} as const

export const ACCIONES = {
  LEER: 'leer',
  CREAR: 'crear',
  EDITAR: 'editar',
  ELIMINAR: 'eliminar',
  GESTIONAR: 'gestionar',
} as const

// ============================================================
// PERMISOS POR DEFECTO SEGÚN ROL
// ============================================================
type PermisoMap = Record<string, string[]>

const PERMISOS_DEFAULT: Record<Role, PermisoMap> = {
  LIDER_GENERAL: {
    [RECURSOS.HERMANOS]: ['leer', 'crear', 'editar', 'eliminar', 'gestionar'],
    [RECURSOS.REDES]: ['leer', 'crear', 'editar', 'eliminar', 'gestionar'],
    [RECURSOS.EVENTOS]: ['leer', 'crear', 'editar', 'eliminar', 'gestionar'],
    [RECURSOS.ANUNCIOS]: ['leer', 'crear', 'editar', 'eliminar', 'gestionar'],
    [RECURSOS.ASISTENCIA]: ['leer', 'crear', 'editar', 'eliminar', 'gestionar'],
    [RECURSOS.SEGUIMIENTO]: ['leer', 'crear', 'editar', 'eliminar', 'gestionar'],
    [RECURSOS.ORACION]: ['leer', 'crear', 'editar', 'eliminar', 'gestionar'],
    [RECURSOS.DOCUMENTOS]: ['leer', 'crear', 'editar', 'eliminar', 'gestionar'],
    [RECURSOS.FINANZAS]: ['leer', 'crear', 'editar', 'eliminar', 'gestionar'],
    [RECURSOS.ROLES]: ['leer', 'crear', 'editar', 'eliminar', 'gestionar'],
    [RECURSOS.WHATSAPP]: ['leer', 'crear', 'editar', 'gestionar'],
    [RECURSOS.IA]: ['leer', 'crear', 'gestionar'],
  },
  LIDER_RED: {
    [RECURSOS.HERMANOS]: ['leer', 'crear', 'editar'],
    [RECURSOS.REDES]: ['leer'],
    [RECURSOS.EVENTOS]: ['leer', 'crear', 'editar'],
    [RECURSOS.ANUNCIOS]: ['leer', 'crear', 'editar'],
    [RECURSOS.ASISTENCIA]: ['leer', 'crear', 'editar'],
    [RECURSOS.SEGUIMIENTO]: ['leer', 'crear', 'editar'],
    [RECURSOS.ORACION]: ['leer', 'crear', 'editar'],
    [RECURSOS.DOCUMENTOS]: ['leer', 'crear'],
    [RECURSOS.FINANZAS]: ['leer', 'crear'],
    [RECURSOS.ROLES]: [],
    [RECURSOS.WHATSAPP]: ['leer'],
    [RECURSOS.IA]: ['leer', 'crear'],
  },
  SECRETARIO: {
    [RECURSOS.HERMANOS]: ['leer', 'crear', 'editar'],
    [RECURSOS.REDES]: ['leer'],
    [RECURSOS.EVENTOS]: ['leer', 'crear', 'editar'],
    [RECURSOS.ANUNCIOS]: ['leer', 'crear', 'editar'],
    [RECURSOS.ASISTENCIA]: ['leer', 'crear', 'editar'],
    [RECURSOS.SEGUIMIENTO]: ['leer', 'crear'],
    [RECURSOS.ORACION]: ['leer', 'crear'],
    [RECURSOS.DOCUMENTOS]: ['leer', 'crear', 'editar'],
    [RECURSOS.FINANZAS]: ['leer', 'crear', 'editar'],
    [RECURSOS.ROLES]: [],
    [RECURSOS.WHATSAPP]: ['leer'],
    [RECURSOS.IA]: ['leer', 'crear'],
  },
  ASISTENTE: {
    [RECURSOS.HERMANOS]: ['leer'],
    [RECURSOS.REDES]: ['leer'],
    [RECURSOS.EVENTOS]: ['leer'],
    [RECURSOS.ANUNCIOS]: ['leer'],
    [RECURSOS.ASISTENCIA]: ['leer', 'crear'],
    [RECURSOS.SEGUIMIENTO]: ['leer'],
    [RECURSOS.ORACION]: ['leer', 'crear'],
    [RECURSOS.DOCUMENTOS]: ['leer'],
    [RECURSOS.FINANZAS]: ['leer'],
    [RECURSOS.ROLES]: [],
    [RECURSOS.WHATSAPP]: ['leer'],
    [RECURSOS.IA]: ['leer', 'crear'],
  },
  HERMANO: {
    [RECURSOS.HERMANOS]: ['leer'],
    [RECURSOS.REDES]: ['leer'],
    [RECURSOS.EVENTOS]: ['leer'],
    [RECURSOS.ANUNCIOS]: ['leer'],
    [RECURSOS.ASISTENCIA]: ['leer'],
    [RECURSOS.SEGUIMIENTO]: [],
    [RECURSOS.ORACION]: ['leer', 'crear'],
    [RECURSOS.DOCUMENTOS]: ['leer'],
    [RECURSOS.FINANZAS]: [],
    [RECURSOS.ROLES]: [],
    [RECURSOS.WHATSAPP]: ['leer'],
    [RECURSOS.IA]: ['leer', 'crear'],
  },
}

// ============================================================
// FUNCIONES DE VERIFICACIÓN
// ============================================================

/**
 * Verifica si un usuario tiene permiso para una acción sobre un recurso.
 * Primero chequea permisos personalizados en DB, luego cae a defaults por rol.
 */
export async function tienePermiso(
  userId: string,
  role: Role,
  recurso: string,
  accion: string
): Promise<boolean> {
  // Líder general siempre tiene acceso total
  if (role === 'LIDER_GENERAL') return true

  // Buscar permiso personalizado en DB (override del líder general)
  const permisoCustom = await prisma.permiso.findFirst({
    where: { userId, recurso, accion },
  })

  if (permisoCustom) {
    return permisoCustom.permitido
  }

  // Fallback a permisos por defecto del rol
  const permisosRol = PERMISOS_DEFAULT[role]
  if (!permisosRol || !permisosRol[recurso]) return false
  return permisosRol[recurso].includes(accion)
}

/**
 * Verificación síncrona basada solo en rol (sin DB).
 * Útil para checks rápidos del lado del cliente.
 */
export function tienePermisoRol(role: Role, recurso: string, accion: string): boolean {
  if (role === 'LIDER_GENERAL') return true
  const permisosRol = PERMISOS_DEFAULT[role]
  if (!permisosRol || !permisosRol[recurso]) return false
  return permisosRol[recurso].includes(accion)
}

/**
 * Obtiene todos los permisos efectivos de un usuario.
 */
export async function obtenerPermisosUsuario(userId: string, role: Role) {
  const permisosCustom = await prisma.permiso.findMany({
    where: { userId },
  })

  const resultado: Record<string, Record<string, boolean>> = {}
  const defaults = PERMISOS_DEFAULT[role] || {}

  // Inicializar con defaults del rol
  for (const [recurso, acciones] of Object.entries(defaults)) {
    resultado[recurso] = {}
    for (const accion of Object.values(ACCIONES)) {
      resultado[recurso][accion] = acciones.includes(accion)
    }
  }

  // Aplicar overrides personalizados
  for (const permiso of permisosCustom) {
    if (!resultado[permiso.recurso]) resultado[permiso.recurso] = {}
    resultado[permiso.recurso][permiso.accion] = permiso.permitido
  }

  return resultado
}

/**
 * El líder general puede establecer permisos custom para cualquier usuario.
 */
export async function establecerPermiso(
  userId: string,
  recurso: string,
  accion: string,
  permitido: boolean
) {
  return prisma.permiso.upsert({
    where: {
      userId_recurso_accion: { userId, recurso, accion },
    },
    update: { permitido },
    create: {
      userId,
      recurso,
      accion,
      permitido,
    },
  })
}

export { PERMISOS_DEFAULT }
