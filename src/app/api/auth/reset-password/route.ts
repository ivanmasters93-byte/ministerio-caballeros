import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: 'Token y contrasena requeridos' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'La contrasena debe tener al menos 6 caracteres' }, { status: 400 })
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!resetToken) {
    return NextResponse.json({ error: 'Enlace invalido o expirado' }, { status: 400 })
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
    return NextResponse.json({ error: 'El enlace ha expirado. Solicita uno nuevo.' }, { status: 400 })
  }

  // Update password
  const hashedPassword = bcrypt.hashSync(password, 10)
  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword },
  })

  // Delete used token
  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })

  return NextResponse.json({ message: 'Contrasena actualizada correctamente' })
}
