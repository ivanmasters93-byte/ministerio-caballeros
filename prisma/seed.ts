import { PrismaClient, Role, TipoRed, EstadoHermano, TipoEvento, TipoAnuncio, Prioridad, TipoSeguimiento, EstadoCaso, EstadoPeticion, TipoDocumento, TipoVisita, EstadoCuota } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Helper to generate realistic Spanish/Hispanic names
const hermanoNames = [
  'Andrés Castro', 'Luis Ramírez', 'Oscar Jiménez', 'Mario Vargas', 'Samuel Reyes',
  'Fernando Guzmán', 'Rafael Cortés', 'Héctor Medina',
  // Additional 40+ names for comprehensive seed
  'Jorge Martínez', 'Ricardo Sánchez', 'Marcos López', 'Enrique Rodríguez', 'Alejandro García',
  'Diego Hernández', 'Manuel Córdoba', 'Sergio Romero', 'Raúl Flores', 'Javier Navarro',
  'Eduardo Reyna', 'Gustavo Rivas', 'Cristóbal Duran', 'Mateo Ceballos', 'Alfonso Vega',
  'Guillermo Salazar', 'Domingo Arias', 'Esteban Delgado', 'Faustino Blanco', 'Gilberto Molina',
  'Ignacio Pacheco', 'Joaquín Rosales', 'Marcelino Santos', 'Néstor Valenzuela', 'Octavio Miranda',
  'Patricio Campos', 'Querubín Santana', 'Ramón Castillo', 'Silvano Bravo', 'Tadeo Muñoz',
  'Úriel Garrido', 'Valentín Rojas', 'Wenceslao Moreno', 'Ximena Gómez', 'Yusef Núñez',
  'Zacarías Peralta', 'Benito Ochoa', 'Candelario Medrano', 'Delfiín Burgos', 'Ernesto Lara',
]

const hermanoOccupations = [
  'Ingeniero de software', 'Estudiante universitario', 'Contador', 'Maestro', 'Vendedor',
  'Empresario', 'Jubilado', 'Médico', 'Abogado', 'Mecánico', 'Electricista', 'Plomero',
  'Carpintero', 'Constructor', 'Agricultor', 'Enfermero', 'Técnico en informática',
  'Profesor de inglés', 'Transportista', 'Comerciante', 'Chef', 'Peluquero', 'Decorador',
]

const hermanoEstadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión libre']

