'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { FlyerTemplate, FlyerElemento } from '@/lib/flyers/templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Download,
  Undo2,
  Redo2,
  Type,
  Square,
  Circle,
  Copy,
  Trash2,
  X,
  Clipboard,
} from 'lucide-react'

// Dynamically import fabric to avoid SSR
async function loadFabric() {
  const mod = await import('fabric')
  return mod
}

interface FlyerEditorProps {
  template: FlyerTemplate
  onClose: () => void
}

interface SelectedProps {
  text?: string
  fill?: string
  fontSize?: number
  fontWeight?: string
  fontStyle?: string
  opacity?: number
  type?: string
}

const SCALE = 0.45 // display scale: 1080 * 0.45 = 486px canvas display

export function FlyerEditor({ template, onClose }: FlyerEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef = useRef<any>(null)
  const [fabricLoaded, setFabricLoaded] = useState(false)
  const [selectedProps, setSelectedProps] = useState<SelectedProps>({})
  const [hasSelection, setHasSelection] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const historyRef = useRef<string[]>([])
  const isRestoringRef = useRef(false)

  const saveHistory = useCallback(() => {
    if (isRestoringRef.current || !fabricRef.current) return
    const json = JSON.stringify(fabricRef.current.toJSON())
    const current = historyRef.current
    // Truncate future states
    const newHistory = current.slice(0, historyIndex + 1)
    newHistory.push(json)
    historyRef.current = newHistory
    setHistoryIndex(newHistory.length - 1)
  }, [historyIndex])

  // Draw template onto fabric canvas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTemplate = useCallback(async (canvas: any, fab: any, tmpl: FlyerTemplate) => {
    canvas.clear()

    for (const el of tmpl.elementos) {
      if (el.tipo === 'forma') {
        if (el.forma === 'rect') {
          const rect = new fab.Rect({
            left: (el.x ?? 0) * SCALE,
            top: (el.y ?? 0) * SCALE,
            width: (el.ancho ?? 100) * SCALE,
            height: (el.alto ?? 100) * SCALE,
            fill: el.colorFondo ?? 'transparent',
            stroke: el.color ?? undefined,
            strokeWidth: el.color ? 2 * SCALE : 0,
            rx: (el.rx ?? 0) * SCALE,
            ry: (el.rx ?? 0) * SCALE,
            opacity: el.opacidad ?? 1,
            selectable: true,
            hasControls: true,
          })
          canvas.add(rect)
        } else if (el.forma === 'circle') {
          const circle = new fab.Circle({
            left: ((el.x ?? 0) - (el.radio ?? 50)) * SCALE,
            top: ((el.y ?? 0) - (el.radio ?? 50)) * SCALE,
            radius: (el.radio ?? 50) * SCALE,
            fill: el.colorFondo ?? 'transparent',
            stroke: el.color ?? undefined,
            strokeWidth: el.color ? 2 * SCALE : 0,
            opacity: el.opacidad ?? 1,
            selectable: true,
            hasControls: true,
          })
          canvas.add(circle)
        }
      } else if (el.tipo === 'texto') {
        const textObj = new fab.IText(el.texto ?? '', {
          left: (el.x ?? 0) * SCALE,
          top: (el.y ?? 0) * SCALE,
          originX: el.alineacion === 'center' ? 'center' : el.alineacion === 'right' ? 'right' : 'left',
          originY: 'center',
          fill: el.color ?? '#ffffff',
          fontFamily: el.fuente ?? 'Arial',
          fontSize: (el.tamano ?? 24) * SCALE,
          fontWeight: el.negrita ? 'bold' : 'normal',
          fontStyle: el.italica ? 'italic' : 'normal',
          textAlign: el.alineacion ?? 'center',
          opacity: el.opacidad ?? 1,
          selectable: true,
          hasControls: true,
        })
        canvas.add(textObj)
      }
    }

    canvas.renderAll()
  }, [])

  useEffect(() => {
    let mounted = true

    loadFabric().then((fab) => {
      if (!mounted || !canvasRef.current) return

      const displayWidth = Math.round(template.ancho * SCALE)
      const displayHeight = Math.round(template.alto * SCALE)

      const canvas = new fab.Canvas(canvasRef.current, {
        width: displayWidth,
        height: displayHeight,
        backgroundColor: template.fondoColores[0] ?? '#1a1a2e',
        selection: true,
      })

      fabricRef.current = canvas

      // Selection events
      const extractProps = (rawObj: unknown): void => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj = rawObj as any
        if (!obj) return
        setHasSelection(true)
        setSelectedProps({
          type: obj.type as string,
          text: obj.type === 'i-text' ? (obj.text as string) : undefined,
          fill: typeof obj.fill === 'string' ? obj.fill : '#ffffff',
          fontSize: obj.type === 'i-text' ? Math.round((obj.fontSize as number) / SCALE) : undefined,
          fontWeight: obj.fontWeight as string,
          fontStyle: obj.fontStyle as string,
          opacity: obj.opacity as number,
        })
      }

      canvas.on('selection:created', () => {
        extractProps(canvas.getActiveObject())
      })

      canvas.on('selection:updated', () => {
        extractProps(canvas.getActiveObject())
      })

      canvas.on('selection:cleared', () => {
        setHasSelection(false)
        setSelectedProps({})
      })

      canvas.on('object:modified', saveHistory)
      canvas.on('text:changed', saveHistory)

      renderTemplate(canvas, fab, template).then(() => {
        if (!mounted) return
        setFabricLoaded(true)
        // Save initial state
        const json = JSON.stringify(canvas.toJSON())
        historyRef.current = [json]
        setHistoryIndex(0)
      })
    })

    return () => {
      mounted = false
      if (fabricRef.current) {
        fabricRef.current.dispose()
        fabricRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template])

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0 || !fabricRef.current) return
    const newIndex = historyIndex - 1
    isRestoringRef.current = true
    fabricRef.current.loadFromJSON(
      JSON.parse(historyRef.current[newIndex]),
      () => {
        fabricRef.current.renderAll()
        isRestoringRef.current = false
        setHistoryIndex(newIndex)
      }
    )
  }, [historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex >= historyRef.current.length - 1 || !fabricRef.current) return
    const newIndex = historyIndex + 1
    isRestoringRef.current = true
    fabricRef.current.loadFromJSON(
      JSON.parse(historyRef.current[newIndex]),
      () => {
        fabricRef.current.renderAll()
        isRestoringRef.current = false
        setHistoryIndex(newIndex)
      }
    )
  }, [historyIndex])

  const handleAddText = useCallback(async () => {
    if (!fabricRef.current) return
    const fab = await loadFabric()
    const text = new fab.IText('Nuevo texto', {
      left: Math.round(template.ancho * SCALE / 2),
      top: Math.round(template.alto * SCALE / 2),
      originX: 'center',
      originY: 'center',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontSize: 32 * SCALE,
      fontWeight: 'bold',
      textAlign: 'center',
      selectable: true,
      hasControls: true,
    })
    fabricRef.current.add(text)
    fabricRef.current.setActiveObject(text)
    fabricRef.current.renderAll()
    saveHistory()
  }, [template, saveHistory])

  const handleAddRect = useCallback(async () => {
    if (!fabricRef.current) return
    const fab = await loadFabric()
    const rect = new fab.Rect({
      left: 100 * SCALE,
      top: 100 * SCALE,
      width: 200 * SCALE,
      height: 80 * SCALE,
      fill: '#3b82f6',
      opacity: 0.8,
      rx: 8 * SCALE,
      ry: 8 * SCALE,
      selectable: true,
      hasControls: true,
    })
    fabricRef.current.add(rect)
    fabricRef.current.setActiveObject(rect)
    fabricRef.current.renderAll()
    saveHistory()
  }, [saveHistory])

  const handleAddCircle = useCallback(async () => {
    if (!fabricRef.current) return
    const fab = await loadFabric()
    const circle = new fab.Circle({
      left: 100 * SCALE,
      top: 100 * SCALE,
      radius: 60 * SCALE,
      fill: '#c9a84c',
      opacity: 0.7,
      selectable: true,
      hasControls: true,
    })
    fabricRef.current.add(circle)
    fabricRef.current.setActiveObject(circle)
    fabricRef.current.renderAll()
    saveHistory()
  }, [saveHistory])

  const handleDelete = useCallback(() => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getActiveObject()
    if (obj) {
      fabricRef.current.remove(obj)
      fabricRef.current.renderAll()
      setHasSelection(false)
      saveHistory()
    }
  }, [saveHistory])

  const handleDuplicate = useCallback(async () => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getActiveObject()
    if (!obj) return
    obj.clone((cloned: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = cloned as any
      c.set({ left: (c.left ?? 0) + 20, top: (c.top ?? 0) + 20 })
      fabricRef.current.add(c)
      fabricRef.current.setActiveObject(c)
      fabricRef.current.renderAll()
      saveHistory()
    })
  }, [saveHistory])

  const handleDownload = useCallback(() => {
    if (!fabricRef.current) return
    // Export at full resolution (multiply by 1/SCALE)
    const dataUrl = fabricRef.current.toDataURL({
      format: 'png',
      multiplier: 1 / SCALE,
      quality: 1,
    })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `flyer-${template.id}-${Date.now()}.png`
    a.click()
  }, [template])

  const handleCopyToClipboard = useCallback(async () => {
    if (!fabricRef.current) return
    const dataUrl = fabricRef.current.toDataURL({
      format: 'png',
      multiplier: 1 / SCALE,
      quality: 1,
    })
    const blob = await fetch(dataUrl).then((r) => r.blob())
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
  }, [])

  // Property updates
  const updateSelectedColor = useCallback((color: string) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getActiveObject()
    if (!obj) return
    obj.set('fill', color)
    fabricRef.current.renderAll()
    setSelectedProps((p) => ({ ...p, fill: color }))
    saveHistory()
  }, [saveHistory])

  const updateSelectedFontSize = useCallback((size: number) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getActiveObject()
    if (!obj || obj.type !== 'i-text') return
    obj.set('fontSize', size * SCALE)
    fabricRef.current.renderAll()
    setSelectedProps((p) => ({ ...p, fontSize: size }))
    saveHistory()
  }, [saveHistory])

  const updateSelectedBold = useCallback(() => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getActiveObject()
    if (!obj || obj.type !== 'i-text') return
    const current = obj.fontWeight === 'bold'
    obj.set('fontWeight', current ? 'normal' : 'bold')
    fabricRef.current.renderAll()
    setSelectedProps((p) => ({ ...p, fontWeight: current ? 'normal' : 'bold' }))
    saveHistory()
  }, [saveHistory])

  const updateSelectedItalic = useCallback(() => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getActiveObject()
    if (!obj || obj.type !== 'i-text') return
    const current = obj.fontStyle === 'italic'
    obj.set('fontStyle', current ? 'normal' : 'italic')
    fabricRef.current.renderAll()
    setSelectedProps((p) => ({ ...p, fontStyle: current ? 'normal' : 'italic' }))
    saveHistory()
  }, [saveHistory])

  const updateSelectedOpacity = useCallback((val: number) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getActiveObject()
    if (!obj) return
    obj.set('opacity', val)
    fabricRef.current.renderAll()
    setSelectedProps((p) => ({ ...p, opacity: val }))
    saveHistory()
  }, [saveHistory])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < historyRef.current.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Top toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          background: 'var(--color-bg-sidebar)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {template.nombre}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Add elements */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddText}
            disabled={!fabricLoaded}
            title="Agregar texto"
          >
            <Type size={14} className="mr-1" />
            Texto
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRect}
            disabled={!fabricLoaded}
            title="Agregar rectángulo"
          >
            <Square size={14} className="mr-1" />
            Rect
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCircle}
            disabled={!fabricLoaded}
            title="Agregar círculo"
          >
            <Circle size={14} className="mr-1" />
            Círculo
          </Button>

          <div className="w-px h-6 mx-1" style={{ background: 'var(--color-border-subtle)' }} />

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Deshacer"
          >
            <Undo2 size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Rehacer"
          >
            <Redo2 size={15} />
          </Button>

          <div className="w-px h-6 mx-1" style={{ background: 'var(--color-border-subtle)' }} />

          {/* Export */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyToClipboard}
            disabled={!fabricLoaded}
            title="Copiar al portapapeles"
          >
            <Clipboard size={15} />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={!fabricLoaded}
          >
            <Download size={14} className="mr-1" />
            Descargar PNG
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div
          className="flex-1 flex items-center justify-center overflow-auto"
          style={{ background: 'var(--color-bg-base)' }}
        >
          {!fabricLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'var(--color-accent-gold)', borderTopColor: 'transparent' }}
                />
                <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                  Cargando editor...
                </p>
              </div>
            </div>
          )}
          <div
            className="shadow-2xl"
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.6)',
              borderRadius: 4,
            }}
          >
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right panel: Properties */}
        <div
          className="flex-shrink-0 w-64 overflow-y-auto"
          style={{
            background: 'var(--color-bg-sidebar)',
            borderLeft: '1px solid var(--color-border-subtle)',
          }}
        >
          <div className="p-4 space-y-5">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Propiedades
            </p>

            {!hasSelection ? (
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Selecciona un elemento en el flyer para editar sus propiedades.
                Doble clic en texto para editarlo.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Color
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedProps.fill ?? '#ffffff'}
                      onChange={(e) => updateSelectedColor(e.target.value)}
                      className="w-10 h-8 rounded border cursor-pointer"
                      style={{ borderColor: 'var(--color-border-subtle)', background: 'none' }}
                    />
                    <Input
                      value={selectedProps.fill ?? '#ffffff'}
                      onChange={(e) => updateSelectedColor(e.target.value)}
                      className="flex-1 text-xs font-mono"
                      style={{ height: 32 }}
                    />
                  </div>
                </div>

                {/* Font size (text only) */}
                {selectedProps.type === 'i-text' && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        Tamaño de fuente
                      </Label>
                      <Input
                        type="number"
                        value={selectedProps.fontSize ?? 24}
                        min={8}
                        max={200}
                        onChange={(e) => updateSelectedFontSize(Number(e.target.value))}
                        style={{ height: 32 }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={updateSelectedBold}
                        className="flex-1 py-1.5 rounded text-xs font-bold transition-all"
                        style={{
                          background: selectedProps.fontWeight === 'bold'
                            ? 'var(--color-accent-gold)'
                            : 'var(--color-bg-elevated)',
                          color: selectedProps.fontWeight === 'bold'
                            ? '#0c0e14'
                            : 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        N (Bold)
                      </button>
                      <button
                        onClick={updateSelectedItalic}
                        className="flex-1 py-1.5 rounded text-xs italic transition-all"
                        style={{
                          background: selectedProps.fontStyle === 'italic'
                            ? 'var(--color-accent-gold)'
                            : 'var(--color-bg-elevated)',
                          color: selectedProps.fontStyle === 'italic'
                            ? '#0c0e14'
                            : 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        I (Itálica)
                      </button>
                    </div>
                  </>
                )}

                {/* Opacity */}
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Opacidad: {Math.round((selectedProps.opacity ?? 1) * 100)}%
                  </Label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={selectedProps.opacity ?? 1}
                    onChange={(e) => updateSelectedOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest pt-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Acciones
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicate}
                    className="w-full justify-start"
                  >
                    <Copy size={13} className="mr-2" />
                    Duplicar elemento
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    className="w-full justify-start"
                  >
                    <Trash2 size={13} className="mr-2" />
                    Eliminar elemento
                  </Button>
                </div>
              </div>
            )}

            {/* Tips */}
            <div
              className="rounded-lg p-3 space-y-1"
              style={{ background: 'var(--color-bg-elevated)' }}
            >
              <p
                className="text-[11px] font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Consejos:
              </p>
              <ul
                className="text-[10px] space-y-1 list-disc list-inside"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <li>Doble clic en texto para editarlo</li>
                <li>Arrastra para mover elementos</li>
                <li>Usa las esquinas para redimensionar</li>
                <li>Ctrl+Z / Ctrl+Y para deshacer/rehacer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
