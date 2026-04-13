# 🏗️ Arquitectura de Servicios de Producción

Diagrama completo de la arquitectura con todos los servicios integrados.

## 📊 Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTES / USUARIOS                         │
├─────────────────────────────────────────────────────────────────┤
│  🌐 Web Browser  │  📱 Mobile (Futuro)  │  ⚙️ API Clients      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   VERCEL (Edge/Serverless)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Next.js 16 (Frontend + Backend API Routes)            │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ App Router & Pages                               │   │   │
│  │  │ ├── /dashboard                                   │   │   │
│  │  │ ├── /api/redes, /hermanos, /eventos, ...        │   │   │
│  │  │ └── /api/webhooks/clerk                          │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ Middleware (src/middleware.ts)                   │   │   │
│  │  │ ├── Clerk Authentication                         │   │   │
│  │  │ ├── Route Protection                             │   │   │
│  │  │ └── RBAC Validation                              │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Librerías de Cliente (src/lib/)                        │   │
│  │ ├── clerk.ts       → Autenticación + RBAC             │   │
│  │ ├── supabase.ts    → BD + Storage                      │   │
│  │ ├── resend.ts      → Email transaccional              │   │
│  │ ├── posthog.ts     → Analytics                         │   │
│  │ ├── pinecone.ts    → Búsqueda vectorial               │   │
│  │ ├── prisma.ts      → ORM (Prisma Client)              │   │
│  │ └── ai/            → Asistente IA (Anthropic)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Configuración                                          │   │
│  │ ├── next.config.js → Sentry + Security headers        │   │
│  │ ├── sentry.*.config.ts → Error tracking               │   │
│  │ └── .env.production → Variables de entorno            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬──────────────┬─────────────┐
        │             │             │              │             │
        ▼             ▼             ▼              ▼             ▼
┌──────────────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐ ┌──────────┐
│  🗄️ SUPABASE  │ │  🔐 CLERK │ │ 📊 SENTRY │ │ 📈 PostHog │ │ 📧 Resend │
├──────────────┤ ├──────────┤ ├─────────┤ ├───────────┤ ├──────────┤
│ PostgreSQL   │ │ Identity │ │ Errors  │ │ Events    │ │ Emails   │
│ Storage      │ │ + Auth   │ │ Perf    │ │ Analytics │ │ Send     │
│ Backups      │ │ + Sync   │ │ Replay  │ │ Trends    │ │ Tracking │
│              │ │          │ │ Alerts  │ │           │ │          │
└──────────────┘ └──────────┘ └─────────┘ └───────────┘ └──────────┘
        │
        └─── Usuarios, Redes, Eventos, Anuncios
             Seguimiento, Asistencia, Documentos
             Financiero, Notificaciones, etc.

    ┌──────────────────────────────────────────────────────────┐
    │  🔍 PINECONE (Vector Database)                          │
    │  ├── Document Embeddings                               │
    │  ├── Semantic Search                                   │
    │  └── AI Assistant Context                              │
    └──────────────────────────────────────────────────────────┘

                ┌─────────────────────────┐
                │ 🤖 ANTHROPIC API        │
                │ (Claude AI Assistant)   │
                └─────────────────────────┘
```

---

## 🔄 Flujos de Autenticación

### Flujo de Login

```
Usuario → Vercel (Next.js)
         ↓
      Clerk UI ← Clerk (clerk.com)
         ↓
    Usuario Autentica
         ↓
   Webhook de Clerk
         ↓
   /api/webhooks/clerk/route.ts
         ↓
   sync Clerk ↔️ Base de Datos (Supabase)
         ↓
   Crear/Actualizar registro en tabla User
         ↓
   Asignar rol y permisos
         ↓
   Redirect a /dashboard ✅
```

### Flujo de Autorización

```
Request a /api/redes
     ↓
src/middleware.ts
     ↓
clerkMiddleware()
     ↓
Obtener userId de Clerk
     ↓
src/lib/api-helpers.ts requirePermiso()
     ↓
Verificar en DB: Permiso(userId, RECURSOS.REDES, ACCIONES.LEER)
     ↓
✅ Permitido → Procesar request
❌ Denegado → 403 Forbidden
```

---

## 📊 Flujos de Datos

### Crear Evento

```
UI Dashboard
    ↓
/api/eventos (POST)
    ↓
Middleware: Clerk Auth ✓
    ↓
requirePermiso(RECURSOS.EVENTOS, ACCIONES.CREAR)
    ↓
Prisma: evento.create()
    ↓
