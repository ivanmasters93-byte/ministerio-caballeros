import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/reset-seed
 * Borra TODOS los datos seed/prueba de la base de datos.
 * Mantiene: admin (Javier), líderes, y las 3 redes.
 * Requiere header: x-admin-key = NEXTAUTH_SECRET
 */
export async function POST(request: NextRequest) {
  // Security: accept key via header OR query param
  const adminKey = (request.headers.get('x-admin-key') || request.nextUrl.searchParams.get('key') || '').trim()
  const secret = (process.env.NEXTAUTH_SECRET || '').trim().replace(/\\n$/, '')

  if (!adminKey || !secret || adminKey !== secret) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  try {
    // Delete in correct order (FK constraints — children first)
    const results: Record<string, number> = {}

    // 1. Attendance details
    const attDetails = await prisma.asistenciaDetalle.deleteMany({})
    results.asistenciaDetalle = attDetails.count

    // 2. Attendance records
    const att = await prisma.asistencia.deleteMany({})
    results.asistencia = att.count

    // 3. Follow-up cases
    const seg = await prisma.seguimiento.deleteMany({})
    results.seguimiento = seg.count

    // 4. Visits
    const vis = await prisma.visita.deleteMany({})
    results.visita = vis.count

    // 5. Prayer requests
    const pet = await prisma.peticionOracion.deleteMany({})
    results.peticionOracion = pet.count

    // 6. Quotas/payments
    const cuotas = await prisma.cuota.deleteMany({})
    results.cuota = cuotas.count

    // 7. Financial goals
    const metas = await prisma.metaFinanciera.deleteMany({})
    results.metaFinanciera = metas.count

    // 8. Documents + embeddings
    const emb = await prisma.embeddingDocumento.deleteMany({})
    results.embeddingDocumento = emb.count

    const docs = await prisma.documento.deleteMany({})
    results.documento = docs.count

    // 9. WhatsApp messages
    const msgs = await prisma.mensajeWhatsApp.deleteMany({})
    results.mensajeWhatsApp = msgs.count

    // 10. Notifications
    const notifs = await prisma.notificacion.deleteMany({})
    results.notificacion = notifs.count

    // 11. Events
    const eventos = await prisma.evento.deleteMany({})
    results.evento = eventos.count

    // 12. Announcements
    const anuncios = await prisma.anuncio.deleteMany({})
    results.anuncio = anuncios.count

    // 13. Permissions
    const permisos = await prisma.permiso.deleteMany({})
    results.permiso = permisos.count

    // 14. Red members (for HERMANO users only)
    const redMembers = await prisma.redMember.deleteMany({
      where: { user: { role: 'HERMANO' } }
    })
    results.redMemberHermanos = redMembers.count

    // 15. Hermano profiles
    const hermanos = await prisma.hermano.deleteMany({})
    results.hermano = hermanos.count

    // 16. HERMANO users (keep leaders, admin, secretary, assistant)
    const users = await prisma.user.deleteMany({
      where: { role: 'HERMANO' }
    })
    results.userHermanos = users.count

    const totalDeleted = Object.values(results).reduce((a, b) => a + b, 0)

    return NextResponse.json({
      message: `Limpieza completada. ${totalDeleted} registros eliminados.`,
      details: results,
      kept: 'Admin + Lideres + Redes preservados'
    })
  } catch (error) {
    console.error('Error en limpieza:', error)
    return NextResponse.json(
      { message: 'Error durante la limpieza', error: String(error) },
      { status: 500 }
    )
  }
}

// GET is intentionally not exposed — use POST to prevent accidental resets via browser navigation.
