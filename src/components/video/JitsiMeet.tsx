'use client'

import { useState } from 'react'
import { buildJitsiEmbedUrl } from '@/lib/jitsi/config'

interface JitsiMeetProps {
  roomId: string
  displayName?: string
  subject?: string
  onClose?: () => void
}

export function JitsiMeet({ roomId, displayName, subject, onClose }: JitsiMeetProps) {
  const [isLoading, setIsLoading] = useState(true)

  const jitsiUrl = buildJitsiEmbedUrl(roomId, {
    displayName,
    subject,
    audioMuted: true,
    videoMuted: false,
  })

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{ height: '70vh', background: '#0a0e1a' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0e1a]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-500/30 border-t-amber-500 mx-auto mb-4" />
            <p className="text-white/40 text-sm">Conectando...</p>
            <p className="text-white/20 text-xs mt-1">Video HD + cancelacion de ruido</p>
          </div>
        </div>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold transition-all cursor-pointer bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm"
          aria-label="Cerrar reunion"
        >
          ✕
        </button>
      )}
      <iframe
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
        className="w-full h-full border-0"
        onLoad={() => setIsLoading(false)}
        title={`Reunion GEDEONES: ${roomId}`}
      />
    </div>
  )
}
