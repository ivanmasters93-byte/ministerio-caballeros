# 🚀 GUÍA DE INSTALACIÓN Y DEPLOYMENT

## MINISTERIO DE CABALLEROS - Plataforma Integral de Gestión Ministerial

---

## 📋 REQUISITOS PREVIOS

```bash
Node.js >= 18.17
npm >= 9.0
SQLite3 (incluido en la mayoría de sistemas)
```

---

## 🔧 INSTALACIÓN LOCAL

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd ministerio-caballeros
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="ministerio-caballeros-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"

# Anthropic API (obtener de https://console.anthropic.com)
ANTHROPIC_API_KEY="sk-ant-xxxxx"

# WhatsApp (dejar como 'mock' para desarrollo)
WHATSAPP_PROVIDER="mock"  # Cambiar a "real" cuando tengas credenciales
WHATSAPP_API_KEY="xxx"
WHATSAPP_PHONE_NUMBER_ID="xxx"
WHATSAPP_BUSINESS_ACCOUNT_ID="xxx"
```

### 4. **IMPORTANTE: Resolver Prisma Client**

#### Opción A: En ambiente con internet

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

#### Opción B: Si Prisma es problemático localmente

El cliente Prisma ya está parcialmente en `node_modules/@prisma/client`. Para desarrollo local sin internet:

```bash
# El app intentará usar el cliente existente
# Si necesitas hacer cambios al schema, edita prisma/schema.prisma
# y ejecuta los comandos anteriores en un ambiente con internet
# antes de hacer commit
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 👤 USUARIOS DE PRUEBA

La base de datos ya contiene usuarios de demo:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@ministerio.com | admin123 | Líder General |
| carlos@ministerio.com | admin123 | Líder Red |
| pedro@ministerio.com | admin123 | Líder Red |
| hermano@ministerio.com | admin123 | Hermano |

---

## 📁 ESTRUCTURA DEL PROYECTO

```
ministerio-caballeros/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Páginas de autenticación
│   │   ├── (dashboard)/      # Páginas del dashboard
│   │   │   ├── page.tsx      # Dashboard principal
│   │   │   ├── redes/        # Gestión de redes
│   │   │   ├── hermanos/     # Gestión de hermanos
│   │   │   ├── eventos/      # Calendario de eventos
│   │   │   ├── asistencia/   # Control de asistencia
│   │   │   ├── seguimiento/  # Seguimiento pastoral
│   │   │   ├── oracion/      # Peticiones de oración
│   │   │   ├── visitas/      # Registro de visitas
│   │   │   ├── anuncios/     # Comunicación
│   │   │   ├── documentos/   # Centro documental
│   │   │   ├── asistente-ia/ # Chat con IA
│   │   │   ├── whatsapp/     # Configuración WhatsApp
│   │   │   ├── finanzas/     # Gestión financiera
│   │   │   └── roles/        # Control de permisos
│   │   ├── api/              # API Routes
│   │   │   ├── hermanos/
│   │   │   ├── redes/
│   │   │   ├── eventos/
│   │   │   ├── asistencia/
│   │   │   ├── seguimiento/
│   │   │   ├── oracion/
│   │   │   ├── visitas/
│   │   │   ├── anuncios/
│   │   │   ├── documentos/
│   │   │   ├── dashboard/
│   │   │   ├── ai/
│   │   │   ├── whatsapp/
│   │   │   ├── roles/
│   │   │   ├── finanzas/
│   │   │   └── auth/
│   │   └── layout.tsx
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/              # Componentes base (Button, Card, etc)
│   │   ├── layout/          # Header, Sidebar, DashboardLayout
│   │   └── domain/          # Componentes específicos del negocio
│   └── lib/
│       ├── ai/              # Asistente de IA
│       ├── whatsapp/        # Integración WhatsApp
│       ├── auth.ts          # Configuración NextAuth
│       ├── permissions.ts   # Control de permisos
│       ├── validations.ts   # Esquemas Zod
│       ├── api-helpers.ts   # Utilidades para APIs
│       ├── notifications.ts # Sistema de notificaciones
│       └── prisma.ts        # Cliente de Prisma
├── prisma/
│   ├── schema.prisma        # Esquema de base de datos
│   └── seed.ts              # Script de datos iniciales
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.example
└── README.md
```

---

## 🗄️ MODELO DE DATOS

### Entidades Principales

- **User**: Usuarios del sistema (Javier, líderes, secretarios, asistentes, hermanos)
- **Hermano**: Perfil extendido del hermano (edad, estado, notas, etc)
- **Red**: Las 3 redes ministeriales (Menor, Media, Mayor)
- **Evento**: Reuniones, cultos, retiros, capacitaciones
- **Anuncio**: Comunicación centralizada
- **Asistencia**: Registro de asistencia a eventos
- **Seguimiento**: Casos pastorales abiertos
- **PeticionOracion**: Necesidades de oración
- **Visita**: Registro de visitas pastorales
- **Documento**: Centro documental (devocionales, calendarios, etc)
- **Cuota**: Gestión financiera

