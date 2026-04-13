'use client'

import { buildJitsiEmbedUrl } from '@/lib/jitsi/config'
import { Video, ExternalLink } from 'lucide-react'

interface JitsiMeetProps {
  roomId: string
  displayName?: string
  subject?: string
  onClose?: () => void
}

export function JitsiMeet({ roomId, displayName, subject, onClose }: JitsiMeetProps) {
  const jitsiUrl = buildJitsiEmbedUrl(roomId, {
    displayName,
    subject,
    audioMuted: true,
    videoMuted: false,
  })

  const openMeeting = () => {
    window.open(jitsiUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden p-6 text-center space-y-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-green-500/10">
        <Video size={24} className="text-green-400" />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Reunion activa: {subject || roomId}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Se abrira en una nueva ventana con video HD y cancelacion de ruido
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={openMeeting}
          className="px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-900/20"
        >
          <ExternalLink size={16} />
          Abrir Videollamada
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl text-sm transition-all text-white/40 hover:text-white/70"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  )
}
