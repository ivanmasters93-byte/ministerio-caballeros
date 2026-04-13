'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallState = 'hidden' | 'android' | 'ios' | 'installed'

const DISMISS_KEY = 'pwa-prompt-dismissed-until'
const DISMISS_HOURS = 24

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false
  const until = localStorage.getItem(DISMISS_KEY)
  if (!until) return false
  return Date.now() < parseInt(until, 10)
}

function setDismissed(): void {
  const until = Date.now() + DISMISS_HOURS * 60 * 60 * 1000
  localStorage.setItem(DISMISS_KEY, String(until))
}

// Cross / sword icon representing GEDEONES ministry
function GedeonesCrossIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      {/* Vertical bar */}
      <rect x="12" y="2" width="4" height="24" rx="2" fill="#c9a84c" />
      {/* Horizontal bar */}
      <rect x="4" y="10" width="20" height="4" rx="2" fill="#c9a84c" />
    </svg>
  )
}

export function InstallPrompt() {
  const [state, setState] = useState<InstallState>('hidden')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isDismissed()) return

    // Already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (isStandalone) {
      setState('installed')
      return
    }

    // iOS Safari detection
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    if (isIOS && isSafari) {
      // Show after 3 seconds
      const timer = setTimeout(() => {
        setState('ios')
        setVisible(true)
      }, 3000)
      return () => clearTimeout(timer)
    }

    // Android / Chrome – listen for native install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      const timer = setTimeout(() => {
        setState('android')
        setVisible(true)
      }, 3000)
      // Store timer id reference for cleanup isn't straightforward here;
      // the event fires once so it's fine to just let it run.
      return () => clearTimeout(timer)
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
    } else {
      handleDismiss()
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    setDismissed()
    // Allow exit animation then hide
    setTimeout(() => setState('hidden'), 400)
  }

  if (state === 'hidden' || state === 'installed') return null

  return (
    <div
      role="banner"
      aria-label="Instalar aplicacion"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-0 flex justify-center"
      style={{
        // Push up from bottom when visible, hide off-screen when not
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl flex flex-col gap-4 p-5"
        style={{
          background: 'linear-gradient(160deg, #1a1e2e 0%, #0f1220 100%)',
          border: '1px solid rgba(201,168,76,0.25)',
          boxShadow: '0 -4px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)',
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* GEDEONES cross icon in golden circle */}
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-2xl"
              style={{
                width: 56,
                height: 56,
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.3)',
              }}
            >
              <GedeonesCrossIcon />
            </div>

            <div>
              <p
                className="font-bold leading-tight"
                style={{ color: '#c9a84c', fontSize: 18 }}
              >
                GEDEONES
              </p>
              <p
                className="leading-snug mt-1"
                style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, maxWidth: 220 }}
              >
                Agrega GEDEONES a tu pantalla de inicio para acceso rapido
              </p>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            aria-label="Cerrar"
            className="flex-shrink-0 flex items-center justify-center rounded-xl transition-colors"
            style={{
              width: 36,
              height: 36,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              marginTop: 2,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Android: big golden install button */}
        {state === 'android' && (
          <button
            onClick={handleInstall}
            className="flex items-center justify-center gap-3 w-full rounded-2xl font-bold tracking-wide transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #d4a843 0%, #c9a84c 50%, #b8963f 100%)',
              color: '#0a0e1a',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              padding: '16px 24px',
              boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
            }}
          >
            <Download size={22} strokeWidth={2.5} />
            Instalar aplicacion
          </button>
        )}

        {/* iOS: visual step-by-step guide */}
        {state === 'ios' && (
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p
              className="font-semibold"
              style={{ color: '#f0f0f5', fontSize: 16 }}
            >
              Como instalar en tu iPhone o iPad:
            </p>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full font-bold"
                  style={{
                    width: 32, height: 32,
                    background: 'rgba(201,168,76,0.15)',
                    border: '1px solid rgba(201,168,76,0.35)',
                    color: '#c9a84c',
                    fontSize: 15,
                  }}
                >
                  1
                </div>
                <div className="flex items-center gap-2">
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
                    Toca el boton de
                  </p>
                  {/* iOS Share icon inline */}
                  <span
                    className="inline-flex items-center justify-center rounded-md px-2 py-0.5"
                    style={{
                      background: 'rgba(91,141,239,0.15)',
                      border: '1px solid rgba(91,141,239,0.3)',
                      fontSize: 18,
                      lineHeight: 1,
                    }}
                    aria-label="compartir"
                  >
                    ⬆
                  </span>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
                    en Safari
                  </p>
                </div>
              </div>

              {/* Arrow between steps */}
              <div className="pl-4" style={{ color: 'rgba(201,168,76,0.4)', fontSize: 20, lineHeight: 1 }}>↓</div>

              {/* Step 2 */}
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full font-bold"
                  style={{
                    width: 32, height: 32,
                    background: 'rgba(201,168,76,0.15)',
                    border: '1px solid rgba(201,168,76,0.35)',
                    color: '#c9a84c',
                    fontSize: 15,
                  }}
                >
                  2
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
                  Selecciona{' '}
                  <span style={{ color: '#c9a84c', fontWeight: 600 }}>
                    &ldquo;Agregar a pantalla de inicio&rdquo;
                  </span>
                </p>
              </div>

              {/* Arrow between steps */}
              <div className="pl-4" style={{ color: 'rgba(201,168,76,0.4)', fontSize: 20, lineHeight: 1 }}>↓</div>

              {/* Step 3 */}
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full font-bold"
                  style={{
                    width: 32, height: 32,
                    background: 'rgba(201,168,76,0.15)',
                    border: '1px solid rgba(201,168,76,0.35)',
                    color: '#c9a84c',
                    fontSize: 15,
                  }}
                >
                  3
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
                  Toca{' '}
                  <span style={{ color: '#c9a84c', fontWeight: 600 }}>
                    &ldquo;Agregar&rdquo;
                  </span>{' '}
                  para confirmar
                </p>
              </div>
            </div>

            {/* Dismiss text link */}
            <button
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                fontSize: 13,
                cursor: 'pointer',
                marginTop: 4,
                padding: 0,
              }}
            >
              Ahora no
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
