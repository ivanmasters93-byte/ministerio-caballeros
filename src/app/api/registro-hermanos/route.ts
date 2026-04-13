import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/mailgun';

interface RegistroData {
  nombre: string;
  edad: string;
  telefono: string;
  email: string;
  direccion: string;
  ocupacion: string;
  estadoCivil: string;
  red: 'MENOR' | 'MEDIA' | 'MAYOR';
}

// Validar rango de edad según red
function getRedFromAge(edad: number): 'MENOR' | 'MEDIA' | 'MAYOR' {
  if (edad >= 18 && edad <= 30) return 'MENOR';
  if (edad >= 31 && edad <= 40) return 'MEDIA';
  return 'MAYOR';
}

export async function POST(request: NextRequest) {
  try {
    const body: RegistroData = await request.json();

    // Validaciones básicas
    if (!body.nombre?.trim()) {
      return NextResponse.json(
        { message: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const edad = parseInt(body.edad);
    if (isNaN(edad) || edad < 18 || edad > 100) {
      return NextResponse.json(
        { message: 'La edad debe ser válida (18-100)' },
        { status: 400 }
      );
    }

    if (!body.telefono?.trim()) {
      return NextResponse.json(
        { message: 'El teléfono es requerido' },
        { status: 400 }
      );
    }

    if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { message: 'El email no es válido' },
        { status: 400 }
      );
    }

    if (!body.direccion?.trim()) {
      return NextResponse.json(
        { message: 'La dirección es requerida' },
        { status: 400 }
      );
    }

    if (!body.ocupacion?.trim()) {
      return NextResponse.json(
        { message: 'La ocupación es requerida' },
        { status: 400 }
      );
    }

    if (!body.estadoCivil?.trim()) {
      return NextResponse.json(
        { message: 'El estado civil es requerido' },
        { status: 400 }
      );
    }

    if (!['MENOR', 'MEDIA', 'MAYOR'].includes(body.red)) {
      return NextResponse.json(
        { message: 'La red seleccionada no es válida' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    // Generar contraseña temporal
    const temporalPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcryptjs.hash(temporalPassword, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name: body.nombre.trim(),
        email: body.email.toLowerCase(),
        phone: body.telefono.trim(),
        password: hashedPassword,
        role: 'HERMANO'
      }
    });

    // Convertir edad a fecha de nacimiento (aproximada)
    const birthYear = new Date().getFullYear() - edad;
    const birthDate = new Date(birthYear, 0, 1);

    // Crear perfil de hermano
    const hermano = await prisma.hermano.create({
      data: {
        userId: user.id,
        fechaNacimiento: birthDate,
        direccion: body.direccion.trim(),
        ocupacion: body.ocupacion.trim(),
        estadoCivil: body.estadoCivil.trim(),
        estado: 'NUEVO'
      }
    });

    // Obtener la red — OBLIGATORIO
    const red = await prisma.red.findFirst({
      where: { tipo: body.red }
    });

    if (!red) {
      // Red no existe — limpiar usuario/hermano creados y retornar error
      await prisma.hermano.delete({ where: { id: hermano.id } });
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { message: `La red ${body.red} no existe. Contacta al administrador.` },
        { status: 500 }
      );
    }

    // Agregar a la red
    await prisma.redMember.create({
      data: {
        userId: user.id,
        redId: red.id
      }
    });

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail({
        email: user.email,
        name: user.name,
        temporalPassword,
        red: body.red
      });
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      // No fallar si hay error en email, solo registrar
    }

    // Retornar éxito
    return NextResponse.json(
      {
        message: 'Registro exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          hermano: hermano
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);

    // Errores de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { message: 'Este email ya está registrado' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Error en el registro. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Este endpoint solo acepta POST' },
    { status: 405 }
  );
}
