import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email-templates';

interface RegistroData {
  nombre: string;
  edad: string;
  telefono: string;
  email: string;
  direccion: string;
  ocupacion: string;
  estadoCivil: string;
  red: 'MENOR' | 'MEDIA' | 'MAYOR';
  password?: string;
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

    // Verificar duplicados: email Y telefono
    const emailNorm = body.email.toLowerCase();
    const phoneNorm = body.telefono.trim();

    const [existingEmail, existingPhone] = await Promise.all([
      prisma.user.findUnique({ where: { email: emailNorm } }),
      prisma.user.findFirst({ where: { phone: phoneNorm } }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Este email ya esta registrado' },
        { status: 409 }
      );
    }

    if (existingPhone) {
      return NextResponse.json(
        { message: 'Este telefono ya esta registrado' },
        { status: 409 }
      );
    }

    // Verificar que la red existe ANTES de crear usuario
    const red = await prisma.red.findFirst({ where: { tipo: body.red } });
    if (!red) {
      return NextResponse.json(
        { message: `La red ${body.red} no existe. Contacta al administrador.` },
        { status: 500 }
      );
    }

    // Usar contraseña del usuario si la provee, o generar temporal
    const temporalPassword = body.password?.trim() && body.password.length >= 6
      ? body.password
      : randomBytes(12).toString('base64url').slice(0, 12);
    const hashedPassword = await bcryptjs.hash(temporalPassword, 10);

    // Edad a fecha de nacimiento (aproximada)
    const birthYear = new Date().getFullYear() - edad;
    const birthDate = new Date(birthYear, 0, 1);

    // Transaccion atomica: User + Hermano + RedMember en una sola operacion
    // Protege contra registros duplicados concurrentes
    const { user, hermano } = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name: body.nombre.trim(),
          email: emailNorm,
          phone: phoneNorm,
          password: hashedPassword,
          role: 'HERMANO'
        }
      });

      const h = await tx.hermano.create({
        data: {
          userId: u.id,
          fechaNacimiento: birthDate,
          direccion: body.direccion.trim(),
          ocupacion: body.ocupacion.trim(),
          estadoCivil: body.estadoCivil.trim(),
          estado: 'NUEVO'
        }
      });

      await tx.redMember.create({
        data: { userId: u.id, redId: red.id }
      });

      return { user: u, hermano: h };
    });

    // Enviar email de bienvenida
    try {
      const html = welcomeEmail(user.name, body.red, user.email, temporalPassword)
      await sendEmail({
        to: user.email,
        subject: '¡Bienvenido a GEDEONES GP! - Tu Registro fue Exitoso',
        html,
      })
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
