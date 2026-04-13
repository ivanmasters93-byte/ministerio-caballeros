import { Badge } from "@/components/ui/badge"
import { getEstadoLabel } from "@/lib/utils"

const estadoVariants: Record<string, 'success' | 'warning' | 'danger' | 'secondary' | 'default'> = {
  ACTIVO: 'success',
  PENDIENTE: 'warning',
  INACTIVO: 'danger',
  NUEVO: 'default',
  REQUIERE_SEGUIMIENTO: 'warning',
}

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <Badge variant={estadoVariants[estado] || 'secondary'}>
      {getEstadoLabel(estado)}
    </Badge>
  )
}
