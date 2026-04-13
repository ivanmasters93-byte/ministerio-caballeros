'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatDateShort } from '@/lib/utils'
import { Plus, Search, FileText, BookOpen, Calendar, Link as LinkIcon, Download, X } from 'lucide-react'

type IconComponent = React.ComponentType<{ size?: number; className?: string }>

const categories = [
  { id: 'todos', label: 'Todos' },
  { id: 'devocionales', label: 'Devocionales' },
  { id: 'calendarios', label: 'Calendarios' },
  { id: 'agendas', label: 'Agendas' },
  { id: 'pdfs', label: 'PDFs' },
  { id: 'enlaces', label: 'Enlaces' },
  { id: 'materiales', label: 'Materiales' },
]

const tipoIcons: Record<string, IconComponent> = {
  PDF: FileText,
  DEVOCIONAL: BookOpen,
  CALENDARIO: Calendar,
  AGENDA: Calendar,
  ENLACE: LinkIcon,
  MATERIAL: FileText,
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<{ id: string; titulo: string; tipo: string; descripcion?: string; url?: string; categoria?: string; activo: boolean; publicadoEn: string; createdAt?: string; red?: { nombre: string } }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('todos')
  const [showDialog, setShowDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'PDF',
    url: '',
    categoria: 'materiales',
  })

  useEffect(() => {
    const params = new URLSearchParams()
    if (activeCategory !== 'todos') params.set('categoria', activeCategory)
    fetch(`/api/documentos?${params}`)
      .then(r => r.json())
      .then(data => { setDocumentos(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeCategory])

  const filtered = documentos.filter(d =>
    d.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (d.descripcion ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!formData.titulo || !formData.url) return
    setCreating(true)
    try {
      const res = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const newDoc = await res.json()
        setDocumentos([newDoc, ...documentos])
        setFormData({ titulo: '', descripcion: '', tipo: 'PDF', url: '', categoria: 'materiales' })
        setShowDialog(false)
      }
    } catch {
      // handled silently; could show a toast here
    }
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Centro de Documentos</h2>
          <p className="text-gray-500 text-sm">{documentos.length} documentos disponibles</p>
        </div>
        <Button size="sm" onClick={() => setShowDialog(true)}>
          <Plus size={14} className="mr-1" /> Nuevo Documento
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar documentos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <FileText size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No hay documentos disponibles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const IconComponent = tipoIcons[doc.tipo] || FileText
            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <IconComponent size={20} className="text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{doc.tipo}</Badge>
                  </div>

                  <h3 className="font-medium text-gray-900 line-clamp-2">{doc.titulo}</h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{doc.descripcion}</p>

                  <p className="text-xs text-gray-400 mt-3">{formatDateShort(doc.publicadoEn || doc.createdAt || '')}</p>

                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3"
                  >
                    <Button size="sm" variant="outline" className="w-full">
                      <Download size={14} className="mr-1" /> Descargar
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Nuevo Documento</CardTitle>
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título del documento"
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción breve"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="PDF">PDF</option>
                    <option value="DEVOCIONAL">Devocional</option>
                    <option value="CALENDARIO">Calendario</option>
                    <option value="AGENDA">Agenda</option>
                    <option value="ENLACE">Enlace</option>
                    <option value="MATERIAL">Material</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    <option value="devocionales">Devocionales</option>
                    <option value="calendarios">Calendarios</option>
                    <option value="agendas">Agendas</option>
                    <option value="pdfs">PDFs</option>
                    <option value="enlaces">Enlaces</option>
                    <option value="materiales">Materiales</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="url">URL / Enlace</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  type="url"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreate}
                  disabled={creating || !formData.titulo || !formData.url}
                >
                  {creating ? 'Creando...' : 'Crear'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