Supabase: INSERT into eventos
    ↓
Sentry: Log evento creado
    ↓
PostHog: Track "evento_created"
    ↓
Resend: Queue email de reminder (futuro)
    ↓
Response 200 ✅
```

### Registrar Asistencia

```
UI Dashboard
    ↓
/api/asistencia (POST)
    ↓
Middleware: Clerk Auth ✓
    ↓
requirePermiso(RECURSOS.ASISTENCIA, ACCIONES.CREAR)
    ↓
Prisma: asistencia.create() + detalles
    ↓
Supabase: INSERT
    ↓
PostHog: Track "attendance_recorded"
    ↓
Sentry: Log si hay errores
    ↓
Resend: Enviar reporte a líderes
    ↓
Response 200 ✅
```

### Buscar Documentos

```
UI Dashboard / Asistente IA
    ↓
Query: "devocionales sobre oración"
    ↓
/api/ai/search o /api/documentos/search
    ↓
Pinecone: searchDocuments(query)
    ↓
Generar embedding de query
    ↓
Buscar similares en índice
    ↓
Return top 5 resultados
    ↓
PostHog: Track "search_executed"
    ↓
Sentry: Log timing
    ↓
Response 200 + resultados ✅
```

---

## 🔐 Flujos de Seguridad

### Encriptación

```
Datos en Tránsito:
  Cliente ←→ Vercel: HTTPS (SSL/TLS)
  Vercel ←→ Supabase: SSL/TLS
  Vercel ←→ Servicios: HTTPS
  
Datos en Reposo:
  Supabase PostgreSQL: Encryption at rest
  Tokens de Clerk: Signed y encriptados
  API Keys: Environment variables (nunca en código)
  Contraseñas: Removidas (Clerk maneja auth)
```

### Autenticación Multinivel

```
Paso 1: Verificar token de Clerk
        ↓
Paso 2: Validar user existe en DB
        ↓
Paso 3: Verificar role del user
        ↓
Paso 4: Verificar permiso específico
        (RECURSO + ACCION)
        ↓
Paso 5: Permitir o denegar request
        
4 niveles de validación = Seguridad robusta ✅
```

---

## 📈 Monitoreo y Observabilidad

### Sentry

```
Aplicación (Next.js)
    ↓
Error o Exception
    ↓
Sentry SDK captura
    ↓
Envía a Sentry Cloud
    ↓
Sentry agrupa y analiza
    ↓
Dashboard muestra:
  ├── Errores por tipo
  ├── Stack traces
  ├── Session replay
  ├── Breadcrumbs
  ├── Performance metrics
  └── Alertas (Slack, email)
```

### PostHog

```
Cliente (Browser)
    ↓
trackEvent() en src/lib/posthog.ts
    ↓
PostHog SDK captura
    ↓
Envía a PostHog Cloud
    ↓
PostHog almacena eventos
    ↓
Dashboard muestra:
  ├── User journeys
  ├── Funnels
  ├── Retention
  ├── Cohorts
  └── Feature flags (futuro)
```

---

## 🔄 Integraciones Futuras

### WhatsApp (Preparado pero no implementado)

```
Hermano escribe en WhatsApp
    ↓
WhatsApp Business API
    ↓
Webhook: /api/webhooks/whatsapp
    ↓
Procesar mensaje
    ↓
getAssistantResponse() → Anthropic
    ↓
Responder vía WhatsApp
    ↓
Grabar en MensajeWhatsApp tabla
```

### Escalabilidad Futura

```
Hoy (100-200 users):
  Vercel Free ✓
  Supabase Free ✓
  
Mañana (500-1000 users):
  Vercel Pro ($20/mes)
  Supabase Pro ($25/mes)
  Redis para cache (opcional)
  
Futuro (1000+ users):
  Vercel Scale ($150+/mes)
  Supabase Paid ($100+/mes)
  CDN global (Vercel Edge)
  Database replicas (Supabase)
