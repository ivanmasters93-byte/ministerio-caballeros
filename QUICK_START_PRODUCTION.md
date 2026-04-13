# Quick Start - Servicios de Producción

Guía rápida para instalar y configurar servicios de producción.

## 1️⃣ Instalar Dependencias

```bash
cd ministerio-caballeros

# Instalar todas las dependencias (incluyendo nuevas)
npm install

# Generar Prisma Client
npx prisma generate
```

## 2️⃣ Copiar Variables de Entorno

```bash
# Para producción
cp .env.production.example .env.production

# Para desarrollo (ya existe)
# Actualizar .env.local si es necesario
```

## 3️⃣ Crear Cuentas en Servicios (Orden Recomendado)

### 🗄️ Supabase (Base de Datos)
```bash
# Visita: https://supabase.com
# 1. Crea proyecto
# 2. Ve a Settings > Database > Connection Pooling
# 3. Copia DATABASE_URL con ?pgbouncer&limit=1
# 4. Pega en .env.production

# Variables necesarias:
# DATABASE_URL=postgresql://...
# SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_ANON_KEY=eyJhbGc...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 🔐 Clerk (Autenticación)
```bash
# Visita: https://clerk.com
# 1. Crea aplicación de Next.js
# 2. Ve a API Keys
# 3. Copia claves

# Variables necesarias:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...
# CLERK_WEBHOOK_SECRET=whsec_...
```

### 📊 Sentry (Monitoreo)
```bash
# Visita: https://sentry.io
# 1. Crea proyecto de Next.js
# 2. Copia DSN

# Variables necesarias:
# NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
# SENTRY_AUTH_TOKEN=sntrys_eyJ...
# SENTRY_ORG=tu-org
# SENTRY_PROJECT=tu-project
```

### 📈 PostHog (Analytics)
```bash
# Visita: https://posthog.com
# 1. Crea proyecto
# 2. Copia API Key

# Variables necesarias:
# NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
```

### 📧 Resend (Email)
```bash
# Visita: https://resend.com
# 1. Obtén API Key
# 2. Verifica tu dominio

# Variables necesarias:
# RESEND_API_KEY=re_xxx
# RESEND_FROM_EMAIL=noreply@tu-dominio.com
```

### 🔍 Pinecone (Vector DB)
```bash
# Visita: https://www.pinecone.io
# 1. Crea índice: ministerio-caballeros
# 2. Copia credenciales

# Variables necesarias:
# PINECONE_API_KEY=xxx
# PINECONE_INDEX_NAME=ministerio-caballeros
# PINECONE_ENVIRONMENT=us-east-1-aws
```

## 4️⃣ Configurar Base de Datos

```bash
# Ejecutar migraciones de Prisma
npx prisma migrate deploy

# O si es la primera vez (crear esquema):
npx prisma migrate dev --name init

# Cargar datos de prueba (opcional)
npx prisma db seed
```

## 5️⃣ Configurar Clerk Webhook

En Clerk Dashboard:
1. Ve a **Webhooks**
2. Haz click en **+ Add Endpoint**
3. URL: `https://tu-dominio.com/api/webhooks/clerk`
4. Eventos a suscribirse:
   - user.created
   - user.updated
   - user.deleted
5. Copia el **Signing Secret**
6. Pega en `CLERK_WEBHOOK_SECRET`

## 6️⃣ Ejecutar Localmente

```bash
# Modo desarrollo
npm run dev

# Visita http://localhost:3000
```

## 7️⃣ Ejecutar Tests

```bash
# (Pendiente: implementar tests)
npm run test
```

## 8️⃣ Build para Producción

```bash
# Build
npm run build

# Start en modo producción
npm start
```

## 9️⃣ Deploy a Vercel

```bash
# Si tienes Vercel CLI instalado:
vercel

# O desde el dashboard de Vercel:
# 1. Conecta tu repositorio GitHub
# 2. Agrega variables de entorno
# 3. Deploy automático
```

