import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import webpush from 'web-push'

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@gedeones.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { mensaje, titulo, hermanoIds, tipo } = await req.json()

  if (!mensaje || !hermanoIds?.length) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const hermanos = await prisma.hermano.findMany({
    where: { id: { in: hermanoIds } },
    select: { id: true, userId: true, user: { select: { name: true } } },
  })

  const remitenteNombre = session.user.name || 'Liderazgo'

  const notifData = hermanos.map(h => ({
    tipo: tipo || 'versiculo',
    severidad: 'info',
    titulo: titulo || 'Versiculo compartido',
    mensaje,
    userId: h.userId,
    relatedId: null as string | null,
    metadatos: JSON.stringify({ remitente: remitenteNombre, tipo: tipo || 'versiculo' }),
  }))

  await prisma.notificacion.createMany({ data: notifData })

  await prisma.notificacion.create({
    data: {
      tipo: tipo || 'versiculo',
      severidad: 'info',
      titulo: titulo || 'Versiculo enviado',
      mensaje,
      userId: null,
      metadatos: JSON.stringify({
        remitente: remitenteNombre,
        destinatarios: hermanos.length,
        tipo: tipo || 'versiculo',
      }),
    },
  })

  let pushSent = 0
  let pushFailed = 0

  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    const userIds = hermanos.map(h => h.userId)
    const subs = await prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    })

    const payload = JSON.stringify({
      title: titulo || 'Versiculo de Gedeones',
      body: mensaje.length > 120 ? mensaje.slice(0, 120) + '...' : mensaje,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: { url: '/notificaciones' },
    })

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          )
          pushSent++
        } catch (err: unknown) {
          pushFailed++
          if ((err as { statusCode?: number }).statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {})
          }
        }
      })
    )
  }

  return NextResponse.json({ ok: true, notificaciones: hermanos.length, pushSent, pushFailed })
}
