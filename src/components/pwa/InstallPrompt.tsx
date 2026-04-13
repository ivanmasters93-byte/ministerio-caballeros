'use client'

import { useEffect, useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallState = 'hidden' | 'android' | 'ios' | 'installed'

export function InstallPrompt() {
  const [state, setState] = useState<InstallState>('hidden')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed in this session
    if (typeof window === 'undefined') return
    const alreadyDismissed = sessionStorage.getItem('pwa-prompt-dismissed')
    if (alreadyDismissed) return

    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (isStandalone) {
      setState('installed')
      return
    }

    // iOS detection
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isIOS && isSafari) {
      setState('ios')
      return
    }

    // Android / Chrome – listen for native install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setState('android')
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setState('installed')
    }
    setDeferredPrompt(null)
    setState('hidden')
  }

  const handleDismiss = () => {
    setDismissed(true)
    setState('hidden')
    sessionStorage.setItem('pwa-prompt-dismissed', '1')
  }

  if (dismissed || state === 'hidden' || state === 'installed') return null

  return (
    <div
      role="banner"
      aria-label="Instalar aplicación"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl shadow-2xl border flex flex-col gap-3 p-4 animate-slide-up"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'var(--color-border-default)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{
              width: 40,
              height: 40,
              background: 'var(--color-accent-blue-soft)',
              border: '1px solid rgba(91,141,239,0.2)',
            }}
          >
            <Smartphone size={20} style={{ color: 'var(--color-accent-blue)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              Instalar Gedeones
            </p>
            <p className="text-xs leading-tight mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Acceso rápido desde tu pantalla de inicio
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Cerrar"
          className="flex-shrink-0 flex items-center justify-center rounded-md transition-colors"
          style={{
            width: 28,
            height: 28,
            color: 'var(--color-text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Android / Chrome install button */}
      {state === 'android' && (
        <button
          onClick={handleInstall}
          className="flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: 'var(--color-accent-blue)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Download size={16} />
          Instalar aplicacion
        </button>
      )}

      {/* iOS instructions */}
      {state === 'ios' && (
        <div
          className="rounded-lg p-3 text-xs leading-relaxed space-y-1"
          style={{
            background: 'var(--color-bg-surface)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Como instalar en iPhone / iPad:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Toca el icono de{' '}
              <span style={{ color: 'var(--color-accent-blue)' }}>Compartir</span>{' '}
              <span aria-label="share icon">⬆</span> en Safari
            </li>
            <li>
              Selecciona{' '}
              <span style={{ color: 'var(--color-accent-blue)' }}>
                &ldquo;Agregar a pantalla de inicio&rdquo;
              </span>
            </li>
            <li>Toca &ldquo;Agregar&rdquo; para confirmar</li>
          </ol>
        </div>
      )}
    </div>
  )
}
