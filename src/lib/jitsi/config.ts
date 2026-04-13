// Public Jitsi server — simple URL, no login required when accessed directly
export const JITSI_DOMAIN = 'meet.jit.si'

export interface JitsiConfig {
  roomName: string
  displayName?: string
  subject?: string
  password?: string
  startWithAudioMuted?: boolean
  startWithVideoMuted?: boolean
}

export function generateRoomId(eventoId: string, titulo: string): string {
  const slug = titulo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `GedeonesSala${slug}-${eventoId.slice(0, 8)}`
}

export function getJitsiUrl(roomId: string): string {
  return `https://${JITSI_DOMAIN}/${roomId}`
}

// SIMPLE URL — no config params = no login required on meet.jit.si
// subject, audioMuted, videoMuted accepted for backward compatibility but not appended as params
export function buildJitsiEmbedUrl(roomId: string, opts: {
  displayName?: string
  subject?: string
  audioMuted?: boolean
  videoMuted?: boolean
} = {}): string {
  const base = `https://${JITSI_DOMAIN}/${roomId}`
  if (opts.displayName) {
    return `${base}#userInfo.displayName="${encodeURIComponent(opts.displayName)}"`
  }
  return base
}
