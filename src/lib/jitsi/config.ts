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
  return `gedeones-${slug}-${eventoId.slice(0, 8)}`
}

export function getJitsiUrl(roomId: string): string {
  return `https://${JITSI_DOMAIN}/${roomId}`
}
