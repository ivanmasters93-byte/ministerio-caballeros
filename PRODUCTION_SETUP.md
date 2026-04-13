# Production Setup Guide - Ministerio de Caballeros

Esta guía completa describe cómo configurar todos los servicios de producción para el sistema ministerial.

## Tabla de Contenidos

1. [Supabase (PostgreSQL)](#supabase-postgresql)
2. [Clerk (Autenticación)](#clerk-autenticación)
3. [Sentry (Monitoreo)](#sentry-monitoreo)
4. [PostHog (Analytics)](#posthog-analytics)
5. [Resend (Email)](#resend-email)
6. [Pinecone (Vector DB)](#pinecone-vector-db)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Supabase (PostgreSQL)

### Por qué Supabase

- PostgreSQL administrado y escalable
- Backups automáticos
- APIs generadas automáticamente
- Storage integrado para documentos
- Real-time capabilities para futuras expansiones

### Setup

#### 1. Crear cuenta en Supabase

```bash
# Visita https://supabase.com
# Crea una nueva cuenta
# Crea un nuevo proyecto
```

#### 2. Obtener credenciales

En el dashboard de Supabase:
- Copia la `DATABASE_URL` desde Settings > Database
- Obtén `SUPABASE_URL` desde Settings > API
- Obtén `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`

#### 3. Configurar variables de entorno

```bash
# .env.production
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[database]"
SUPABASE_URL="https://[project].supabase.co"
SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"
```

#### 4. Crear tablas y ejecutar migraciones

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Crear datos de semilla (opcional)
npx prisma db seed
```

#### 5. Crear buckets de Storage

En Supabase Dashboard, crea buckets para:
- `documentos` - para devocionales, PDFs, etc.
- `eventos` - para fotos de eventos
- `usuarios` - para fotos de perfil

### Monitoreo

```bash
# Ver estado de la BD
npx prisma studio

# Backups automáticos (configurado en Supabase)
# Ver en Settings > Backups
```

---

## Clerk (Autenticación)

### Por qué Clerk

- Autenticación moderna y segura
- Multi-factor authentication (MFA)
- Social sign-in (Google, Microsoft, etc.)
- Gestión de usuarios simplificada
- Webhooks para sincronización

### Setup

#### 1. Crear cuenta en Clerk

```bash
# Visita https://clerk.com
# Crea una nueva aplicación
# Elige Next.js como framework
```

#### 2. Obtener credenciales

En el dashboard de Clerk:
- Obtén `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Obtén `CLERK_SECRET_KEY`

#### 3. Configurar variables de entorno

```bash
# .env.production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="[publishable-key]"
CLERK_SECRET_KEY="[secret-key]"
```

#### 4. Instalar dependencias

```bash
npm install @clerk/nextjs
```

#### 5. Configurar Clerk en la aplicación

Los archivos ya están preparados:
- `src/lib/clerk.ts` - Funciones de Clerk
- Los middleware se deben agregar a `src/middleware.ts`

#### 6. Configurar Webhook

En Clerk Dashboard:
- Ve a Webhooks
- Agrega endpoint: `https://tu-dominio.com/api/webhooks/clerk`
- Suscríbete a eventos: `user.created`, `user.updated`, `user.deleted`

#### 7. Sincronizar usuarios existentes

```bash
# Script para sincronizar usuarios de NextAuth a Clerk
# Esto se hace manualmente durante migración
```

---

## Sentry (Monitoreo)

### Por qué Sentry

- Rastreo automático de errores
- Performance monitoring
- Session replay
- Alertas en tiempo real
- Análisis de tendencias

### Setup

#### 1. Crear cuenta en Sentry

```bash
# Visita https://sentry.io
# Crea una nueva organización
# Crea proyecto de Next.js
```

#### 2. Obtener credenciales

- Copia el `DSN`
- Obtén `SENTRY_AUTH_TOKEN` (para CI/CD)

#### 3. Configurar variables de entorno

```bash
# .env.production
NEXT_PUBLIC_SENTRY_DSN="[sentry-dsn]"
SENTRY_AUTH_TOKEN="[auth-token]"
SENTRY_ENVIRONMENT="production"
```

#### 4. Configuración automática

El archivo `sentry.client.config.ts` y `sentry.server.config.ts` ya están listos.

#### 5. Habilitar en `next.config.js`

```javascript
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  {
    // tu configuración Next.js
  },
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: false,
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
  }
);
```

---

## PostHog (Analytics)

### Por qué PostHog

- Analytics open-source o cloud
- Event tracking automático
- Funnel analysis
- Cohort analysis
- Feature flags

### Setup

#### 1. Crear cuenta en PostHog

```bash
# Visita https://posthog.com
# Crea una nueva cuenta
# Crea nuevo proyecto
```

#### 2. Obtener credenciales

- Obtén `NEXT_PUBLIC_POSTHOG_KEY`

#### 3. Configurar variables de entorno

```bash
# .env.production
NEXT_PUBLIC_POSTHOG_KEY="[posthog-key]"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

#### 4. Instalar dependencias

```bash
npm install posthog-js
```

#### 5. Usar el módulo de PostHog

Ejemplos de uso en `src/lib/posthog.ts`:

```typescript
import { trackEvent, identifyUser } from '@/lib/posthog';

// Rastrear evento
trackEvent('user_login', { userId: '123' });

// Identificar usuario
identifyUser('123', { email: 'user@example.com' });
```

---

## Resend (Email)

### Por qué Resend

- Servicio de email transaccional
- Deliverability garantizado
- Análisis de apertura y clicks
- Soporte para templates HTML

### Setup

#### 1. Crear cuenta en Resend

```bash
# Visita https://resend.com
# Crea una nueva cuenta
# Obtén API key
```

#### 2. Obtener credenciales

- Obtén `RESEND_API_KEY`

#### 3. Configurar variables de entorno

```bash
# .env.production
RESEND_API_KEY="[resend-api-key]"
RESEND_FROM_EMAIL="noreply@ministerio-caballeros.com"
```

#### 4. Instalar dependencias

```bash
npm install resend
```

#### 5. Usar el módulo de Resend

Ejemplos en `src/lib/resend.ts`:

```typescript
import {
  sendEventReminder,
  sendAnnouncement,
  sendPrayerRequestNotification
} from '@/lib/resend';

// Enviar recordatorio de evento
await sendEventReminder(
  'hermano@example.com',
  'Juan García',
  'Reunión de Red Menor',
  new Date('2026-04-20')
);
```

#### 6. Verificar dominio

En Resend Dashboard:
- Agrega tu dominio personalizado
- Configura registros DNS MX, DKIM, DMARC

---

## Pinecone (Vector DB)

### Por qué Pinecone

- Búsqueda vectorial escalable
- Ideal para búsqueda semántica en documentos
- Integración con IA para queries más inteligentes

### Setup

#### 1. Crear cuenta en Pinecone

```bash
# Visita https://www.pinecone.io
# Crea una nueva cuenta
# Crea un índice
```

#### 2. Obtener credenciales

- Obtén `PINECONE_API_KEY`
- Obtén `PINECONE_INDEX_NAME`
- Obtén `PINECONE_ENVIRONMENT`

#### 3. Configurar variables de entorno

```bash
# .env.production
PINECONE_API_KEY="[pinecone-api-key]"
PINECONE_INDEX_NAME="ministerio-caballeros"
PINECONE_ENVIRONMENT="us-east-1-aws"
```

#### 4. Instalar dependencias

```bash
npm install @pinecone-database/pinecone
```

#### 5. Crear índice

```bash
# En Pinecone Dashboard
# Nombre: ministerio-caballeros
# Dimensiones: 1536 (para OpenAI embeddings)
# Metric: cosine
```

#### 6. Usar el módulo de Pinecone

```typescript
import { indexDocument, searchDocuments } from '@/lib/pinecone';

// Indexar documento
await indexDocument('doc-1', 'Contenido del documento');

// Buscar documentos similares
const results = await searchDocuments('query de búsqueda', 5);
```

---

## Deployment

### Opción 1: Vercel (Recomendado)

#### 1. Conectar repositorio

```bash
# En Vercel Dashboard
# Importa tu repositorio de GitHub
```

#### 2. Configurar variables de entorno

En Vercel Dashboard > Project Settings > Environment Variables:

```
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
NEXT_PUBLIC_POSTHOG_KEY
RESEND_API_KEY
PINECONE_API_KEY
PINECONE_INDEX_NAME
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
```

#### 3. Deploy

```bash
# Vercel deployará automáticamente en cada push a main
```

### Opción 2: Docker + Railway

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## Troubleshooting

### Problema: "Database connection failed"

**Solución:**
```bash
# 1. Verifica DATABASE_URL
echo $DATABASE_URL

# 2. Prueba conexión
npm run db:push

# 3. Revisa los logs de Supabase
# Settings > Database > Logs
```

### Problema: "Clerk webhook failed"

**Solución:**
```bash
# 1. Verifica el webhook secret en Clerk
# 2. Revisa los logs de webhook en Clerk Dashboard
# 3. Regenera la clave si es necesario
```

### Problema: "Sentry events not showing"

**Solución:**
```bash
# 1. Verifica DSN
echo $NEXT_PUBLIC_SENTRY_DSN

# 2. Comprueba que Sentry está configurado en next.config.js
# 3. Dispara un error de prueba:
throw new Error('Test error from Sentry');
```

### Problema: "Emails not sending"

**Solución:**
```bash
# 1. Verifica RESEND_API_KEY
# 2. Comprueba que el dominio está verificado en Resend
# 3. Revisa los logs de envío en Resend Dashboard
```

---

## Checklist Final

- [ ] Supabase configurado y BD migrada
- [ ] Clerk integrado y usuarios sincronizados
- [ ] Sentry reportando errores
- [ ] PostHog rastreando eventos
- [ ] Resend enviando emails de prueba
- [ ] Pinecone indexando documentos
- [ ] Vercel deployado y funcionando
- [ ] Certificado SSL activo
- [ ] Backups automáticos configurados
- [ ] Monitoring y alertas activos
- [ ] Team notificado del nuevo setup

---

## Costo Estimado Mensual (Producción)

- **Supabase**: $25-100 (según uso)
- **Clerk**: $0-200 (según usuarios)
- **Sentry**: $29-99 (plan pagado)
- **PostHog**: $0-450 (según eventos)
- **Resend**: $0-80 (según emails)
- **Pinecone**: $0-100 (según vectors)
- **Vercel**: $20-100 (según consumo)
- **Total estimado**: $74-929/mes

*Para equipo pequeño (< 1000 hermanos): ~$150-300/mes*

---

## Soporte

Para problemas específicos:
- Supabase: https://supabase.com/docs
- Clerk: https://clerk.com/docs
- Sentry: https://docs.sentry.io
- PostHog: https://posthog.com/docs
- Resend: https://resend.com/docs
- Pinecone: https://docs.pinecone.io
