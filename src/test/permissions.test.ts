import { describe, it, expect, vi } from 'vitest'

// Mock prisma before importing permissions
vi.mock('@/lib/prisma', () => ({
  default: { permiso: { findFirst: vi.fn(), findMany: vi.fn(), upsert: vi.fn() } },
  prisma: { permiso: { findFirst: vi.fn(), findMany: vi.fn(), upsert: vi.fn() } },
}))

import { tienePermisoRol, RECURSOS, ACCIONES, PERMISOS_DEFAULT } from '@/lib/permissions'

describe('tienePermisoRol (sync role-based check)', () => {
  // LIDER_GENERAL — always has access
  it('LIDER_GENERAL has access to everything', () => {
    Object.values(RECURSOS).forEach((recurso) => {
      Object.values(ACCIONES).forEach((accion) => {
        expect(tienePermisoRol('LIDER_GENERAL', recurso, accion)).toBe(true)
      })
    })
  })

  // HERMANO — limited access
  it('HERMANO can read hermanos', () => {
    expect(tienePermisoRol('HERMANO', RECURSOS.HERMANOS, ACCIONES.LEER)).toBe(true)
  })

  it('HERMANO cannot create hermanos', () => {
    expect(tienePermisoRol('HERMANO', RECURSOS.HERMANOS, ACCIONES.CREAR)).toBe(false)
  })

  it('HERMANO cannot edit hermanos', () => {
    expect(tienePermisoRol('HERMANO', RECURSOS.HERMANOS, ACCIONES.EDITAR)).toBe(false)
  })

  it('HERMANO cannot delete hermanos', () => {
    expect(tienePermisoRol('HERMANO', RECURSOS.HERMANOS, ACCIONES.ELIMINAR)).toBe(false)
  })

  it('HERMANO cannot manage roles', () => {
    expect(tienePermisoRol('HERMANO', RECURSOS.ROLES, ACCIONES.GESTIONAR)).toBe(false)
  })

  it('HERMANO cannot see finances', () => {
    expect(tienePermisoRol('HERMANO', RECURSOS.FINANZAS, ACCIONES.LEER)).toBe(false)
  })

  it('HERMANO can create prayer requests', () => {
    expect(tienePermisoRol('HERMANO', RECURSOS.ORACION, ACCIONES.CREAR)).toBe(true)
  })

  it('HERMANO can use AI', () => {
    expect(tienePermisoRol('HERMANO', RECURSOS.IA, ACCIONES.CREAR)).toBe(true)
  })

  // LIDER_RED — moderate access
  it('LIDER_RED can create hermanos', () => {
    expect(tienePermisoRol('LIDER_RED', RECURSOS.HERMANOS, ACCIONES.CREAR)).toBe(true)
  })

  it('LIDER_RED can edit hermanos', () => {
    expect(tienePermisoRol('LIDER_RED', RECURSOS.HERMANOS, ACCIONES.EDITAR)).toBe(true)
  })

  it('LIDER_RED cannot manage roles', () => {
    expect(tienePermisoRol('LIDER_RED', RECURSOS.ROLES, ACCIONES.GESTIONAR)).toBe(false)
  })

  it('LIDER_RED can read redes', () => {
    expect(tienePermisoRol('LIDER_RED', RECURSOS.REDES, ACCIONES.LEER)).toBe(true)
  })

  // SECRETARIO
  it('SECRETARIO can edit documentos', () => {
    expect(tienePermisoRol('SECRETARIO', RECURSOS.DOCUMENTOS, ACCIONES.EDITAR)).toBe(true)
  })

  it('SECRETARIO can edit finanzas', () => {
    expect(tienePermisoRol('SECRETARIO', RECURSOS.FINANZAS, ACCIONES.EDITAR)).toBe(true)
  })

  // ASISTENTE — limited
  it('ASISTENTE can read hermanos', () => {
    expect(tienePermisoRol('ASISTENTE', RECURSOS.HERMANOS, ACCIONES.LEER)).toBe(true)
  })

  it('ASISTENTE cannot edit hermanos', () => {
    expect(tienePermisoRol('ASISTENTE', RECURSOS.HERMANOS, ACCIONES.EDITAR)).toBe(false)
  })

  it('ASISTENTE can create asistencia', () => {
    expect(tienePermisoRol('ASISTENTE', RECURSOS.ASISTENCIA, ACCIONES.CREAR)).toBe(true)
  })

  // Edge cases
  it('returns false for unknown resource', () => {
    expect(tienePermisoRol('HERMANO', 'recurso_inexistente', ACCIONES.LEER)).toBe(false)
  })

  it('returns false for unknown action', () => {
    expect(tienePermisoRol('HERMANO', RECURSOS.HERMANOS, 'accion_inexistente')).toBe(false)
  })
})

describe('PERMISOS_DEFAULT structure', () => {
  it('has entries for all roles', () => {
    const expectedRoles = ['LIDER_GENERAL', 'LIDER_RED', 'SECRETARIO', 'ASISTENTE', 'HERMANO']
    expectedRoles.forEach((role) => {
      expect(PERMISOS_DEFAULT).toHaveProperty(role)
    })
  })

  it('LIDER_GENERAL has all core resources', () => {
    // VISITAS is a resource constant but not included in default permission map
    // (it uses the LIDER_GENERAL bypass instead)
    const coreRecursos = Object.values(RECURSOS).filter(r => r !== 'visitas')
    coreRecursos.forEach((recurso) => {
      expect(PERMISOS_DEFAULT.LIDER_GENERAL).toHaveProperty(recurso)
    })
  })

  it('HERMANO has no seguimiento access', () => {
    expect(PERMISOS_DEFAULT.HERMANO[RECURSOS.SEGUIMIENTO]).toEqual([])
  })

  it('HERMANO has no finanzas access', () => {
    expect(PERMISOS_DEFAULT.HERMANO[RECURSOS.FINANZAS]).toEqual([])
  })
})

describe('RECURSOS constants', () => {
  it('has all expected resources', () => {
    expect(RECURSOS.HERMANOS).toBe('hermanos')
    expect(RECURSOS.REDES).toBe('redes')
    expect(RECURSOS.EVENTOS).toBe('eventos')
    expect(RECURSOS.ANUNCIOS).toBe('anuncios')
    expect(RECURSOS.ASISTENCIA).toBe('asistencia')
    expect(RECURSOS.SEGUIMIENTO).toBe('seguimiento')
    expect(RECURSOS.ORACION).toBe('oracion')
    expect(RECURSOS.DOCUMENTOS).toBe('documentos')
    expect(RECURSOS.FINANZAS).toBe('finanzas')
    expect(RECURSOS.ROLES).toBe('roles')
    expect(RECURSOS.WHATSAPP).toBe('whatsapp')
    expect(RECURSOS.IA).toBe('ia')
    expect(RECURSOS.VISITAS).toBe('visitas')
  })
})

describe('ACCIONES constants', () => {
  it('has all expected actions', () => {
    expect(ACCIONES.LEER).toBe('leer')
    expect(ACCIONES.CREAR).toBe('crear')
    expect(ACCIONES.EDITAR).toBe('editar')
    expect(ACCIONES.ELIMINAR).toBe('eliminar')
    expect(ACCIONES.GESTIONAR).toBe('gestionar')
  })
})
