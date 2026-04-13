export type { Role, TipoRed, EstadoHermano, TipoEvento, TipoAnuncio, Prioridad, TipoSeguimiento, TipoVisita, EstadoCaso, EstadoPeticion, TipoDocumento } from '@prisma/client'

export interface DashboardStats {
  totalHermanos: number
  redesActivas: number
  proximosEventos: number
  peticionesPendientes: number
  hermanosRequierenSeguimiento: number
  anunciosActivos: number
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
}
