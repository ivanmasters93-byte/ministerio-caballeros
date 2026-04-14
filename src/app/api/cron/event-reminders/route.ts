import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPushToAll } from '@/lib/push'

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this automatically for cron jobs)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const now = new Date()
  const results = { reminder24h: 0, reminder1h: 0, pushSent: 0, pushFailed: 0 }

  // --- 24h reminders: events between 23-25 hours from now ---
  const from24h = new Date(now.getTime() + 23 * 60 * 60 * 1000)
  const to24h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const events24h = await prisma.evento.findMany({
    where: {
      fecha: { gte: from24h, lte: to24h },
      reminder24hSent: false,
    },
  })

  for (const evento of events24h) {
    const hora = evento.hora || ''
    const push = await sendPushToAll({
      title: `Manana: ${evento.titulo}`,
      body: hora
        ? `Recuerda que manana tenemos ${evento.titulo} a las ${hora}. Te esperamos!`
        : `Recuerda que manana tenemos ${evento.titulo}. Te esperamos!`,
      url: '/agenda',
    })

    await prisma.notificacion.create({
      data: {
        tipo: 'evento',
        severidad: 'info',
        titulo: `Manana: ${evento.titulo}`,
        mensaje: hora
          ? `${evento.titulo} manana a las ${hora}`
          : `${evento.titulo} es manana`,
        userId: null,
        relatedId: evento.id,
      },
    })

    await prisma.evento.update({
      where: { id: evento.id },
      data: { reminder24hSent: true },
    })

    results.reminder24h++
    results.pushSent += push.sent
    results.pushFailed += push.failed
  }

  // --- 1h reminders: events between 30min-90min from now ---
  const from1h = new Date(now.getTime() + 30 * 60 * 1000)
  const to1h = new Date(now.getTime() + 90 * 60 * 1000)

  const events1h = await prisma.evento.findMany({
    where: {
      fecha: { gte: from1h, lte: to1h },
      reminder1hSent: false,
    },
  })

  for (const evento of events1h) {
    const hora = evento.hora || ''
    const links: string[] = []
    if (evento.zoomLink) links.push('Zoom disponible')
    if (evento.youtubeLink) links.push('YouTube disponible')
    if (evento.jitsiEnabled) links.push('Sala virtual disponible')
    const linksText = links.length > 0 ? ` - ${links.join(', ')}` : ''

    const push = await sendPushToAll({
      title: `En 1 hora: ${evento.titulo}`,
      body: hora
        ? `${evento.titulo} comienza a las ${hora}${linksText}. No faltes!`
        : `${evento.titulo} comienza pronto${linksText}. No faltes!`,
      url: '/agenda',
    })

    await prisma.notificacion.create({
      data: {
        tipo: 'evento',
        severidad: 'warning',
        titulo: `En 1 hora: ${evento.titulo}`,
        mensaje: hora
          ? `${evento.titulo} a las ${hora}${linksText}`
          : `${evento.titulo} comienza pronto${linksText}`,
        userId: null,
        relatedId: evento.id,
      },
    })

    await prisma.evento.update({
      where: { id: evento.id },
      data: { reminder1hSent: true },
    })

    results.reminder1h++
    results.pushSent += push.sent
    results.pushFailed += push.failed
  }

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    ...results,
  })
}
