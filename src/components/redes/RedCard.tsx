import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar } from "lucide-react"
import Link from "next/link"

interface RedCardProps {
  red: {
    id: string
    nombre: string
    tipo: string
    edadMin: number
    edadMax: number
    _count?: { miembros: number; eventos: number }
    lideres: Array<{ name: string }>
  }
}

const tipoColors: Record<string, string> = {
  MENOR: 'bg-blue-100 text-blue-800',
  MEDIA: 'bg-green-100 text-green-800',
  MAYOR: 'bg-purple-100 text-purple-800',
}

export function RedCard({ red }: RedCardProps) {
  return (
    <Link href={`/redes/${red.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{red.nombre}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{red.edadMin} - {red.edadMax} años</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoColors[red.tipo]}`}>
              {red.tipo}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{red._count?.miembros || 0} miembros</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{red._count?.eventos || 0} eventos</span>
            </div>
          </div>
          {red.lideres.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Líderes:</p>
              <div className="flex flex-wrap gap-1">
                {red.lideres.map(l => (
                  <span key={l.name} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
