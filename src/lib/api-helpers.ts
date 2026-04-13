import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'
import { tienePermiso } from './permissions'
import { Role } from '@prisma/client'

// ============================================================
// TIPOS
// ============================================================
export interface AuthSession {
  user: {
    id: string
    name: string
    email: string
    role: Role
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ============================================================
// RESPUESTAS ESTÁNDAR
// ============================================================
export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function unauthorizedResponse(message = 'No autorizado') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbiddenResponse(message = 'Sin permisos para esta acción') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFoundResponse(message = 'Recurso no encontrado') {
  return NextResponse.json({ error: message }, { status: 404 })
}

// ============================================================
// AUTENTICACIÓN DE RUTAS API
// ============================================================
export async function getAuthSession(): Promise<AuthSession | null> {
  const session = await auth()
  if (!session?.user?.email) return null
  return session as unknown as AuthSession
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession()
  if (!session) {
    throw new AuthError('No autorizado')
  }
  return session
}

export async function requirePermiso(
  recurso: string,
  accion: string
): Promise<AuthSession> {
  const session = await requireAuth()
  const permitido = await tienePermiso(
    session.user.id,
    session.user.role as Role,
    recurso,
    accion
  )
  if (!permitido) {
    throw new PermisoError('Sin permisos para esta acción')
  }
  return session
}

// ============================================================
// ERRORES PERSONALIZADOS
// ============================================================
export class AuthError extends Error {
  status = 401
  constructor(message = 'No autorizado') {
    super(message)
    this.name = 'AuthError'
  }
}

export class PermisoError extends Error {
  status = 403
  constructor(message = 'Sin permisos') {
    super(message)
    this.name = 'PermisoError'
  }
}

export class NotFoundError extends Error {
  status = 404
  constructor(message = 'No encontrado') {
    super(message)
    this.name = 'NotFoundError'
  }
}

// ============================================================
// HANDLER WRAPPER CON ERROR HANDLING
// ============================================================
// Next.js 15+ uses Promise<params> in route context
export type RouteContext = { params: Promise<Record<string, string>> }
type ApiHandler = (req: NextRequest, context: RouteContext) => Promise<NextResponse>

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req, context = { params: Promise.resolve({}) }) => {
    try {
      return await handler(req, context)
    } catch (error) {
      if (error instanceof AuthError) {
        return unauthorizedResponse(error.message)
      }
      if (error instanceof PermisoError) {
        return forbiddenResponse(error.message)
      }
      if (error instanceof NotFoundError) {
        return notFoundResponse(error.message)
      }
      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, error)
      return errorResponse('Error interno del servidor', 500)
    }
  }
}

// ============================================================
// PAGINACIÓN
// ============================================================
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(30, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit)
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

// ============================================================
// BÚSQUEDA Y FILTROS
// ============================================================
export function getSearchParam(searchParams: URLSearchParams, key: string): string | undefined {
  const value = searchParams.get(key)
  return value && value.trim() ? value.trim() : undefined
}

export function getNumberParam(searchParams: URLSearchParams, key: string): number | undefined {
  const value = searchParams.get(key)
  if (!value) return undefined
  const num = parseInt(value)
  return isNaN(num) ? undefined : num
}

export function getBooleanParam(searchParams: URLSearchParams, key: string): boolean | undefined {
  const value = searchParams.get(key)
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}