async function main() {
  console.log('Seeding database...')

  const passwordHash = bcrypt.hashSync('admin123', 10)
  const now = new Date()

  // ---- USERS - LEADERS ----
  const javier = await prisma.user.upsert({
    where: { email: 'admin@gedeones.com' },
    update: {},
    create: {
      name: 'Javier Rodríguez',
      email: 'admin@gedeones.com',
      password: passwordHash,
      role: Role.LIDER_GENERAL,
      phone: '+50760000001',
    },
  })

  const carlos = await prisma.user.upsert({
    where: { email: 'carlos@gedeones.com' },
    update: {},
    create: {
      name: 'Carlos Mendoza',
      email: 'carlos@gedeones.com',
      password: passwordHash,
      role: Role.LIDER_RED,
      phone: '+50760000002',
    },
  })

  const pedro = await prisma.user.upsert({
    where: { email: 'pedro@gedeones.com' },
    update: {},
    create: {
      name: 'Pedro Alvarado',
      email: 'pedro@gedeones.com',
      password: passwordHash,
      role: Role.LIDER_RED,
      phone: '+50760000003',
    },
  })

  const roberto = await prisma.user.upsert({
    where: { email: 'roberto@gedeones.com' },
    update: {},
    create: {
      name: 'Roberto Sánchez',
      email: 'roberto@gedeones.com',
      password: passwordHash,
      role: Role.LIDER_RED,
      phone: '+50760000004',
    },
  })

  const miguel = await prisma.user.upsert({
    where: { email: 'miguel@gedeones.com' },
    update: {},
    create: {
      name: 'Miguel Torres',
      email: 'miguel@gedeones.com',
      password: passwordHash,
      role: Role.LIDER_RED,
      phone: '+50760000005',
    },
  })

  const antonio = await prisma.user.upsert({
    where: { email: 'antonio@gedeones.com' },
    update: {},
    create: {
      name: 'Antonio Flores',
      email: 'antonio@gedeones.com',
      password: passwordHash,
      role: Role.LIDER_RED,
      phone: '+50760000006',
    },
  })

  const juan = await prisma.user.upsert({
    where: { email: 'juan@gedeones.com' },
    update: {},
    create: {
      name: 'Juan Herrera',
      email: 'juan@gedeones.com',
      password: passwordHash,
      role: Role.LIDER_RED,
      phone: '+50760000007',
    },
  })

  const david = await prisma.user.upsert({
    where: { email: 'secretario@gedeones.com' },
    update: {},
    create: {
      name: 'David López',
      email: 'secretario@gedeones.com',
      password: passwordHash,
      role: Role.SECRETARIO,
      phone: '+50760000008',
    },
  })

  const felipe = await prisma.user.upsert({
    where: { email: 'asistente@gedeones.com' },
    update: {},
    create: {
      name: 'Felipe Morales',
      email: 'asistente@gedeones.com',
      password: passwordHash,
      role: Role.ASISTENTE,
      phone: '+50760000009',
    },
  })

  // ---- REDES ----
  const redMenor = await prisma.red.upsert({
    where: { id: 'red-menor' },
    update: {},
    create: {
      id: 'red-menor',
      nombre: 'Red Menor',
      tipo: TipoRed.MENOR,
      edadMin: 18,
      edadMax: 30,
      lideres: { connect: [{ id: carlos.id }, { id: pedro.id }] },
    },
  })

  const redMedia = await prisma.red.upsert({
    where: { id: 'red-media' },
    update: {},
    create: {
      id: 'red-media',
      nombre: 'Red Media',
      tipo: TipoRed.MEDIA,
      edadMin: 31,
      edadMax: 40,
      lideres: { connect: [{ id: roberto.id }, { id: miguel.id }] },
    },
  })

  const redMayor = await prisma.red.upsert({
    where: { id: 'red-mayor' },
    update: {},
    create: {
      id: 'red-mayor',
      nombre: 'Red Mayor',
      tipo: TipoRed.MAYOR,
      edadMin: 41,
      edadMax: 75,
      lideres: { connect: [{ id: antonio.id }, { id: juan.id }] },
    },
  })

  // ---- CREATE HERMANO USERS AND PROFILES ----
  const hermanoUsers = []
  const hermanoProfiles = []

  // Generate 40+ hermano users distributed by age groups
  for (let i = 0; i < hermanoNames.length; i++) {
    const name = hermanoNames[i]
    const email = `hermano${i + 1}@gedeones.com`
    const occupation = hermanoOccupations[i % hermanoOccupations.length]
    const estadoCivil = hermanoEstadosCiviles[i % hermanoEstadosCiviles.length]

    // Distribute evenly across age groups
    let birthYear, red
    if (i % 3 === 0) {
      // Red Menor (18-30)
      birthYear = 2000 - Math.floor(Math.random() * 12)
      red = redMenor
    } else if (i % 3 === 1) {
      // Red Media (31-40)
      birthYear = 1993 - Math.floor(Math.random() * 9)
      red = redMedia
    } else {
      // Red Mayor (41-75)
      birthYear = 1960 - Math.floor(Math.random() * 34)
      red = redMayor
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        password: passwordHash,
        role: Role.HERMANO,
        phone: `+5070${600000 + i}`,
      },
    })

    hermanoUsers.push({ user, email, red })

    // Create hermano profile
    const fechaNacimiento = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    const estadoArray = [EstadoHermano.ACTIVO, EstadoHermano.NUEVO, EstadoHermano.PENDIENTE, EstadoHermano.REQUIERE_SEGUIMIENTO, EstadoHermano.INACTIVO]
    const estado = estadoArray[i % estadoArray.length]

    const hermano = await prisma.hermano.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        estado,
        fechaNacimiento,
        direccion: `Calle ${i + 1} # ${100 + i}, Zona ${Math.floor(i / 10) + 1}`,
        ocupacion: occupation,
        estadoCivil,
        ultimaAsistencia: estado === EstadoHermano.ACTIVO ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        notas: estado === EstadoHermano.NUEVO ? `Llegó referido por ${hermanoNames[Math.floor(Math.random() * 8)]}` :
               estado === EstadoHermano.REQUIERE_SEGUIMIENTO ? 'Requiere seguimiento pastoral' : null,
      },
    })

    hermanoProfiles.push({ hermano, user, red })
  }

  // ---- RED MEMBERS ----
  for (const { user, red } of hermanoUsers) {
    await prisma.redMember.upsert({
      where: { userId_redId: { userId: user.id, redId: red.id } },
      update: {},
      create: {
        userId: user.id,
        redId: red.id,
      },
    })
  }

  // ---- EVENTOS ----
  const eventos = []

  // Past events
  const reunionPasada = await prisma.evento.create({
    data: {
      titulo: 'Reunión Semanal Red Menor',
      descripcion: 'Reunión de compañerismo y estudio bíblico para la Red Menor.',
      fecha: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      hora: '19:00',
      tipo: TipoEvento.REUNION,
      youtubeLink: 'https://youtube.com/watch?v=demo-reunion-menor',
      redId: redMenor.id,
      esRecurrente: true,
      patron: 'WEEKLY',
    },
  })
  eventos.push(reunionPasada)

  const cultoPasado = await prisma.evento.create({
    data: {
      titulo: 'Culto General del Ministerio',
      descripcion: 'Culto de adoración y predicación para todo el ministerio.',
      fecha: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      hora: '10:00',
      tipo: TipoEvento.CULTO,
      zoomLink: 'https://zoom.us/j/demo-culto-general',
      esRecurrente: false,
    },
  })
  eventos.push(cultoPasado)

  const retiroCapacitacion = await prisma.evento.create({
    data: {
      titulo: 'Capacitación de Liderazgo',
      descripcion: 'Capacitación para líderes sobre discipulado efectivo.',
      fecha: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      hora: '14:00',
      tipo: TipoEvento.CAPACITACION,
      redId: redMedia.id,
      esRecurrente: false,
    },
  })
  eventos.push(retiroCapacitacion)

  // Future events
  const retiroFuturo = await prisma.evento.create({
    data: {
      titulo: 'Retiro Espiritual Anual',
      descripcion: 'Retiro espiritual de 3 días para todos los hermanos del ministerio.',
      fecha: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      hora: '08:00',
      tipo: TipoEvento.RETIRO,
      esRecurrente: false,
    },
  })
  eventos.push(retiroFuturo)

  const reunionLideres = await prisma.evento.create({
    data: {
      titulo: 'Reunión de Líderes',
      descripcion: 'Reunión mensual de coordinación entre todos los líderes de red.',
      fecha: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      hora: '18:30',
      tipo: TipoEvento.REUNION,
      zoomLink: 'https://zoom.us/j/demo-lideres',
      esRecurrente: true,
      patron: 'MONTHLY',
    },
  })
  eventos.push(reunionLideres)

  const cultoDominical = await prisma.evento.create({
    data: {
      titulo: 'Culto Dominical',
      descripcion: 'Culto dominical regular del ministerio.',
      fecha: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      hora: '10:00',
      tipo: TipoEvento.CULTO,
      zoomLink: 'https://zoom.us/j/culto-domingo',
      esRecurrente: true,
      patron: 'WEEKLY',
    },
  })
  eventos.push(cultoDominical)

  const eventoSocial = await prisma.evento.create({
    data: {
      titulo: 'Almuerzo Confraternidad - Red Mayor',
      descripcion: 'Almuerzo de confraternidad y compañerismo para la Red Mayor.',
      fecha: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      hora: '12:00',
      tipo: TipoEvento.SOCIAL,
      redId: redMayor.id,
      esRecurrente: false,
    },
  })
  eventos.push(eventoSocial)

  // ---- ANUNCIOS ----
  await prisma.anuncio.createMany({
    data: [
      {
        titulo: 'Bienvenida a nuevos hermanos',
        contenido: 'Este mes damos la bienvenida a nuestros nuevos hermanos. ¡Que Dios los bendiga en su caminar con nosotros!',
        tipo: TipoAnuncio.GENERAL,
        prioridad: Prioridad.NORMAL,
        paraTodasRedes: true,
        activo: true,
      },
      {
        titulo: 'URGENTE: Cambio de horario culto dominical',
        contenido: 'El próximo domingo el culto iniciará a las 09:30 AM en lugar de las 10:00 AM debido a un evento especial.',
        tipo: TipoAnuncio.URGENTE,
        prioridad: Prioridad.URGENTE,
        paraTodasRedes: true,
        activo: true,
        expiraEn: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        titulo: 'Recordatorio: Retiro Espiritual',
        contenido: 'Recuerden inscribirse para el Retiro Espiritual Anual. Los cupos son limitados. Costo: $50 por persona.',
        tipo: TipoAnuncio.RECORDATORIO,
        prioridad: Prioridad.ALTA,
        paraTodasRedes: true,
        eventoId: retiroFuturo.id,
        activo: true,
      },
      {
        titulo: 'Estudio Bíblico Red Menor - Este viernes',
        contenido: 'Este viernes tenemos estudio bíblico. Traigan sus Biblias y cuadernos.',
        tipo: TipoAnuncio.EVENTO,
        prioridad: Prioridad.NORMAL,
        paraTodasRedes: false,
        redId: redMenor.id,
        activo: true,
      },
      {
        titulo: 'Ayuno y Oración - Red Mayor',
        contenido: 'Se convoca a todos los hermanos de la Red Mayor a un día de ayuno y oración este jueves.',
        tipo: TipoAnuncio.GENERAL,
        prioridad: Prioridad.ALTA,
        paraTodasRedes: false,
        redId: redMayor.id,
        activo: true,
      },
      {
        titulo: 'Reunión de Líderes próxima semana',
        contenido: 'Confirmen su asistencia a la reunión de líderes. Se tratarán temas de planificación para el segundo semestre.',
        tipo: TipoAnuncio.RECORDATORIO,
        prioridad: Prioridad.ALTA,
        paraTodasRedes: true,
        eventoId: reunionLideres.id,
        activo: true,
      },
      {
        titulo: 'Ofrenda especial para necesitados',
        contenido: 'Hacemos un llamado a contribuir con ofrenda especial para hermanos en necesidad. Cualquier monto es bienvenido.',
        tipo: TipoAnuncio.GENERAL,
        prioridad: Prioridad.NORMAL,
        paraTodasRedes: true,
        activo: true,
      },
      {
        titulo: 'Capacitación de Liderazgo completada',
        contenido: 'Gracias a todos los que asistieron a la capacitación. Los materiales están disponibles en la plataforma.',
        tipo: TipoAnuncio.GENERAL,
        prioridad: Prioridad.NORMAL,
        paraTodasRedes: false,
        redId: redMedia.id,
        activo: true,
      },
    ],
  })

  // ---- PETICIONES DE ORACIÓN ----
  const peticionesData = []
  for (let i = 0; i < 20; i++) {
    const hermano = hermanoProfiles[i % hermanoProfiles.length].hermano
    const leader = [carlos, pedro, roberto, miguel, antonio, juan][i % 6]
    const descriptions = [
      'Pido oración por mi trabajo. Estoy atravesando una situación difícil con mi empleador.',
      'Oración por mi familia. Necesito sabiduría para mis hijos.',
      'Oración por mi salud. He tenido problemas recientemente.',
      'Pido oración por mi matrimonio. Necesitamos fortalecer nuestra relación.',
      'Oración por mis finanzas. He perdido mi empleo recientemente.',
      'Pido oración para encontrar pareja cristiana. He estado orando por esto.',
      'Oración por mi padre que no es cristiano. Deseo su salvación.',
      'Pido oración por mis estudios. Tengo exámenes difíciles próximamente.',
      'Oración por mi hermano que está enfermo. Necesita milagro de sanidad.',
      'Pido oración por la iglesia. Que Dios nos guíe en decisiones importantes.',
    ]

    const prioridades = [Prioridad.BAJA, Prioridad.NORMAL, Prioridad.ALTA, Prioridad.URGENTE]
    const estados = [EstadoPeticion.ACTIVA, EstadoPeticion.EN_ORACION, EstadoPeticion.RESPONDIDA]

    peticionesData.push({
      hermanoId: hermano.id,
      descripcion: descriptions[i % descriptions.length],
      prioridad: prioridades[i % prioridades.length],
      estado: estados[i % estados.length],
      responsable: leader.id,
      privada: Math.random() > 0.7,
    })
  }

  await prisma.peticionOracion.createMany({
    data: peticionesData,
  })

  // ---- SEGUIMIENTOS ----
  const seguimientosData = []
  for (let i = 0; i < 25; i++) {
    const hermano = hermanoProfiles[i % hermanoProfiles.length].hermano
    const leader = [carlos, pedro, roberto, miguel, antonio, juan][i % 6]
    const tipos = [TipoSeguimiento.LLAMADA, TipoSeguimiento.VISITA, TipoSeguimiento.NOTA, TipoSeguimiento.ALERTA]
    const estados = [EstadoCaso.ABIERTO, EstadoCaso.EN_PROCESO, EstadoCaso.CERRADO]
    const descriptions = [
      'Llamada para verificar asistencia y bienestar general.',
      'Visita pastoral para conocer necesidades de la familia.',
      'Nota sobre progreso espiritual positivo.',
      'Alerta por inasistencia prolongada.',
      'Seguimiento de situación familiar delicada.',
      'Visita para oración en el hogar.',
      'Llamada de ánimo y motivación.',
      'Nota sobre nuevo compromiso con el ministerio.',
      'Alerta por comportamiento preocupante.',
      'Seguimiento de decisión de fe importante.',
    ]

    seguimientosData.push({
      hermanoId: hermano.id,
      tipo: tipos[i % tipos.length],
      descripcion: descriptions[i % descriptions.length],
      responsableId: leader.id,
      estado: estados[i % estados.length],
      proximoContacto: new Date(now.getTime() + (Math.random() * 30) * 24 * 60 * 60 * 1000),
      privado: Math.random() > 0.6,
    })
  }

  await prisma.seguimiento.createMany({
    data: seguimientosData,
  })

  // ---- ASISTENCIAS ----
  // Evento 1 - Red Menor
  const asistencia1 = await prisma.asistencia.create({
    data: {
      eventoId: reunionPasada.id,
      redId: redMenor.id,
      fecha: reunionPasada.fecha,
      total: 12,
      presentes: 10,
    },
  })

  const redMenorHermanos = hermanoProfiles.filter(h => h.red.id === redMenor.id).slice(0, 12)
  await prisma.asistenciaDetalle.createMany({
    data: redMenorHermanos.map((h, idx) => ({
      asistenciaId: asistencia1.id,
      hermanoId: h.hermano.id,
      presente: idx < 10,
      nota: idx >= 10 ? 'Ausente sin aviso' : undefined,
    })),
  })

  // Evento 2 - Culto General
  const asistencia2 = await prisma.asistencia.create({
    data: {
      eventoId: cultoPasado.id,
      redId: redMenor.id,
      fecha: cultoPasado.fecha,
      total: 12,
      presentes: 10,
    },
  })

  await prisma.asistenciaDetalle.createMany({
    data: redMenorHermanos.map((h, idx) => ({
      asistenciaId: asistencia2.id,
      hermanoId: h.hermano.id,
      presente: Math.random() > 0.2,
    })),
  })

  const asistencia3 = await prisma.asistencia.create({
    data: {
      eventoId: cultoPasado.id,
      redId: redMedia.id,
      fecha: cultoPasado.fecha,
      total: 15,
      presentes: 12,
    },
  })

  const redMediaHermanos = hermanoProfiles.filter(h => h.red.id === redMedia.id).slice(0, 15)
  await prisma.asistenciaDetalle.createMany({
    data: redMediaHermanos.map((h, idx) => ({
      asistenciaId: asistencia3.id,
      hermanoId: h.hermano.id,
      presente: Math.random() > 0.2,
    })),
  })

  const asistencia4 = await prisma.asistencia.create({
    data: {
      eventoId: cultoPasado.id,
      redId: redMayor.id,
      fecha: cultoPasado.fecha,
      total: 13,
      presentes: 11,
    },
  })

  const redMayorHermanos = hermanoProfiles.filter(h => h.red.id === redMayor.id).slice(0, 13)
  await prisma.asistenciaDetalle.createMany({
    data: redMayorHermanos.map((h, idx) => ({
      asistenciaId: asistencia4.id,
      hermanoId: h.hermano.id,
      presente: Math.random() > 0.15,
    })),
  })

  // ---- CUOTAS ----
  const cuotasData = []
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

  for (let i = 0; i < hermanoProfiles.length; i++) {
    const hermano = hermanoProfiles[i].hermano
    const estados = [EstadoCuota.PAGADA, EstadoCuota.PENDIENTE, EstadoCuota.PAGADA, EstadoCuota.PAGADA]

    // Current month
    cuotasData.push({
      hermanoId: hermano.id,
      monto: 25.0,
      mes: currentMonth,
      anio: currentYear,
      estado: estados[i % estados.length],
      concepto: 'Cuota ministerial mensual',
      creadoPor: carlos.id,
    })

    // Previous month
    cuotasData.push({
      hermanoId: hermano.id,
      monto: 25.0,
      mes: previousMonth,
      anio: previousYear,
      estado: EstadoCuota.PAGADA,
      concepto: 'Cuota ministerial mensual',
      creadoPor: carlos.id,
    })
  }

  await prisma.cuota.createMany({
    data: cuotasData,
  })

  // ---- META FINANCIERA ----
  await prisma.metaFinanciera.createMany({
    data: [
      {
        nombre: 'Meta general ministerio - Abril 2026',
        montoMeta: 2500.0,
        montoActual: 1850.5,
        mes: 4,
        anio: 2026,
        descripcion: 'Meta para cubrir gastos operacionales y actividades del mes.',
        activa: true,
      },
      {
        nombre: 'Meta Red Menor - Abril 2026',
        montoMeta: 600.0,
        montoActual: 480.0,
        mes: 4,
        anio: 2026,
        redId: redMenor.id,
        descripcion: 'Meta para actividades de la Red Menor.',
        activa: true,
      },
      {
        nombre: 'Meta Red Media - Abril 2026',
        montoMeta: 800.0,
        montoActual: 620.0,
        mes: 4,
        anio: 2026,
        redId: redMedia.id,
        descripcion: 'Meta para actividades de la Red Media.',
        activa: true,
      },
      {
        nombre: 'Meta Red Mayor - Abril 2026',
        montoMeta: 1100.0,
        montoActual: 750.5,
        mes: 4,
        anio: 2026,
        redId: redMayor.id,
        descripcion: 'Meta para actividades de la Red Mayor.',
        activa: true,
      },
    ],
  })

  // ---- DOCUMENTOS ----
  await prisma.documento.createMany({
    data: [
      {
        titulo: 'Devocional Mensual - Abril 2026',
        descripcion: 'Devocional mensual con lecturas bíblicas y reflexiones para abril.',
        tipo: TipoDocumento.DEVOCIONAL,
        url: 'https://drive.google.com/file/d/demo-devocional-abril',
        categoria: 'Devocionales',
        activo: true,
      },
      {
        titulo: 'Calendario de Actividades 2026',
        descripcion: 'Calendario oficial con todas las actividades del ministerio para el año 2026.',
        tipo: TipoDocumento.CALENDARIO,
        url: 'https://drive.google.com/file/d/demo-calendario-2026',
        categoria: 'Planificación',
        activo: true,
      },
      {
        titulo: 'Agenda Reunión de Líderes - Abril',
        descripcion: 'Agenda oficial para la reunión mensual de líderes de abril.',
        tipo: TipoDocumento.AGENDA,
        url: 'https://drive.google.com/file/d/demo-agenda-lideres-abril',
        categoria: 'Liderazgo',
        activo: true,
      },
      {
        titulo: 'Sermón: "El poder de la unidad"',
        descripcion: 'Grabación en YouTube del sermón del culto general.',
        tipo: TipoDocumento.ENLACE,
        url: 'https://youtube.com/watch?v=demo-sermon-unidad',
        categoria: 'Sermones',
        activo: true,
      },
      {
        titulo: 'Material de Capacitación: Discipulado Efectivo',
        descripcion: 'Materiales en PDF para la capacitación de liderazgo.',
        tipo: TipoDocumento.MATERIAL,
        url: 'https://drive.google.com/file/d/demo-material-discipulado',
        categoria: 'Capacitación',
        redId: redMedia.id,
        activo: true,
      },
      {
        titulo: 'Reglamento Interno del Ministerio',
        descripcion: 'Documento con las normas y reglamentos del ministerio.',
        tipo: TipoDocumento.PDF,
        url: 'https://drive.google.com/file/d/demo-reglamento-interno',
        categoria: 'Administrativa',
        activo: true,
      },
    ],
  })

  // ---- NOTIFICACIONES ----
  const notificacionesData = []
  for (let i = 0; i < 15; i++) {
    const tipos = ['ausencia', 'seguimiento', 'evento', 'anuncio', 'financiero']
    const severidades = ['info', 'warning', 'critical']
    const mensajes = [
      'Hermano Samuel no asistió al evento de esta semana',
      'Seguimiento pendiente para Hermano Rafael',
      'Recordatorio: Retiro Espiritual el próximo mes',
      'Nueva petición de oración requiere atención',
      'Cuota pendiente detectada',
      'Evento próximo: Reunión de Líderes',
      'Hermano requiere seguimiento pastoral',
      'Cumpleaños de Hermano Carlos esta semana',
      'Meta financiera en 75%',
      'Nuevo hermano requiere bienvenida formal',
    ]

    const userId = i % 2 === 0 ? [carlos.id, pedro.id, roberto.id, miguel.id][i % 4] : null

    notificacionesData.push({
      tipo: tipos[i % tipos.length],
      severidad: severidades[i % severidades.length],
      mensaje: mensajes[i % mensajes.length],
      leida: Math.random() > 0.4,
      userId,
      relatedId: hermanoProfiles[i % hermanoProfiles.length].hermano.id,
    })
  }

  await prisma.notificacion.createMany({
    data: notificacionesData,
  })

  // ---- MENSAJES WHATSAPP ----
  const mensajesData = []
  const direcciones = ['entrante', 'saliente']
  const tipos_mensaje = ['texto', 'template', 'interactivo']
  const estados_mensaje = ['enviado', 'entregado', 'leido', 'fallido']
  const mensajestexto = [
    'Hola hermano, cómo estás? Te vemos en la reunión?',
    'Recordatorio: Reunión de líderes mañana a las 6:30 PM',
    'Oración especial por tu situación. Que Dios te bendiga.',
    'Confirmamos tu asistencia al retiro espiritual.',
    'Tenemos un evento especial este sábado.',
    'Pedir oración por mi trabajo',
    'Gracias por tu llamada pastoral',
    'Necesito hablar contigo urgentemente',
    'Éxito en tus exámenes hermano',
    'Saludos desde la reunión de hoy',
  ]

  for (let i = 0; i < 20; i++) {
    const hermano = hermanoProfiles[i % hermanoProfiles.length]
    mensajesData.push({
      telefono: hermano.user.phone || '+50700000000',
      mensaje: mensajestexto[i % mensajestexto.length],
      direccion: direcciones[i % direcciones.length],
      estado: estados_mensaje[i % estados_mensaje.length],
      tipo: tipos_mensaje[i % tipos_mensaje.length],
      messageId: `msg-${i}`,
      userId: hermano.user.id,
    })
  }

  await prisma.mensajeWhatsApp.createMany({
    data: mensajesData,
  })

  // ---- PERMISOS ----
  const permisosData = []
  const recursos = ['seguimientos', 'cuotas', 'notificaciones', 'eventos', 'documentos', 'anuncios']
  const acciones = ['crear', 'leer', 'actualizar', 'eliminar']

  for (const leader of [carlos, pedro, roberto, miguel, antonio, juan]) {
    for (const recurso of recursos) {
      for (const accion of acciones) {
        permisosData.push({
          userId: leader.id,
          recurso,
          accion,
          permitido: true,
        })
      }
    }
  }

  await prisma.permiso.createMany({
    data: permisosData,
  })

  // ---- CHAT GRUPAL GENERAL ----
  const allUserIds = [
    javier.id, carlos.id, pedro.id, roberto.id, miguel.id, antonio.id, david.id,
    ...hermanoUsers.map((u: { id: string }) => u.id),
  ]

  const chatGrupal = await prisma.chatRoom.create({
    data: {
      nombre: 'GEDEONES General',
      tipo: 'GRUPO',
      descripcion: 'Chat general del ministerio de caballeros',
      miembros: {
        create: allUserIds.map(userId => ({ userId })),
      },
    },
  })

  // Welcome message
  await prisma.chatMessage.create({
    data: {
      roomId: chatGrupal.id,
      senderId: javier.id,
      content: 'Bienvenidos al chat general de GEDEONES GP. Aqui podemos comunicarnos como hermanos.',
    },
  })

  console.log(`Created chat grupal with ${allUserIds.length} members`)

  console.log('Seed completed successfully!')
  console.log(`Created users: 9 leaders + ${hermanoNames.length} hermanos`)
  console.log(`Created 3 Redes with distributed hermano members`)
  console.log(`Created ${eventos.length} events with attendance records`)
  console.log(`Created 20+ peticiones de oración`)
  console.log(`Created 25+ seguimientos`)
  console.log(`Created cuotas for all hermanos (current and previous month)`)
  console.log(`Created 4 metas financieras`)
  console.log(`Created 6 documentos`)
  console.log(`Created 15 notificaciones`)
  console.log(`Created 20 mensajes WhatsApp`)
  console.log(`Created permisos for all líderes`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