```

---

## 🎯 Componentes Clave

### Base de Datos (Supabase PostgreSQL)

```
┌─────────────────────────────────────────┐
│ Schema Prisma (25+ modelos)            │
├─────────────────────────────────────────┤
│ Users (Clerk IDs)                       │
│ Redes (3 tipos)                         │
│ Hermanos (120+)                         │
│ Eventos (recurrentes)                   │
│ Anuncios (por red)                      │
│ Asistencia (detallada)                  │
│ Seguimiento (pastoral)                  │
│ Visitas (registro)                      │
│ Peticiones de Oración                   │
│ Documentos (devocionales, etc)          │
│ Permisos (RBAC granular)                │
│ Cuotas (financiero)                     │
│ Notificaciones (alertas)                │
│ MensajesWhatsApp (chat)                 │
│ EmbeddingDocumento (vectorial)          │
│ ConfiguracionIntegracion (servicios)    │
└─────────────────────────────────────────┘
```

### API Routes

```
/api/redes/*              CRUD de Redes + reportes
/api/hermanos/*           Gestión de hermanos
/api/eventos/*            Eventos y calendario
/api/anuncios/*           Anuncios y comunicación
/api/asistencia/*         Registro de asistencia
/api/seguimiento/*        Seguimiento pastoral
/api/visitas/*            Registro de visitas
/api/peticiones/*         Peticiones de oración
/api/documentos/*         Centro documental
/api/permisos/*           Gestión de RBAC
/api/ai/chat              Asistente IA
/api/health               Health check
/api/webhooks/clerk       Sincronización de usuarios
/api/webhooks/whatsapp    (Preparado, no activo)
```

---

## 📊 Tabla de Decisiones Arquitectónicas

| Componente | Opción | Razón |
|-----------|--------|-------|
| Frontend | Next.js 16 | React moderno, SSR, API routes |
| ORM | Prisma | Type-safe, migraciones, studio |
| Base de Datos | PostgreSQL (Supabase) | Escalable, confiable, managed |
| Auth | Clerk | Moderno, MFA, webhooks |
| Error Tracking | Sentry | Completo, session replay |
| Analytics | PostHog | Open-source, self-hosted option |
| Email | Resend | Moderno, simple, affordable |
| Vector DB | Pinecone | Mantenible, gratis para pequeño |
| IA | Anthropic | Claude 3, mejor calidad |
| Hosting | Vercel | Optimizado para Next.js, edges |
| Storage | Supabase Storage | Integrado, simple |
| NO: Stripe | Removido | Por solicitud |

---

## 🚀 Performance

### Optimizaciones Implementadas

```
Frontend:
  ├── Next.js Image Optimization
  ├── Code Splitting automático
  ├── CSS-in-JS (Tailwind)
  ├── Lazy Loading de componentes
  └── ISR (Incremental Static Regeneration)

Backend:
  ├── Database Connection Pooling (Supabase)
  ├── Prisma Client Caching
  ├── API Response Compression
  ├── Error Handling eficiente
  └── Logging estructurado (Sentry)

Infraestructura:
  ├── Edge Functions (Vercel)
  ├── Auto-scaling (Vercel)
  ├── Global CDN
  ├── Regional routing
  └── Caching headers HTTP
```

### Métricas Esperadas

```
First Contentful Paint (FCP):      < 1s
Largest Contentful Paint (LCP):    < 2.5s
Cumulative Layout Shift (CLS):     < 0.1
Time to Interactive (TTI):         < 3.5s
API Response Time:                 < 200ms
Database Query Time:               < 50ms
```

---

## 📋 Comparación Antes vs Después

| Aspecto | Antes (Dev) | Después (Prod) |
|---------|-----------|----------------|
| Base de Datos | SQLite (local) | PostgreSQL (Supabase) |
| Autenticación | NextAuth (local) | Clerk (cloud) |
| Monitoreo | Logs locales | Sentry (cloud) |
| Analytics | Ninguno | PostHog (cloud) |
| Email | Mock | Resend (cloud) |
| Búsqueda | Secuencial | Vectorial (Pinecone) |
| Escalabilidad | 1-10 users | 1000+ users |
| Uptime | Manual | 99.99% SLA |
| Backups | Manual | Automático diario |
| Costo | $0 | ~$150/mes |
| Tiempo Setup | 5 min | 2-3 horas |

---

## 🔮 Roadmap Futuro

### Corto Plazo (1-2 meses)
```
✓ Tests automatizados (70%+ coverage)
✓ Rate limiting
✓ Documentación de API (Swagger)
✓ Mobile app (React Native)
```

### Mediano Plazo (2-4 meses)
```
✓ Feature flags (PostHog)
✓ Caching de BD (Redis)
✓ Push notifications
✓ Multi-idioma
```

### Largo Plazo (4-6+ meses)
```
✓ Integración WhatsApp real
✓ SMS alerts
✓ Video conferencing
✓ Análisis de sentimiento
✓ Exportación de reportes (PDF)
```

---

**Arquitectura versión:** 2.0
**Última actualización:** Abril 2026
**Status:** ✅ Production-Ready
**Diagrama actualizado:** Sí
