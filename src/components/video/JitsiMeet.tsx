'use client'

import { useState } from 'react'

interface JitsiMeetProps {
  roomId: string
  displayName?: string
  subject?: string
  onClose?: () => void
}

export function JitsiMeet({ roomId, displayName, subject, onClose }: JitsiMeetProps) {
  const [isLoading, setIsLoading] = useState(true)

  const params = new URLSearchParams()
  if (displayName) params.set('userInfo.displayName', displayName)
  if (subject) params.set('subject', subject)
  params.set('config.startWithAudioMuted', 'true')
  params.set('config.startWithVideoMuted', 'true')
  params.set('config.prejoinConfig.enabled', 'true')
  params.set('config.disableDeepLinking', 'true')
  params.set('interfaceConfig.SHOW_JITSI_WATERMARK', 'false')
  params.set('interfaceConfig.DEFAULT_BACKGROUND', '#1e293b')

  const jitsiUrl = `https://meet.jit.si/${roomId}#${params.toString()}`

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{ height: '70vh', background: 'var(--color-bg-base)' }}
    >
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: 'var(--color-bg-base)' }}
        >
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: 'var(--color-accent-gold)' }}
            />
            <p style={{ color: 'var(--color-text-secondary)' }}>Conectando a la reunion...</p>
          </div>
        </div>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          style={{
            background: 'var(--color-accent-red)',
            color: '#fff',
          }}
          aria-label="Cerrar reunion"
        >
          x
        </button>
      )}
      <iframe
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
        className="w-full h-full border-0"
        onLoad={() => setIsLoading(false)}
        title={`Reunion Jitsi: ${roomId}`}
      />
    </div>
  )
}
