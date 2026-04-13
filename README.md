# 🙏 MINISTERIO DE CABALLEROS - Plataforma Integral

**Plataforma de gestión centralizada para ministerios de caballeros con comunicación integrada, seguimiento pastoral y asistente de IA conversacional.**

---

## 📖 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características](#características)
- [Instalación Rápida](#instalación-rápida)
- [Stack Técnico](#stack-técnico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos Principales](#módulos-principales)
- [API Documentation](#api-documentation)
- [Configuración de Integraciónes](#configuración-de-integraciones)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contribuciones](#contribuciones)

---

## 🎯 Descripción General

La **Plataforma de Ministerio de Caballeros** es una solución empresarial diseñada para gestionar comunidades ministeriales de caballeros. Proporciona herramientas para:

✅ Gestionar 3 redes de caballeros por rango de edad
✅ Administrar líderes, secretarios, asistentes y hermanos
✅ Centralizar comunicación mediante anuncios y eventos
✅ Registrar asistencia y seguimiento pastoral
✅ Gestionar peticiones de oración y necesidades
✅ Almacenar documentos y recursos compartidos
✅ Integración con Asistente IA conversacional
✅ Integración con WhatsApp Business API (opcional)
✅ Control granular de permisos y roles

---

## ✨ Características Principales

### 📊 Dashboard Inteligente
- Vista general de estadísticas ministeriales
- Indicadores de salud de redes
- Alertas de hermanos inactivos
- Resumen de peticiones pendientes
- Gráficos de participación

### 👥 Gestión de Redes
- **Red Menor** (18-30 años) - Crecimiento espiritual
- **Red Media** (31-40 años) - Madurez y liderazgo
- **Red Mayor** (41-75 años) - Sabiduría y mentoría

Cada red tiene:
- Líderes asignados
- Hermanos asociados
- Eventos y actividades
- Anuncios específicos
- Reportes de asistencia

### 👨‍💼 Gestión de Hermanos
- Perfiles completos con:
  - Información demográfica
  - Estado de participación
  - Historial de asistencia
  - Notas pastorales
  - Peticiones de oración
  - Registro de visitas
  - Cumpleaños y fechas especiales

Estados soportados:
- ✅ Activo
- 🆕 Nuevo
- ⏳ Pendiente
- ⚠️ Requiere Seguimiento
- ❌ Inactivo

### 📅 Calendario & Eventos
- Crear eventos (reuniones, cultos, retiros, capacitaciones)
- Programar eventos recurrentes
- Asociar enlaces de Zoom y YouTube
- Crear anuncios ligados a eventos
- Recordatorios automáticos
- Vistas diarias, semanales, mensuales

### 📢 Comunicación Centralizada
- Anuncios por red o globales
- Prioridades (Baja, Normal, Alta, Urgente)
- Programación de publicaciones
- Fechas de expiración
- Historial y auditoría
- Integración con WhatsApp

### 📋 Asistencia & Seguimiento
- Registro manual de asistencia
- Historial por hermano y evento
- Detección automática de ausencias
- Alertas por múltiples faltas
- Análisis de tendencias de participación

### 🧭 Seguimiento Pastoral
- Casos abiertos y cerrados
- Tipos: Llamada, Visita, Nota, Alerta
- Asignación de responsable
- Próxima fecha de contacto
- Notas privadas
- Historial de acciones

### 🙏 Peticiones de Oración
- Crear peticiones (espirituales, familiares, médicas, económicas)
- Niveles de prioridad
- Asignación de responsable
- Estados: Activa, En Oración, Respondida, Cerrada
- Opción de privacidad
- Seguimiento

### 🏥 Visitas & Contactos
- Registrar visitas pastorales
- Tipos: Pastoral, Social, Emergencia
- Responsable asignado
- Notas del encuentro
- Historial completo

### 📚 Centro Documental
- Devocionales
- Calendarios ministeriales
- Agendas
- PDFs y recursos
- Materiales autorizados
- Búsqueda y filtros
- Control de acceso por rol

### 🤖 Asistente IA
- Responde consultas sobre:
  - Próximos eventos
  - Agenda semanal
  - Anuncios importantes
  - Información de redes
  - Recursos disponibles
  - Horarios y enlaces
- Contextualizado con datos reales del sistema
- Escalado automático de asuntos sensibles
- Disponible 24/7

### 💰 Gestión Financiera
- Registro de cuotas
- Metas financieras
- Reportes de recaudación
- Seguimiento de pagos

### 🔐 Control de Acceso
**Roles:**
- **Líder General** - Acceso total y control de permisos
- **Líder de Red** - Gestiona su red asignada
- **Secretario** - Operaciones administrativas
- **Asistente** - Soporte operativo
- **Hermano** - Acceso limitado

**Permisos granulares por:**
- Recurso (Hermanos, Redes, Eventos, etc)
- Acción (Crear, Leer, Actualizar, Eliminar)

---

## 🚀 Instalación Rápida

### Requisitos
- Node.js 18+ 
- npm 9+
- Navegador moderno

### Pasos

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd ministerio-caballeros

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. (Opcional) Generar cliente Prisma y seed
# En ambiente con internet:
npx prisma generate
npx prisma db seed

# 5. Iniciar servidor
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Stack Técnico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Framework** | Next.js | 16.2.3 |
| **Lenguaje** | TypeScript | 5 |
| **ORM** | Prisma | 7.7.0 |
| **Autenticación** | NextAuth.js | 5.0.0-beta |
| **Database** | SQLite | 3 |
| **Styling** | Tailwind CSS | 4 |
| **UI Components** | Shadcn/ui | Latest |
| **Icons** | Lucide React | 1.8.0 |
| **Validación** | Zod | 4.3.6 |
| **IA** | Anthropic SDK | 0.87.0 |
| **Encriptación** | bcryptjs | 3.0.3 |

---

## 📁 Estructura del Proyecto

```
ministerio-caballeros/
├── src/
│   ├── app/
│   │   ├── (auth)/                # 🔐 Páginas de autenticación
│   │   │   └── login/
│   │   ├── (dashboard)/           # 📊 Páginas del dashboard
│   │   │   ├── page.tsx           # Dashboard principal
│   │   │   ├── redes/             # Gestión de redes
│   │   │   ├── hermanos/          # Hermanos (CRUD, búsqueda)
│   │   │   ├── eventos/           # Calendario y eventos
│   │   │   ├── asistencia/        # Registro de asistencia
│   │   │   ├── seguimiento/       # Casos pastorales
│   │   │   ├── oracion/           # Peticiones de oración
│   │   │   ├── visitas/           # Registro de visitas
│   │   │   ├── anuncios/          # Comunicación
│   │   │   ├── documentos/        # Centro de recursos
│   │   │   ├── asistente-ia/      # Chat con IA
│   │   │   ├── whatsapp/          # Configuración WhatsApp
│   │   │   ├── finanzas/          # Gestión financiera
│   │   │   ├── roles/             # Control de permisos
│   │   │   ├── layout.tsx         # Layout compartido
│   │   │   └── page.tsx           # Índice del dashboard
│   │   ├── api/                   # 🔌 API Routes
│   │   │   ├── hermanos/          # /api/hermanos, [id]
│   │   │   ├── redes/             # /api/redes, [id]
│   │   │   ├── eventos/           # /api/eventos, [id]
│   │   │   ├── asistencia/        # /api/asistencia
│   │   │   ├── seguimiento/       # /api/seguimiento, [id]
│   │   │   ├── oracion/           # /api/oracion, [id]
│   │   │   ├── visitas/           # /api/visitas
│   │   │   ├── anuncios/          # /api/anuncios, [id]
│   │   │   ├── documentos/        # /api/documentos, [id]
│   │   │   ├── dashboard/         # /api/dashboard/stats
│   │   │   ├── ai/                # /api/ai/chat
│   │   │   ├── whatsapp/          # /api/whatsapp/*
│   │   │   ├── roles/             # /api/roles, /permisos
│   │   │   ├── finanzas/          # /api/finanzas
│   │   │   └── auth/              # /api/auth/[nextauth]
│   │   └── layout.tsx             # Layout global
│   ├── components/                # 🧩 Componentes reutilizables
│   │   ├── ui/                    # Base components (Button, Card, etc)
│   │   ├── layout/                # Header, Sidebar, DashboardLayout
│   │   ├── hermanos/              # Componentes de hermanos
│   │   ├── redes/                 # Componentes de redes
│   │   ├── ia/                    # Componentes de IA
│   │   └── ...otros/
│   └── lib/                       # 📚 Librerías y utilidades
│       ├── ai/                    # Asistente de IA
│       │   ├── assistant.ts       # Lógica de IA
│       │   └── prompts.ts         # Prompts del sistema
│       ├── whatsapp/              # Integración WhatsApp
│       │   ├── service.ts
│       │   └── webhook.ts
│       ├── auth.ts                # Configuración NextAuth
│       ├── permissions.ts         # Control de permisos
│       ├── validations.ts         # Esquemas Zod
│       ├── api-helpers.ts         # Utilidades para APIs
│       ├── notifications.ts       # Sistema de notificaciones
│       ├── prisma.ts              # Cliente de Prisma
│       └── utils.ts               # Utilidades generales
├── prisma/
│   ├── schema.prisma              # 🗄️ Esquema de BD
│   └── seed.ts                    # 🌱 Datos iniciales
├── public/                        # 🖼️ Assets estáticos
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.example                   # ⚙️ Variables de entorno
├── SETUP.md                       # 📋 Guía de setup
├── README.md                      # 📖 Este archivo
└── ARCHITECTURE.md                # 🏗️ Documentación de arquitectura
```

---

## 🎯 Módulos Principales

### 1. Autenticación (`/src/lib/auth.ts`)
- NextAuth con credenciales (email/contraseña)
- JWT sessions
- Roles embebidos en token
- Callbacks personalizados

```typescript
// Usuarios demo
admin@ministerio.com / admin123   (Líder General)
carlos@ministerio.com / admin123  (Líder Red)
hermano@ministerio.com / admin123 (Hermano)
```

### 2. Autorización (`/src/lib/permissions.ts`)
- Control por rol y recurso
- Acciones: CREAR, LEER, ACTUALIZAR, ELIMINAR
- Validación en cada API route

### 3. Base de Datos (`prisma/schema.prisma`)
25+ modelos incluyendo:
- User, Hermano, Red
- Evento, Anuncio, Asistencia
- Seguimiento, Visita, PeticionOracion
- Documento, Cuota, MetaFinanciera
- MensajeWhatsApp, Notificacion

### 4. API Layer (`src/app/api/*`)
- RESTful endpoints
- Error handling centralizado
- Validación de esquemas
- Autenticación y autorización
- Paginación

### 5. IA Conversacional (`src/lib/ai/*`)
- Integración Anthropic SDK
- Context building en tiempo real
- System prompt contextualizado
- Mock responses para desarrollo
- Escalado automático

### 6. Integración WhatsApp (`src/lib/whatsapp/*`)
- Webhooks para entrada
- Servicio de envío
- Mock provider para desarrollo
- Integración con IA

---

## 🔌 API Documentation

### Autenticación

**POST** `/api/auth/callback/credentials`
```json
{
  "email": "usuario@ministerio.com",
  "password": "contraseña"
}
```

### Hermanos

**GET** `/api/hermanos?estado=ACTIVO&redId=xxx`
- Listar hermanos con filtros
- Paginación: `?page=1&limit=20`

**POST** `/api/hermanos`
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+50760000001",
  "redId": "xxx",
  "fechaNacimiento": "1990-01-15",
  "ocupacion": "Ingeniero"
}
```

**GET** `/api/hermanos/[id]`
- Obtener detalles del hermano

**PUT** `/api/hermanos/[id]`
- Actualizar perfil

**DELETE** `/api/hermanos/[id]`
- Eliminar hermano

### Redes

**GET** `/api/redes`
- Listar todas las redes

**GET** `/api/redes/[id]`
- Detalles de red con miembros y eventos

**POST** `/api/redes`
```json
{
  "nombre": "Red Menor",
  "tipo": "MENOR",
  "edadMin": 18,
  "edadMax": 30
}
```

**PUT** `/api/redes/[id]`
**DELETE** `/api/redes/[id]`

### Eventos

**GET** `/api/eventos?redId=xxx`
**POST** `/api/eventos`
```json
{
  "titulo": "Reunión de Red",
  "descripcion": "Reunión semanal",
  "fecha": "2026-04-19T19:00:00Z",
  "hora": "7:00 PM",
  "tipo": "REUNION",
  "redId": "xxx",
  "zoomLink": "https://zoom.us/...",
  "youtubeLink": "https://youtube.com/..."
}
```

**GET/PUT/DELETE** `/api/eventos/[id]`

### Asistencia

**GET** `/api/asistencia?eventoId=xxx&redId=xxx`
**POST** `/api/asistencia`
```json
{
  "eventoId": "xxx",
  "redId": "xxx",
  "fecha": "2026-04-12",
  "detalles": [
    { "hermanoId": "xxx", "presente": true }
  ]
}
```

### Anuncios

**GET** `/api/anuncios?redId=xxx&activo=true`
**POST** `/api/anuncios`
```json
{
  "titulo": "Anuncio importante",
  "contenido": "Contenido del anuncio",
  "tipo": "GENERAL",
  "prioridad": "ALTA",
  "paraTodasRedes": false,
  "redId": "xxx",
  "expiraEn": "2026-05-12T00:00:00Z"
}
```

**GET/PUT/DELETE** `/api/anuncios/[id]`

### Asistente IA

**POST** `/api/ai/chat`
```json
{
  "message": "¿Cuáles son los próximos eventos?"
}
```

Response:
```json
{
  "response": "Los próximos eventos son..."
}
```

### Dashboard

**GET** `/api/dashboard/stats`
- Estadísticas generales del sistema

---

## ⚙️ Configuración de Integraciones

### Anthropic API (IA)

1. Obtén tu clave en: https://console.anthropic.com/account/keys
2. Configura en `.env.local`:
```env
ANTHROPIC_API_KEY="sk-ant-xxxxx"
```

### WhatsApp Business API (Opcional)

1. Crea app en: https://developers.facebook.com/
2. Obtén credenciales:
   - Phone Number ID
   - Access Token
   - Business Account ID
3. Configura webhooks en panel de Facebook
4. En `.env.local`:
```env
WHATSAPP_PROVIDER="real"  # o "mock" para desarrollo
WHATSAPP_API_KEY="xxxxx"
WHATSAPP_PHONE_NUMBER_ID="xxxxx"
WHATSAPP_BUSINESS_ACCOUNT_ID="xxxxx"
```

---

## 🚀 Deployment

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

Automático con Git:
- Conecta tu repo GitHub
- Cada push a `main` se deploya automáticamente

### Variables de entorno en Vercel:
- `DATABASE_URL` - Ruta a base de datos
- `NEXTAUTH_SECRET` - Clave para sesiones
- `NEXTAUTH_URL` - URL en producción
- `ANTHROPIC_API_KEY` - Clave de IA
- `WHATSAPP_*` - Credenciales de WhatsApp

### Railway / Heroku / DigitalOcean

Soportados. Consulta documentación oficial para cada plataforma.

### Build de producción

```bash
npm run build
npm start
```

---

## 🆘 Troubleshooting

### Error: "Prisma Client not found"
**Solución:**
```bash
npx prisma generate
```

En ambiente sin internet, el cliente debería ya estar en `node_modules/@prisma/client`.

### Database locked
**Solución:**
Reinicia el servidor. SQLite a veces bloquea si hay múltiples instancias.

### NextAuth session error
**Verificar:**
- `NEXTAUTH_SECRET` está configurado
- `NEXTAUTH_URL` es correcto
- Base de datos tiene la tabla `users`

### IA no responde
**Verificar:**
- `ANTHROPIC_API_KEY` está configurado correctamente
- Tienes créditos en Anthropic Console
- En desarrollo sin key, debería usar mock responses

### WhatsApp no envía mensajes
**Si es mock (desarrollo):**
- Funcionan respuestas simuladas

**Si es real:**
- Verifica credenciales
- Revisa webhook logs en panel de Facebook
- Confirma que el número está verificado

---

## 📚 Documentación Adicional

- [SETUP.md](./SETUP.md) - Guía completa de instalación
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detalle de arquitectura
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Anthropic API Docs](https://docs.anthropic.com)

---

## 🤝 Contribuciones

Para reportar bugs o sugerir features:
1. Abre un issue en el repositorio
2. Describe el problema/feature
3. Incluye pasos para reproducir (si es bug)

---

## 📄 Licencia

Privado - Ministerio de Caballeros

---

## 📧 Contacto

Para preguntas técnicas o soporte:
- 📧 support@ministerio-caballeros.local
- 💬 WhatsApp: Integración disponible

---

**Última actualización:** 2026-04-12  
**Versión:** 0.1.0-MVP  
**Estado:** ✅ Funcional  
**Stack:** Next.js 16 + Prisma 7 + Tailwind + Anthropic AI

---

## 🎯 Roadmap

### MVP (Actual) ✅
- ✅ Gestión de redes
- ✅ Gestión de hermanos
- ✅ Registro de asistencia
- ✅ Seguimiento pastoral
- ✅ Anuncios y eventos
- ✅ Asistente IA
- ✅ WhatsApp (estructura)

### V1.1 (Próximo)
- [ ] Reportes avanzados
- [ ] Automatizaciones de recordatorios
- [ ] Integración real WhatsApp
- [ ] Historial de chat IA
- [ ] Export a PDF/Excel
- [ ] Notificaciones por email

### V1.2 (Futuro)
- [ ] App móvil nativa
- [ ] Sincronización offline
- [ ] Análisis predictivo
- [ ] Integración con Google Calendar
- [ ] API pública para partners

---

**¡Gracias por usar la Plataforma del Ministerio de Caballeros!** 🙏
