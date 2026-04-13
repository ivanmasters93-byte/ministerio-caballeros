import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
  })
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    LIDER_GENERAL: 'Líder General',
    LIDER_RED: 'Líder de Red',
    SECRETARIO: 'Secretario',
    ASISTENTE: 'Asistente',
    HERMANO: 'Hermano',
  }
  return labels[role] || role
}

export function getEstadoLabel(estado: string): string {
  const labels: Record<string, string> = {
    ACTIVO: 'Activo',
    PENDIENTE: 'Pendiente',
    INACTIVO: 'Inactivo',
    NUEVO: 'Nuevo',
    REQUIERE_SEGUIMIENTO: 'Requiere Seguimiento',
  }
  return labels[estado] || estado
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
