# 🏗️ ARQUITECTURA - MINISTERIO DE CABALLEROS

## Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────┐   │
│  │  Dashboard Sx    │  │  Pages (Client)  │  │ Auth   │   │
│  │  Components      │  │  Forms/Modals    │  │ Login  │   │
│  │  UI Library      │  │  Real-time Data  │  │        │   │
│  └──────────────────┘  └──────────────────┘  └────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                     (Fetch/HTTP Requests)
                              │
┌─────────────────────────────────────────────────────────────┐
│                API ROUTES (Next.js API)                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Route Handlers - Error Handling - Validation      │    │
│  │  ├── /api/hermanos      ├── /api/eventos          │    │
│  │  ├── /api/redes         ├── /api/asistencia       │    │
│  │  ├── /api/anuncios      ├── /api/seguimiento      │    │
│  │  ├── /api/oracion       ├── /api/visitas          │    │
│  │  ├── /api/documentos    ├── /api/finanzas         │    │
│  │  ├── /api/ai/chat       ├── /api/whatsapp/*       │    │
│  │  └── /api/roles/permisos└── /api/dashboard/stats  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
              (Business Logic - Prisma - Validations)
                              │
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                      │
│  ┌────────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │  Permissions   │  │ Validations │  │ Helpers      │   │
│  │  (RBAC)        │  │ (Zod)       │  │ (Utilities)  │   │
│  └────────────────┘  └─────────────┘  └──────────────┘   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   AI Layer              WhatsApp Layer               │  │
│  │ • System Prompts       • Webhook Service             │  │
│  │ • Context Building     • Message Queue               │  │
│  │ • Anthropic SDK        • Mock Provider               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    (Prisma ORM - Queries)
                              │
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER (Prisma)                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  25+ Models                                        │    │
│  │  • User      • Hermano      • Red                  │    │
│  │  • Evento    • Asistencia   • Anuncio              │    │
│  │  • Seguimiento • Visita     • PeticionOracion      │    │
│  │  • Documento • Cuota        • Notificacion         │    │
│  │  • MensajeWhatsApp • Permiso • MetaFinanciera      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                       (SQL Queries)
                              │
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (SQLite)                         │
│  ┌──────────────────────────────────────────────────┐      │
│  │  file:./dev.db                                   │      │
│  │  • Relaciones normalizadas                       │      │
│  │  • Integridad referencial                        │      │
│  │  • Índices para performance                      │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘

External Services:
├── Anthropic API (Claude 3 - IA)
├── WhatsApp Business API (Opcional)
└── NextAuth (OAuth providers - opcional en futuro)
```

---

## 🔐 Seguridad y Autenticación

### Flujo de Autenticación

```
User Login
    │
    ├─► NextAuth Credentials Provider
    │   └─► bcryptjs password verification
    │       └─► JWT generation
    │           └─► Session storage
    │
    ├─► Session Cookie (secure, httpOnly)
    │
    └─► API Middleware
        └─► requireAuth() helper
            └─► Validate session
                └─► Extract role & permissions
```

### Sistema de Permisos (RBAC)

```
Role Hierarchy:
┌─────────────────────┐
│   Líder General     │
│   (Full Access)     │
└──────────┬──────────┘
           │
      ┌────┴────┬───────────────┐
      │          │               │
   ┌──┴──┐  ┌──┴──┐       ┌────┴──┐
   │Líderes│ │Secre│       │Asisten│
   │de Red │ │tarios│      │tes    │
   └──┬──┘  └──┬──┘       └────┬──┘
      │        │               │
      └────┬───┴───────────────┘
           │
       ┌───┴───┐
       │Hermano│
       │(Básico│
       └───────┘

Permission Check:
check(userId, resource, action)
    ├─► Get user role
    ├─► Check Permiso table
    ├─► Role-based default
    └─► Return true/false
```

### Validación de Datos

```
User Input
    │
    ├─► Client-side validation (TypeScript)
    │
    ├─► API Route validation (Zod schemas)
    │   ├─► Type checking
    │   ├─► String transformations
    │   └─► Custom validators
    │
    └─► Database constraints
        ├─► Unique indexes
        ├─► Foreign keys
        └─► CHECK constraints
```

---

## 📊 Modelo de Datos

### Entidades Principales

```sql
-- Usuarios y Autenticación
User
  ├─ id (String) [PK]
  ├─ name (String)
  ├─ email (String) [UNIQUE]
  ├─ phone (String?)
  ├─ password (String - bcrypt)
  ├─ role (Role enum) [DEFAULT: HERMANO]
  ├─ createdAt, updatedAt
  └─ Relationships:
     ├─ redes (RedMember[]) - Networks they belong to
     ├─ lideredRed (Red[]) - Networks they lead
     ├─ hermano (Hermano?) - Extended profile
     ├─ permisos (Permiso[]) - Custom permissions
     └─ notificaciones (Notificacion[])

-- Hermanos (Extended User Profile)
Hermano
  ├─ id (String) [PK]
  ├─ userId (String) [FK] [UNIQUE]
  ├─ fechaNacimiento (DateTime?)
  ├─ direccion (String?)
  ├─ ocupacion (String?)
  ├─ estadoCivil (String?)
  ├─ estado (EstadoHermano enum)
  ├─ notas (String?)
  ├─ ultimaAsistencia (DateTime?)
  └─ Relationships:
     ├─ peticionesOracion (PeticionOracion[])
     ├─ visitas (Visita[])
     ├─ seguimientos (Seguimiento[])
     └─ asistencias (AsistenciaDetalle[])

-- Redes (3 groups: Menor, Media, Mayor)
Red
  ├─ id (String) [PK]
  ├─ nombre (String)
  ├─ tipo (TipoRed enum) [MENOR|MEDIA|MAYOR]
  ├─ edadMin, edadMax (Int)
  └─ Relationships:
     ├─ lideres (User[]) - Leaders assigned
     ├─ miembros (RedMember[]) - Member associations
     ├─ eventos (Evento[]) - Events of this network
     ├─ anuncios (Anuncio[])
     └─ asistencias (Asistencia[])

-- Eventos y Calendario
Evento
  ├─ id (String) [PK]
  ├─ titulo, descripcion (String)
  ├─ fecha, hora (DateTime, String?)
  ├─ tipo (TipoEvento enum) [REUNION|CULTO|RETIRO|...]
  ├─ zoomLink, youtubeLink (String?)
  ├─ redId (String?) [FK]
  ├─ esRecurrente (Boolean)
  ├─ patron (String?) [cron pattern]
  ├─ createdAt
  └─ Relationships:
     ├─ red (Red?)
     ├─ anuncios (Anuncio[])
     └─ asistencias (Asistencia[])

-- Anuncios (Communication Hub)
Anuncio
  ├─ id (String) [PK]
  ├─ titulo, contenido (String)
  ├─ tipo (TipoAnuncio enum)
  ├─ prioridad (Prioridad enum)
  ├─ paraTodasRedes (Boolean)
  ├─ redId, eventoId (String?) [FK]
  ├─ publicadoEn, expiraEn (DateTime)
  ├─ activo (Boolean)
  ├─ createdAt
  └─ Relationships:
     ├─ red (Red?)
     └─ evento (Evento?)

-- Asistencia y Participación
Asistencia
  ├─ id (String) [PK]
  ├─ eventoId, redId (String) [FK]
  ├─ fecha (DateTime)
  ├─ total, presentes (Int)
  ├─ createdAt
  └─ Relationships:
     ├─ evento (Evento)
     ├─ red (Red)
     └─ detalles (AsistenciaDetalle[])

AsistenciaDetalle
  ├─ id (String) [PK]
  ├─ asistenciaId, hermanoId (String) [FK]
  ├─ presente (Boolean)
  ├─ nota (String?)
  └─ Relationships:
     ├─ asistencia (Asistencia)
     └─ hermano (Hermano)

-- Pastoral Care
Seguimiento
  ├─ id (String) [PK]
  ├─ hermanoId, responsableId (String) [FK]
  ├─ tipo (TipoSeguimiento enum)
  ├─ descripcion (String)
  ├─ estado (EstadoCaso enum)
  ├─ proximoContacto (DateTime?)
  ├─ privado (Boolean)
  ├─ createdAt, updatedAt
  └─ Relationships:
     └─ hermano (Hermano)

Visita
  ├─ id (String) [PK]
  ├─ hermanoId (String) [FK]
  ├─ fecha (DateTime)
  ├─ tipo (TipoVisita enum)
  ├─ notas (String?)
  ├─ realizadaPor (String)
  └─ Relationships:
     └─ hermano (Hermano)

PeticionOracion
  ├─ id (String) [PK]
  ├─ hermanoId (String) [FK]
  ├─ descripcion (String)
  ├─ prioridad (Prioridad enum)
  ├─ estado (EstadoPeticion enum)
  ├─ responsable (String?)
  ├─ privada (Boolean)
  ├─ createdAt, updatedAt
  └─ Relationships:
     └─ hermano (Hermano)

-- Documentación
Documento
  ├─ id (String) [PK]
  ├─ titulo, descripcion (String?)
  ├─ tipo (TipoDocumento enum)
  ├─ url (String)
  ├─ redId, categoria (String?)
  ├─ publicadoEn (DateTime)
  ├─ activo (Boolean)
  └─ No relationships

-- Finanzas
Cuota
  ├─ id (String) [PK]
  ├─ hermanoId, redId (String) [FK, Optional FK]
  ├─ monto (Float)
  ├─ fecha, mes, anio (DateTime, Int, Int)
  ├─ tipo (TipoCuota enum)
  ├─ estado (EstadoCuota enum)
  ├─ concepto, creadoPor (String?)
  ├─ createdAt
  └─ Relationships:
     └─ hermano (Hermano)

MetaFinanciera
  ├─ id (String) [PK]
  ├─ nombre (String)
  ├─ montoMeta, montoActual (Float)
  ├─ mes, anio (Int)
  ├─ redId (String?)
  ├─ descripcion (String?)
  ├─ activa (Boolean)
  ├─ createdAt, updatedAt
  └─ No relationships

-- Control de Acceso
Permiso
  ├─ id (String) [PK]
  ├─ userId (String) [FK]
  ├─ recurso, accion (String)
  ├─ permitido (Boolean)
  ├─ Unique: (userId, recurso, accion)
  └─ Relationships:
     └─ user (User)

RedMember (Join Table)
  ├─ userId, redId (String) [PK, FK]
  ├─ Relationships:
     ├─ user (User)
     └─ red (Red)

-- Comunicación
MensajeWhatsApp
  ├─ id (String) [PK]
  ├─ telefono (String)
  ├─ mensaje (String)
  ├─ direccion (String) [entrante|saliente]
  ├─ estado (String)
  ├─ tipo (String)
  ├─ messageId, userId (String?)
  └─ createdAt

Notificacion
  ├─ id (String) [PK]
  ├─ tipo, severidad (String)
  ├─ mensaje (String)
  ├─ leida (Boolean)
  ├─ userId, relatedId (String?)
  ├─ createdAt
  └─ Relationships:
     └─ user (User?)
```

---

## 🔌 API Layer Design

### Patrón de Request/Response

```typescript
// Request
POST /api/hermanos
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+50760000001",
  "redId": "red-menor-123",
  "ocupacion": "Ingeniero"
}

// Response (Success)
201 Created
{
  "id": "herm-123",
  "userId": "user-456",
  "user": {
    "id": "user-456",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "HERMANO"
  },
  "estado": "NUEVO",
  "ocupacion": "Ingeniero",
  "ultimaAsistencia": null,
  "createdAt": "2026-04-12T10:30:00Z"
}

// Response (Error)
400 Bad Request
{
  "error": "El email ya está registrado",
  "status": 409
}
```

### Error Handling Pattern

```typescript
export const GET = withErrorHandling(async (req) => {
  // All errors caught automatically
  // Validation errors return 400
  // Not found returns 404
  // Permission errors return 403
  // Server errors return 500 with logging
})
```

### Middleware Chain

```
Request
  │
  ├─► withErrorHandling
  │   └─► try/catch wrapper
  │       └─► Standardized error responses
  │
  ├─► requireAuth
  │   └─► Check NextAuth session
  │       └─► Extract user info
  │
  ├─► requirePermiso
  │   └─► Check Permiso table
  │       └─► Role-based checks
  │
  ├─► validateBody (optional)
  │   └─► Zod schema validation
  │
  └─► Business Logic
      └─► Prisma queries
          └─► jsonResponse or errorResponse

Response
```

---

## 🎨 Frontend Architecture

### Page Structure

```
/app/(dashboard)/hermanos/
├── page.tsx          # List view with filters, search
│   ├─ Server-side: fetch data on first load
│   ├─ Client-side: search, filter, pagination
│   └─ Component: HermanoList, HermanoTable
│
├── [id]/
│   └── page.tsx      # Detail view
│       ├─ Show full profile
│       ├─ Edit forms
│       ├─ History tabs (asistencia, seguimiento, visitas)
│       └─ Action buttons
│
└── Components used:
    ├─ DashboardLayout (header, sidebar)
    ├─ Table, Card, Button
    ├─ Forms (client-side)
    └─ Modals for CRUD operations
```

### State Management

```
Local State (useState)
├─ Form data (editing mode)
├─ Modal open/close
├─ Loading states
├─ Search/filter inputs
└─ Pagination state

Server State (Fetch)
├─ GET /api/hermanos
├─ GET /api/redes
├─ GET /api/eventos
└─ GET /api/dashboard/stats
```

### Component Hierarchy

```
App
├─ RootLayout
│  └─ HTML metadata
│  └─ Auth session provider
│  └─ Global styles
│
├─ (auth)
│  └─ LoginPage
│     └─ LoginForm
│
└─ (dashboard)
   └─ DashboardLayout
      ├─ Header
      │  └─ Logo, user menu, logout
      ├─ Sidebar
      │  └─ Nav links by role
      └─ Content Area
         ├─ DashboardPage
         │  ├─ StatsCards
         │  ├─ RecentEvents
         │  └─ PendingItems
         │
         ├─ HermanosPage
         │  ├─ SearchBar, Filters
         │  ├─ HermanoTable
         │  ├─ CreateHermanoModal
         │  └─ EditHermanoModal
         │
         └─ OtherPages...
```

---

## 🤖 IA Module Architecture

```
User Message
    │
    ├─► API POST /api/ai/chat
    │   └─► Extract message
    │
    ├─► Build Context (Prisma queries)
    │   ├─ Events (próximos 30 días)
    │   ├─ Announcements (activos)
    │   ├─ Networks (with member count)
    │   ├─ Seguimientos (próximos 7 días)
    │   ├─ Prayer requests (abiertas)
    │   ├─ Documentos (activos)
    │   └─ Finanzas (resumen)
    │
    ├─► Check for API Key
    │   ├─ If present: Call Anthropic API
    │   └─ If missing: Use mock responses
    │
    ├─► Anthropic Request
    │   ├─ Model: claude-haiku-4-5
    │   ├─ System: SYSTEM_PROMPT (Spanish, rules, context)
    │   ├─ User: buildUserPrompt (message + context)
    │   ├─ Max tokens: 1024
    │   └─ Temperature: default (creative but coherent)
    │
    ├─► Response Handling
    │   ├─ Extract text from response
    │   ├─ Error handling (fallback to mock)
    │   └─ Return to frontend
    │
    └─► Frontend Display
        └─ ChatBubble component
```

### Prompt Engineering

```
System Prompt (1200 words)
├─ Persona: "Asistente Ministerial"
├─ Core Rules:
│  ├─ Only respond with real data
│  ├─ Don't invent information
│  ├─ Escalate sensitive topics
│  └─ Spanish, warm, professional
│
├─ Knowledge:
│  ├─ Structure (3 networks)
│  ├─ Roles and hierarchy
│  ├─ Topics allowed & forbidden
│  └─ Response formats
│
└─ Special Instructions:
   ├─ Event ordering (by date)
   ├─ Announcement ordering (by priority)
   ├─ Finance rules (no personal data)
   └─ Escalation conditions

User Prompt (Dynamic)
├─ Context sections (if applicable):
│  ├─ ==== EVENTOS PRÓXIMOS ====
│  ├─ ==== ANUNCIOS ACTIVOS ====
│  ├─ ==== RESUMEN DE REDES ====
│  ├─ ==── INFORMACIÓN DE HERMANOS ====
│  ├─ ==== SEGUIMIENTOS PENDIENTES ====
│  ├─ ==== RESUMEN FINANCIERO ====
│  └─ ==== DOCUMENTOS DISPONIBLES ====
│
└─ ==== PREGUNTA DEL USUARIO ====
   └─ {user message}
```

---

## 📱 WhatsApp Integration

```
WhatsApp Message Flow

┌─── Incoming Message ───┐
│                        │
│ /api/whatsapp/webhook  │
│ (POST request from FB) │
│                        │
└────────┬───────────────┘
         │
    Extract:
    ├─ Phone number
    ├─ Message text
    ├─ Timestamp
    └─ Message ID
         │
         ├─ Identify user
         │  └─ Match with Hermano.phone
         │
         ├─ Process message
         │  ├─ Keywords detection
         │  └─ Call getAssistantResponse()
         │
         └─ Queue response
            └─ /api/whatsapp/send
               │
               ├─► Call WhatsApp API
               │   or
               ├─► Save to MensajeWhatsApp table
               └─► Mark as sent

┌─── Outgoing Message ──┐
│                       │
│ /api/whatsapp/send    │
│ (Manual or automated) │
│                       │
└─────────┬─────────────┘
          │
    Create MensajeWhatsApp record
    ├─ message
    ├─ direccion: 'saliente'
    └─ estado: 'enviado'
          │
          ├─ If WHATSAPP_PROVIDER == 'real':
          │  └─► Call WhatsApp Business API
          │
          └─ If WHATSAPP_PROVIDER == 'mock':
             └─► Simulate response (for development)
```

---

## 🚀 Deployment Architecture

```
Development
├─ npm run dev
├─ SQLite (file:./dev.db)
├─ NextAuth mock
└─ AI: Mock responses (no API key)

Production (Vercel)
├─ Edge functions
├─ Serverless API routes
├─ PostgreSQL / Neon (recommended)
├─ Prisma schema synced
├─ Environment variables:
│  ├─ ANTHROPIC_API_KEY
│  ├─ NEXTAUTH_SECRET (32+ chars)
│  ├─ NEXTAUTH_URL (production domain)
│  ├─ DATABASE_URL (connection string)
│  └─ WHATSAPP_* (if enabled)
│
└─ CI/CD:
   ├─ Automatic deploys on git push
   ├─ Environment variables from Vercel dashboard
   └─ Logs available in Vercel dashboard
```

---

## 📈 Performance Considerations

### Database Optimization

```
Indexes:
├─ User.email (for auth)
├─ Hermano.estado (for filtering)
├─ Evento.fecha (for date range queries)
├─ Anuncio.redId (for filtering)
└─ Asistencia.eventoId (for history)

Query Optimization:
├─ Use include/select in Prisma
├─ Pagination (limit, skip)
├─ Caching where applicable
└─ Batch queries with Promise.all()
```

### Frontend Optimization

```
Next.js Features:
├─ Automatic code splitting
├─ Image optimization (if images added)
├─ CSS-in-JS (Tailwind) for minimal CSS
├─ Server-side rendering (where needed)
└─ Static generation (for public pages)

Caching:
├─ Browser cache for API responses
├─ Revalidation on mutation
└─ SWR for data synchronization
```

---

## 🔍 Monitoring & Logging

```
Application Logs:
├─ Console.error for errors
├─ Console.log for debug info
├─ Structured errors in API responses
└─ Database query logging (Prisma)

Frontend Errors:
├─ Try/catch blocks in async code
├─ Error boundaries (if added)
└─ User-friendly error messages

Backend Errors:
├─ withErrorHandling middleware
├─ Automatic HTTP status codes
├─ Detailed error objects
└─ Sentry or similar (can add)
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Test validations
// Test permission checks
// Test helper functions
```

### Integration Tests
```typescript
// Test API endpoints
// Test database operations
// Test auth flows
```

### E2E Tests
```typescript
// Test user workflows
// Test CRUD operations
// Test role-based access
```

Tools recommended:
- Jest (unit testing)
- Supertest (API testing)
- Playwright (E2E testing)

---

## 📚 Modules Reference

| Module | Purpose | Key Files |
|--------|---------|-----------|
| **auth** | Authentication & Sessions | `src/lib/auth.ts`, `/api/auth/*` |
| **permissions** | Role-based access control | `src/lib/permissions.ts` |
| **validations** | Data validation | `src/lib/validations.ts` |
| **ai** | IA conversational | `src/lib/ai/*`, `/api/ai/*` |
| **whatsapp** | WhatsApp integration | `src/lib/whatsapp/*`, `/api/whatsapp/*` |
| **notifications** | User notifications | `src/lib/notifications.ts` |
| **api-helpers** | API utilities | `src/lib/api-helpers.ts` |
| **prisma** | Database client | `src/lib/prisma.ts`, `prisma/` |

---

**Architecture Document v1.0**  
*Last updated: 2026-04-12*  
*Status: Complete*
