import { describe, it, expect, vi } from 'vitest'

// Mock dependencies that api-helpers imports
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}))
vi.mock('@/lib/prisma', () => ({
  default: { permiso: { findFirst: vi.fn() } },
  prisma: { permiso: { findFirst: vi.fn() } },
}))

import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  AuthError,
  PermisoError,
  NotFoundError,
  getPaginationParams,
  buildPaginatedResponse,
  getSearchParam,
  getNumberParam,
  getBooleanParam,
} from '@/lib/api-helpers'

// ============================================================
// Response helpers
// ============================================================
describe('jsonResponse', () => {
  it('returns 200 by default', () => {
    const res = jsonResponse({ data: 'test' })
    expect(res.status).toBe(200)
  })

  it('returns custom status', () => {
    const res = jsonResponse({ data: 'created' }, 201)
    expect(res.status).toBe(201)
  })
})

describe('errorResponse', () => {
  it('returns 400 by default', () => {
    const res = errorResponse('Bad request')
    expect(res.status).toBe(400)
  })

  it('returns custom status', () => {
    const res = errorResponse('Server error', 500)
    expect(res.status).toBe(500)
  })
})

describe('unauthorizedResponse', () => {
  it('returns 401', () => {
    const res = unauthorizedResponse()
    expect(res.status).toBe(401)
  })

  it('uses default message', () => {
    const res = unauthorizedResponse()
    expect(res.status).toBe(401)
  })

  it('accepts custom message', () => {
    const res = unauthorizedResponse('Sesión expirada')
    expect(res.status).toBe(401)
  })
})

describe('forbiddenResponse', () => {
  it('returns 403', () => {
    const res = forbiddenResponse()
    expect(res.status).toBe(403)
  })
})

describe('notFoundResponse', () => {
  it('returns 404', () => {
    const res = notFoundResponse()
    expect(res.status).toBe(404)
  })
})

// ============================================================
// Custom errors
// ============================================================
describe('AuthError', () => {
  it('has correct status', () => {
    const error = new AuthError()
    expect(error.status).toBe(401)
    expect(error.name).toBe('AuthError')
    expect(error.message).toBe('No autorizado')
  })

  it('accepts custom message', () => {
    const error = new AuthError('Sesión expirada')
    expect(error.message).toBe('Sesión expirada')
  })

  it('is instance of Error', () => {
    expect(new AuthError()).toBeInstanceOf(Error)
  })
})

describe('PermisoError', () => {
  it('has correct status', () => {
    const error = new PermisoError()
    expect(error.status).toBe(403)
    expect(error.name).toBe('PermisoError')
    expect(error.message).toBe('Sin permisos')
  })
})

describe('NotFoundError', () => {
  it('has correct status', () => {
    const error = new NotFoundError()
    expect(error.status).toBe(404)
    expect(error.name).toBe('NotFoundError')
    expect(error.message).toBe('No encontrado')
  })
})

// ============================================================
// Pagination helpers
// ============================================================
describe('getPaginationParams', () => {
  it('returns defaults', () => {
    const params = new URLSearchParams()
    const { page, limit, skip } = getPaginationParams(params)
    expect(page).toBe(1)
    expect(limit).toBe(20)
    expect(skip).toBe(0)
  })

  it('parses page and limit', () => {
    const params = new URLSearchParams('page=3&limit=10')
    const { page, limit, skip } = getPaginationParams(params)
    expect(page).toBe(3)
    expect(limit).toBe(10)
    expect(skip).toBe(20)
  })

  it('clamps minimum page to 1', () => {
    const params = new URLSearchParams('page=-5')
    const { page } = getPaginationParams(params)
    expect(page).toBe(1)
  })

  it('clamps maximum limit to 100', () => {
    const params = new URLSearchParams('limit=500')
    const { limit } = getPaginationParams(params)
    expect(limit).toBe(100)
  })

  it('clamps minimum limit to 1', () => {
    const params = new URLSearchParams('limit=0')
    const { limit } = getPaginationParams(params)
    expect(limit).toBe(1)
  })
})

describe('buildPaginatedResponse', () => {
  it('builds correct pagination metadata', () => {
    const result = buildPaginatedResponse(['a', 'b'], 50, 1, 20)
    expect(result.data).toEqual(['a', 'b'])
    expect(result.pagination.page).toBe(1)
    expect(result.pagination.limit).toBe(20)
    expect(result.pagination.total).toBe(50)
    expect(result.pagination.totalPages).toBe(3)
    expect(result.pagination.hasNext).toBe(true)
    expect(result.pagination.hasPrev).toBe(false)
  })

  it('handles last page', () => {
    const result = buildPaginatedResponse(['x'], 21, 2, 20)
    expect(result.pagination.hasNext).toBe(false)
    expect(result.pagination.hasPrev).toBe(true)
  })

  it('handles single page', () => {
    const result = buildPaginatedResponse(['a'], 1, 1, 20)
    expect(result.pagination.totalPages).toBe(1)
    expect(result.pagination.hasNext).toBe(false)
    expect(result.pagination.hasPrev).toBe(false)
  })

  it('handles empty data', () => {
    const result = buildPaginatedResponse([], 0, 1, 20)
    expect(result.pagination.totalPages).toBe(0)
  })
})

// ============================================================
// Search/Filter helpers
// ============================================================
describe('getSearchParam', () => {
  it('returns trimmed value', () => {
    const params = new URLSearchParams('search= hello ')
    expect(getSearchParam(params, 'search')).toBe('hello')
  })

  it('returns undefined for missing param', () => {
    const params = new URLSearchParams()
    expect(getSearchParam(params, 'search')).toBeUndefined()
  })

  it('returns undefined for empty param', () => {
    const params = new URLSearchParams('search=')
    expect(getSearchParam(params, 'search')).toBeUndefined()
  })

  it('returns undefined for whitespace-only param', () => {
    const params = new URLSearchParams('search=   ')
    expect(getSearchParam(params, 'search')).toBeUndefined()
  })
})

describe('getNumberParam', () => {
  it('returns parsed number', () => {
    const params = new URLSearchParams('page=5')
    expect(getNumberParam(params, 'page')).toBe(5)
  })

  it('returns undefined for missing param', () => {
    const params = new URLSearchParams()
    expect(getNumberParam(params, 'page')).toBeUndefined()
  })

  it('returns undefined for non-numeric param', () => {
    const params = new URLSearchParams('page=abc')
    expect(getNumberParam(params, 'page')).toBeUndefined()
  })
})

describe('getBooleanParam', () => {
  it('returns true for "true"', () => {
    const params = new URLSearchParams('active=true')
    expect(getBooleanParam(params, 'active')).toBe(true)
  })

  it('returns false for "false"', () => {
    const params = new URLSearchParams('active=false')
    expect(getBooleanParam(params, 'active')).toBe(false)
  })

  it('returns undefined for missing param', () => {
    const params = new URLSearchParams()
    expect(getBooleanParam(params, 'active')).toBeUndefined()
  })

  it('returns undefined for other values', () => {
    const params = new URLSearchParams('active=yes')
    expect(getBooleanParam(params, 'active')).toBeUndefined()
  })
})