Ver `prisma/schema.prisma` para detalles completos.

---

## 🔐 SISTEMA DE PERMISOS

El sistema implementa control de acceso granular:

**Roles:**
- `LIDER_GENERAL` - Acceso total
- `LIDER_RED` - Gestiona su red asignada
- `SECRETARIO` - Operaciones administrativas
- `ASISTENTE` - Soporte operativo
- `HERMANO` - Acceso limitado a información pública

**Recursos y Acciones:**
- `HERMANOS`: CREAR, LEER, ACTUALIZAR, ELIMINAR
- `REDES`: CREAR, LEER, ACTUALIZAR, ELIMINAR
- `EVENTOS`: CREAR, LEER, ACTUALIZAR, ELIMINAR
- `ASISTENCIA`: REGISTRAR, VER
- Etc.

Ver `src/lib/permissions.ts` para configuración completa.

---

## 🤖 MÓDULO DE IA

El asistente de IA responde preguntas sobre:
- Próximos eventos
- Agenda semanal
- Anuncios importantes
- Recursos disponibles
- Información de redes
- Horarios y enlacesdel servicio

**Configuración:**

```env
ANTHROPIC_API_KEY="tu-clave-api"
```

Obtén tu clave en: https://console.anthropic.com/account/keys

El asistente implementa:
- Contexto en tiempo real desde la base de datos
- Sistema de prompts estructurado
- Respuestas basadas únicamente en datos reales
- Escalado automático de consultas sensibles

---

## 📱 INTEGRACIÓN WHATSAPP

### Para Desarrollo (Mock)

```env
WHATSAPP_PROVIDER="mock"
```

El sistema simula respuestas de WhatsApp sin credenciales reales.

### Para Producción (WhatsApp Business API)

Obtén acceso a WhatsApp Business API:
1. Ve a https://developers.facebook.com/
2. Crea una aplicación
3. Obtén tu `Phone Number ID` y `Access Token`
4. Configura los webhooks

```env
WHATSAPP_PROVIDER="real"
WHATSAPP_API_KEY="xxxxx"
WHATSAPP_PHONE_NUMBER_ID="xxxxx"
WHATSAPP_BUSINESS_ACCOUNT_ID="xxxxx"
```

**Webhooks disponibles:**
- `POST /api/whatsapp/webhook` - Recibir mensajes
- `POST /api/whatsapp/send` - Enviar mensajes
- `GET /api/whatsapp/status` - Estado de integración

---

## 🧪 TESTING

### Ejecutar tests (si hay configurados)

```bash
npm test
```

### Testing manual

1. Inicia el servidor: `npm run dev`
2. Accede a http://localhost:3000
3. Prueba cada módulo:
   - Login con usuarios demo
   - Crear/editar hermanos
   - Registrar asistencia
   - Crear eventos
   - Enviar anuncios
   - Chatear con IA
   - Etc.

---

## 📦 BUILD Y DEPLOYMENT

### Build para producción

```bash
npm run build
npm start
```

### Deployment en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deployment en otros servicios

El proyecto está optimizado para:
- **Vercel** (recomendado)
- **Railway**
- **Heroku**
- **AWS**
- **DigitalOcean**

**Importante:** En el ambiente de producción:

```bash
# Generar cliente Prisma
npx prisma generate

# Hacer migraciones (si es necesario)
npx prisma migrate deploy
```

---

## 🆘 TROUBLESHOOTING

### Error: "Prisma Client not generated"

**Solución:**
```bash
# En ambiente con internet
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### Error: "Database locked"

**Solución:**
```bash
# Reiniciar el servidor
# SQLite a veces bloquea si hay múltiples instancias
```

### Error: "NextAuth session error"

**Verificar:**
- `NEXTAUTH_SECRET` está configurado
- `NEXTAUTH_URL` es correcto
- Base de datos tiene usuarios

### No puedo acceder a la IA

**Verificar:**
- `ANTHROPIC_API_KEY` está configurado
- Tienes créditos disponibles en Anthropic

### WhatsApp no envía mensajes

**Verificar:**
- En desarrollo, `WHATSAPP_PROVIDER="mock"` (simula respuestas)
- En producción, verifica credenciales de WhatsApp Business API

---

## 📚 DOCUMENTACIÓN ADICIONAL

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

## 📞 SOPORTE

Para reportar bugs o sugerencias:
1. Abre un issue en el repositorio
2. Describe el problema
3. Incluye logs y pasos para reproducir

---

## 📄 LICENCIA

Este proyecto es privado y fue desarrollado para el Ministerio de Caballeros.

---

**Último actualizado:** 2026-04-12
**Versión:** 0.1.0
**Estado:** MVP Funcional
