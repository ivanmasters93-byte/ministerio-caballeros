// Free Jitsi server — NO login required, NO account needed
export const JITSI_DOMAIN = 'meet.calyx.net'

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
  return `gedeones-${slug}-${eventoId.slice(0, 8)}`
}

export function getJitsiUrl(roomId: string): string {
  return `https://${JITSI_DOMAIN}/${roomId}`
}

// Build clean Jitsi URL — minimal params for maximum compatibility
export function buildJitsiEmbedUrl(roomId: string, opts: {
  displayName?: string
  subject?: string
  audioMuted?: boolean
  videoMuted?: boolean
} = {}): string {
  const params = new URLSearchParams()

  if (opts.displayName) params.set('userInfo.displayName', opts.displayName)
  params.set('config.startWithAudioMuted', String(opts.audioMuted ?? true))
  params.set('config.startWithVideoMuted', String(opts.videoMuted ?? false))
  params.set('config.prejoinConfig.enabled', 'false')
  params.set('config.disableDeepLinking', 'true')

  return `https://${JITSI_DOMAIN}/${roomId}#${params.toString()}`
}