## Archivos Importantes

**Nuevos archivos de configuración:**
- `.env.production.example` - Plantilla de variables
- `next.config.js` - Config de Next.js con Sentry
- `sentry.client.config.ts` - Config de Sentry (cliente)
- `sentry.server.config.ts` - Config de Sentry (servidor)
- `src/middleware.ts` - Middleware de Clerk
- `prisma/schema.prisma` - Schema actualizado a PostgreSQL

**Nuevas bibliotecas:**
- `src/lib/supabase.ts` - Cliente de Supabase
- `src/lib/clerk.ts` - Funciones de Clerk
- `src/lib/resend.ts` - Cliente de Resend
- `src/lib/posthog.ts` - Cliente de PostHog
- `src/lib/pinecone.ts` - Cliente de Pinecone

**Nuevos webhooks:**
- `src/app/api/webhooks/clerk/route.ts` - Webhook de Clerk

## Variables de Entorno Completas

```bash
# === SUPABASE (PostgreSQL) ===
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# === CLERK ===
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# === SENTRY ===
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_AUTH_TOKEN="sntrys_eyJ..."
SENTRY_ORG="tu-org"
SENTRY_PROJECT="tu-proyecto"

# === PostHog ===
NEXT_PUBLIC_POSTHOG_KEY="phc_xxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# === Resend ===
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="noreply@ministerio.com"

# === Pinecone ===
PINECONE_API_KEY="xxx"
PINECONE_INDEX_NAME="ministerio-caballeros"
PINECONE_ENVIRONMENT="us-east-1-aws"

# === Anthropic ===
ANTHROPIC_API_KEY="sk-ant-..."

# === App ===
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://ministerio-caballeros.com"
NEXT_PUBLIC_APP_URL="https://ministerio-caballeros.com"
```

## Próximos Pasos

1. ✅ Instalar dependencias
2. ✅ Configurar variables de entorno
3. ✅ Ejecutar migraciones
4. ✅ Probar localmente
5. ✅ Deploy a Vercel
6. ⏳ Configurar dominio personalizado
7. ⏳ Implementar tests
8. ⏳ Agregar rate limiting

## Troubleshooting Rápido

**Error: "Cannot find module '@clerk/nextjs'"**
```bash
npm install @clerk/nextjs
```

**Error: "DATABASE_URL not set"**
```bash
# Asegúrate de tener .env.production o .env.local
# con DATABASE_URL configurada
```

**Error: "Failed to connect to Supabase"**
```bash
# Verifica que DATABASE_URL sea válida
# Prueba conectarse desde Prisma Studio:
npx prisma studio
```

**Error: "Clerk webhook failed"**
```bash
# 1. Verifica CLERK_WEBHOOK_SECRET
# 2. Revisa logs en Clerk Dashboard > Webhooks
# 3. Regenera el secret si es necesario
```

**Performance lento en Vercel**
```bash
# 1. Verifica función CLS (Cumulative Layout Shift)
# 2. Revisa Sentry para errores
# 3. Optimiza imágenes con next/image
```

## Documentación Completa

Para más detalles, ver:
- `PRODUCTION_SETUP.md` - Guía completa paso a paso
- `SERVICIOS_PRODUCCION.md` - Resumen de servicios
- `README.md` - Descripción general
- `ARCHITECTURE.md` - Diseño técnico

---

**¡Listo!** Ahora tienes una aplicación lista para producción con:
- ✅ Base de datos PostgreSQL escalable
- ✅ Autenticación moderna con Clerk
- ✅ Monitoreo completo con Sentry
- ✅ Analytics con PostHog
- ✅ Email transaccional con Resend
- ✅ Búsqueda vectorial con Pinecone
- ✅ Deployment en Vercel

**Costo estimado:** ~$150/mes para un ministerio pequeño
**Escalabilidad:** Soporta 1000+ hermanos sin problemas
