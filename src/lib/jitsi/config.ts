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

// Premium config params for Jitsi embed
export function getJitsiParams(opts: {
  displayName?: string
  subject?: string
  audioMuted?: boolean
  videoMuted?: boolean
}): URLSearchParams {
  const params = new URLSearchParams()

  if (opts.displayName) params.set('userInfo.displayName', opts.displayName)
  if (opts.subject) params.set('subject', opts.subject)

  // Audio: mic muted by default, noise cancellation ON
  params.set('config.startWithAudioMuted', String(opts.audioMuted ?? true))
  params.set('config.startWithVideoMuted', String(opts.videoMuted ?? false))

  // Skip pre-join screen for instant connection
  params.set('config.prejoinConfig.enabled', 'false')

  // HD video quality
  params.set('config.resolution', '720')
  params.set('config.constraints.video.height.ideal', '720')
  params.set('config.constraints.video.height.max', '1080')
  params.set('config.constraints.video.width.ideal', '1280')
  params.set('config.constraints.video.width.max', '1920')

  // Audio quality: noise suppression + echo cancellation
  params.set('config.enableNoisyMicDetection', 'true')
  params.set('config.disableAP', 'false')
  params.set('config.disableAEC', 'false')
  params.set('config.disableNS', 'false')
  params.set('config.disableAGC', 'false')
  params.set('config.disableHPF', 'false')
  params.set('config.stereo', 'false')
  params.set('config.enableLipSync', 'true')

  // Auto-quality adjust for slow connections
  params.set('config.enableLayerSuspension', 'true')
  params.set('config.channelLastN', '10')

  // Clean interface
  params.set('config.disableDeepLinking', 'true')
  params.set('config.hideConferenceSubject', 'false')
  params.set('config.disableInviteFunctions', 'true')
  params.set('config.disableThirdPartyRequests', 'true')
  params.set('config.disableRemoteMute', 'false')

  // UI branding
  params.set('interfaceConfig.SHOW_JITSI_WATERMARK', 'false')
  params.set('interfaceConfig.SHOW_BRAND_WATERMARK', 'false')
  params.set('interfaceConfig.SHOW_POWERED_BY', 'false')
  params.set('interfaceConfig.DEFAULT_BACKGROUND', '#0a0e1a')
  params.set('interfaceConfig.DISABLE_FOCUS_INDICATOR', 'true')
  params.set('interfaceConfig.MOBILE_APP_PROMO', 'false')
  params.set('interfaceConfig.HIDE_INVITE_MORE_HEADER', 'true')

  return params
}

export function buildJitsiEmbedUrl(roomId: string, opts: Parameters<typeof getJitsiParams>[0] = {}): string {
  const params = getJitsiParams(opts)
  return `https://${JITSI_DOMAIN}/${roomId}#${params.toString()}`
}
