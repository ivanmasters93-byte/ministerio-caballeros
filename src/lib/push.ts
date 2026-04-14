import webpush from 'web-push'
import prisma from '@/lib/prisma'

let vapidConfigured = false

function ensureVapid() {
  if (vapidConfigured) return true
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return false
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@gedeones.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
  vapidConfigured = true
  return true
}

interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
  badge?: string
}

interface PushResult {
  sent: number
  failed: number
}

/**
 * Send push notification to ALL subscribed users
 */
export async function sendPushToAll(payload: PushPayload): Promise<PushResult> {
  if (!ensureVapid()) return { sent: 0, failed: 0 }

  const subs = await prisma.pushSubscription.findMany()
  if (subs.length === 0) return { sent: 0, failed: 0 }

  const jsonPayload = JSON.stringify({
    title: payload.title,
    body: payload.body.length > 120 ? payload.body.slice(0, 120) + '...' : payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-72x72.png',
    data: { url: payload.url || '/' },
  })

  let sent = 0
  let failed = 0

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          jsonPayload,
        )
        sent++
      } catch (err: unknown) {
        failed++
        if ((err as { statusCode?: number }).statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {})
        }
      }
    })
  )

  return { sent, failed }
}

/**
 * Send push notification to specific users by userId
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<PushResult> {
  if (!ensureVapid()) return { sent: 0, failed: 0 }

  const subs = await prisma.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  })
  if (subs.length === 0) return { sent: 0, failed: 0 }

  const jsonPayload = JSON.stringify({
    title: payload.title,
    body: payload.body.length > 120 ? payload.body.slice(0, 120) + '...' : payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-72x72.png',
    data: { url: payload.url || '/' },
  })

  let sent = 0
  let failed = 0

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          jsonPayload,
        )
        sent++
      } catch (err: unknown) {
        failed++
        if ((err as { statusCode?: number }).statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {})
        }
      }
    })
  )

  return { sent, failed }
}
