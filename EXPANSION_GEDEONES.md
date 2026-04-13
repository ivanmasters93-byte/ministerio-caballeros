# 🚀 PLAN DE EXPANSIÓN - GEDEONES 2.0

**Análisis de funcionalidades nuevas para potenciar el ministerio.**

---

## 📊 LO QUE TENEMOS HOY ✅

```
✅ Gestión de Redes (3 grupos por edad)
✅ Registro de Hermanos (perfiles completos)
✅ Eventos y Calendario
✅ Asistencia automática
✅ Seguimiento pastoral
✅ Peticiones de oración
✅ Anuncios y comunicación
✅ Centro documental
✅ Asistente IA (Claude)
✅ Autenticación segura
✅ Base de datos PostgreSQL
✅ Hosting en Vercel
✅ 100% GRATIS
```

---

## 🎯 LO QUE QUIERES AGREGAR

### 1. 📱 **APP MÓVIL** (Para revisar/controlar día a día)
### 2. 📖 **BIBLIA INTEGRADA** (Consultas rápidas)
### 3. 📹 **VIDEO LLAMADAS GRATIS** (Estilo Zoom)
### 4. 🎨 **EDITOR DE FLYERS** (Para líderes)
### 5. 🎤 **TRANSCRIPCIÓN DE PRÉDICAS** (En vivo)
### 6. 📝 **RESÚMENES AUTOMÁTICOS** (Para caballeros)

---

## ✅ LO QUE PODEMOS HACER GRATIS

### 1. 📱 APP MÓVIL ✅
```
OPCIÓN A: Responsive Web (Móvil optimizado)
├─ Mismo sitio pero optimizado para celular
├─ Gratis
├─ No requiere App Store
├─ Funciona en cualquier navegador
└─ Tiempo: 2 semanas

OPCIÓN B: PWA (Progressive Web App)
├─ Funciona sin internet (offline)
├─ Se instala como app
├─ Sincroniza cuando hay conexión
├─ Gratis
└─ Tiempo: 3 semanas

OPCIÓN C: React Native (App real iOS/Android)
├─ Código compartido: web + mobile
├─ Más lento de desarrollar
├─ Distribuir por App Store (costo $99/año)
└─ Tiempo: 8 semanas

RECOMENDACIÓN: PWA (mejor relación costo-tiempo)
```

### 2. 📖 BIBLIA INTEGRADA ✅
```
OPCIÓN A: API Gratis de Biblia Online
├─ API: https://api.scriptures.com (gratis)
├─ +43,000 versículos en español
├─ Búsqueda por palabra
├─ Lectura diaria sugerida
├─ Tiempo: 1 semana
└─ Costo: $0

OPCIÓN B: BD local de Biblia
├─ Descargar Biblia en JSON
├─ Importar a PostgreSQL
├─ Búsqueda local (más rápido)
├─ Trabajo offline
├─ Tiempo: 2 semanas
└─ Costo: $0

RECOMENDACIÓN: API gratis para empezar
Luego migrar a BD local si se necesita más velocidad

Funciones sugeridas:
├─ Buscar por palabra
├─ Lectura diaria
├─ Compartir versículos
├─ Notas personales
└─ Plan de lectura
```

### 3. 📹 VIDEO LLAMADAS GRATIS ✅
```
OPCIÓN A: Jitsi Meet (Embebido)
├─ Código abierto
├─ Gratis sin límite
├─ Sin necesidad de descargar app
├─ Soporta 500+ participantes
├─ Grabación incluida
├─ Tiempo: 1 semana
└─ Costo: $0

OPCIÓN B: Daily.co (Free tier)
├─ Gratis: 100 min/mes
├─ Mejor calidad que Jitsi
├─ API inteligente
├─ Tiempo: 1 semana
└─ Costo: $0-40/mes si crece

OPCIÓN C: Whereby (Embebido)
├─ Gratis: 3 llamadas/mes
├─ Buena para reuniones pequeñas
├─ Tiempo: 3 días
└─ Costo: $0-99/mes

RECOMENDACIÓN: Jitsi Meet (gratis sin límite)

Implementación:
├─ Crear evento con link de Jitsi
├─ Grabar automáticamente
├─ Compartir grabaciones después
└─ Integrar en calendario de eventos
```

### 4. 🎨 EDITOR DE FLYERS ✅
```
OPCIÓN A: Canva API (Gratis tier)
├─ API para crear diseños
├─ +10,000 templates
├─ Gratis: 5 diseños/mes
├─ Tiempo: 2 semanas
└─ Costo: $0 (tier gratis)

OPCIÓN B: Fabric.js (Librería local)
├─ Editor de diseño embebido
├─ +100% personalizable
├─ Plantillas propias
├─ Gratis
├─ Tiempo: 3-4 semanas
└─ Costo: $0

OPCIÓN C: Penpot (Open source)
├─ Herramienta diseño open-source
├─ Integración via API
├─ Gratis
├─ Tiempo: 2 semanas
└─ Costo: $0

RECOMENDACIÓN: Canva API gratis tier + backend simple

Flujo:
├─ Líder elige template
├─ Edita textos (evento, horario, lugar)
├─ Sube logo/imagen
├─ Descarga PDF o imagen
└─ Comparte en WhatsApp
```

### 5. 🎤 TRANSCRIPCIÓN DE PRÉDICAS ✅
```
OPCIÓN A: Google Cloud Speech-to-Text (Gratis)
├─ 60 minutos/mes gratis
├─ Transcripción en tiempo real
├─ Soporte español
├─ Tiempo: 1 semana
└─ Costo: $0-15/mes (si pasas 60 min)

OPCIÓN B: Whisper de OpenAI (Gratis)
├─ Modelo de IA de OpenAI
├─ Muy preciso con español
├─ Puedes ejecutar localmente (gratis)
├─ Tiempo: 1 semana
└─ Costo: $0 (local) o $0.006/minuto (API)

OPCIÓN C: Rev.ai (Gratis tier)
├─ Gratis: 5 horas/mes
├─ Muy preciso (95%+)
├─ Soporte español
├─ Tiempo: 5 días
└─ Costo: $0-10/mes

RECOMENDACIÓN: Whisper local (gratis, sin límite)

Arquitectura:
├─ Pastor transmite (Jitsi o grabación)
├─ Audio se procesa con Whisper
├─ Transcripción en tiempo real → BD
├─ Guardar texto completo
└─ Disponible para hermanos
```

### 6. 📝 RESÚMENES AUTOMÁTICOS ✅
```
OPCIÓN A: Anthropic Claude API (Necesita API key)
├─ Resúmenes inteligentes
├─ Puntos clave automáticos
├─ Lenguaje natural
├─ Costo: $0.003 por resumen (~100 palabras)
└─ Tiempo: 3 días

OPCIÓN B: Ollama (Open source local)
├─ LLM ejecutado localmente
├─ Gratis sin límite
├─ Más lento pero sin costos
├─ Tiempo: 1 semana
└─ Costo: $0

OPCIÓN C: LangChain + Groq (Gratis tier)
├─ Resúmenes muy rápidos
├─ Gratis: 15,000 tokens/hora
├─ Realmente rápido
├─ Tiempo: 3-4 días
└─ Costo: $0 (tier gratis)

RECOMENDACIÓN: LangChain + Groq (rápido y gratis)

Flujo:
├─ Transcripción finaliza
├─ Sistema genera resumen automático
├─ Extrae 3-5 puntos clave
├─ Genera 2-3 preguntas reflexivas
└─ Envía por email a hermanos
```

---

## 🔧 ARQUITECTURA EXPANDIDA

```
┌─────────────────────────────────────────────────┐
│         GEDEONES 2.0 - Arquitectura             │
├─────────────────────────────────────────────────┤
│                                                 │
│  WEB DESKTOP          MÓVIL (PWA)               │
│  (Vercel)             (Offline first)           │
│       │                    │                    │
│       └────────┬───────────┘                    │
│              Next.js 16                         │
│        ├─ Dashboard                             │
│        ├─ Gestión de redes                      │
│        ├─ Biblia integrada         ← NUEVO     │
│        ├─ Video llamadas           ← NUEVO     │
│        ├─ Editor de flyers         ← NUEVO     │
│        ├─ Prédicas + resúmenes     ← NUEVO     │
│        └─ Asistente IA                         │
│              │                                  │
│    ┌─────────┼──────────┬──────────────────┐   │
│    │         │          │                  │   │
│    ▼         ▼          ▼                  ▼   │
│ PostgreSQL  Jitsi    Whisper         Groq/LLM │
│ (Railway)  (Video)   (Transcribe)    (Resumen)│
│    │        Gratis     Gratis         Gratis  │
│    │                                          │
│    └──────────────────────────────────────────┘
│
└─────────────────────────────────────────────────┘
```

---

## 📋 MATRIZ: QUÉ PODEMOS HACER Y COSTO

| Feature | Implementación | Tiempo | Costo/mes | Dificultad |
|---------|---|---|---|---|
| **App Móvil (PWA)** | Next.js native | 2 sem | $0 | ⭐⭐ |
| **Biblia integrada** | API scriptures.com | 1 sem | $0 | ⭐ |
| **Video llamadas** | Jitsi Meet | 1 sem | $0 | ⭐ |
| **Editor Flyers** | Canva API gratis | 2 sem | $0 | ⭐⭐ |
| **Transcripción** | Whisper local | 1 sem | $0 | ⭐⭐⭐ |
| **Resúmenes** | Groq LLM gratis | 3 días | $0 | ⭐⭐ |

---

## 🎯 PROPUESTA DE FASES

### FASE 1: MÓVIL + BIBLIA (3 semanas) 🔥
```
PRIORIDAD: ALTA (usuarios usan celular día a día)

Semana 1:
├─ Optimizar web para móvil
├─ PWA configuración
└─ Offline first (caché)

Semana 2:
├─ API Biblia integrada
├─ Búsqueda de versículos
└─ Lectura diaria

Semana 3:
├─ Testing
├─ Optimización
└─ Deploy a Vercel

Resultado: App móvil + Biblia funcional
Usuarios pueden: revisar eventos, hermanos, biblia (sin conexión)
```

### FASE 2: VIDEO + FLYERS (3 semanas)
```
PRIORIDAD: ALTA (se necesita para comunicación)

Semana 1:
├─ Integración Jitsi Meet
├─ Crear eventos con video
└─ Grabación automática

Semana 2:
├─ Editor de Flyers (Canva API)
├─ Plantillas personalizadas
└─ Descarga PDF/imagen

Semana 3:
├─ Testing
├─ Integración con eventos
└─ Deploy

Resultado: Reuniones en vivo + marketing visual
Líderes pueden: transmitir reuniones, crear flyers en minutos
```

### FASE 3: PRÉDICAS INTELIGENTES (3-4 semanas)
```
PRIORIDAD: MEDIA-ALTA (valor educativo)

Semana 1:
├─ Setup Whisper (transcripción)
├─ Integración con Jitsi
└─ Testing de precisión

Semana 2:
├─ Integración Groq (resúmenes)
├─ Extracción de puntos clave
└─ Preguntas reflexivas

Semana 3:
├─ BD para prédicas
├─ Historial y búsqueda
└─ Email automático a hermanos

Semana 4:
├─ Testing completo
├─ Optimización
└─ Deploy

Resultado: Pastor predica → Transcripción + Resumen automático
Hermanos reciben resumen en email + pueden leer texto completo
```

---

## 💰 COSTO TOTAL EXPANDIDO

### HOY (Actual)
```
Railway (BD):     $0
Mailgun:          $0
Clerk:            $0
PostHog:          $0
Pinecone:         $0
Vercel:           $0
────────────────────
TOTAL:            $0/mes
```

### CON EXPANSIÓN (Worst case - si usas servicios pagos)
```
Todo lo anterior:                    $0
+ Jitsi (self-hosted):              $0
+ Biblia (API gratis):              $0
+ Transcripción Whisper (local):    $0
+ Resúmenes Groq (tier gratis):     $0
+ Canva API (tier gratis):          $0
────────────────────────────────────────
TOTAL SEGUIRÍA SIENDO:              $0/mes

Nota: Si crece mucho:
├─ Groq: $0-50/mes (millones de tokens)
├─ Canva: $0-300/mes (diseños premium)
└─ Video: $0-100/mes (mucho ancho de banda)
```

---

## 🎨 MOCKUP: CÓMO SE VERÍA

### App Móvil (PWA)
```
┌─────────────────────┐
│  GEDEONES 📱        │
├─────────────────────┤
│ 👥 Mi Red Menor     │ ← Hermanos
│ 📅 Próximo evento   │ ← Evento (video link)
│ 📖 Biblia hoy       │ ← Lectura diaria
│ 🎤 Prédica anterior │ ← Resumen + transcripción
│ 🎨 Crear Flyer      │ ← Editor
│ 🙏 Mi petición      │ ← Peticiones
│ 💬 Chat IA          │ ← Asistente
└─────────────────────┘
```

### Editor de Flyers
```
┌──────────────────────────────┐
│ 📋 Flyers de Eventos         │
├──────────────────────────────┤
│ [Template] [Template] [+]    │
│                              │
│ ┌──────────────────────────┐ │
│ │ REUNIÓN RED MENOR        │ │
│ │ Sábado 19:00             │ │
│ │ En el local              │ │
│ │ [LOGO GEDEONES]          │ │
│ │                          │ │
│ │ Informes: Pastor Juan    │ │
│ └──────────────────────────┘ │
│                              │
│ [Descargar] [Compartir]      │
└──────────────────────────────┘
```

### Prédica en Vivo + Resumen
```
┌──────────────────────────────┐
│ 🎤 Prédica en Vivo           │
├──────────────────────────────┤
│ Pastor: "El perdón es..."    │
│ Asistentes: 45/60            │
│                              │
│ [Cámara] [Audio] [Grabar]   │
│                              │
│ 📝 Transcribiendo...        │
│ ✅ Transcripción OK          │
│                              │
│ 🤖 Generando resumen...      │
│ ✅ Resumen listo             │
│                              │
│ Puntos clave:               │
│ • Perdón es liberación       │
│ • Soltar resentimiento       │
│ • Sanar relaciones           │
│                              │
│ [Enviar a hermanos]          │
└──────────────────────────────┘
```

---

## 🚀 SIGUIENTES PASOS

### OPCIÓN 1: Empezar pequeño (Recomendado)
```
Semana 1-2:
└─ App Móvil optimizada + Biblia API
└─ Resultado: Hermanos consultan desde celular

Semana 3-4:
└─ Jitsi video + Grabación
└─ Resultado: Reuniones en vivo

Después:
└─ Flyers, Transcripción, Resúmenes
```

### OPCIÓN 2: Todo junto (Agresivo)
```
Mes 1: Todas las features simultáneamente
Riesgo: Bugs, problemas de integración
```

---

## ❓ PREGUNTAS PARA DECIDIR

1. **¿Cuál es la prioridad?**
   - ¿App móvil? 📱
   - ¿Biblia integrada? 📖
   - ¿Video llamadas? 📹
   - ¿Todas? ✅

2. **¿Presupuesto de tiempo?**
   - 2 semanas
   - 1 mes
   - 2-3 meses

3. **¿Quién usa más?**
   - Hermanos (necesitan móvil + biblia)
   - Líderes (necesitan flyers + reportes)
   - Pastor (necesita video + transcripción)
   - Todos

4. **¿Qué usa día a día?**
   - Evento del fin de semana
   - Consulta biblia
   - Ve si tiene petición de oración
   - Descarga flyer para compartir

---

## 📌 RECOMENDACIÓN FINAL

**INICIA CON FASE 1 (App móvil + Biblia)**

Por qué:
- ✅ Impacto inmediato (usuarios día a día)
- ✅ Desarrollo rápido (2-3 semanas)
- ✅ Bajo riesgo (cambios mínimos)
- ✅ Base para agregar más después

Flujo después:
```
Semana 1-3:  App Móvil + Biblia
Semana 4-6:  Video + Flyers
Semana 7-10: Prédicas + Resúmenes

Total: 10 semanas para todas las features
Costo: $0/mes
```

---

## ✅ SIGUIENTE PASO

**Escoge:**

1. **Empezar con Fase 1** (Móvil + Biblia primero)
2. **Empezar con Fase 2** (Video + Flyers primero)
3. **Empezar todo junto** (Todas las fases)
4. **Prioridad diferente** (Dime cuál quieres primero)

Una vez decidas, hago el plan detallado y comenzamos a implementar.

---

**¿Cuál es tu prioridad? Dime y comenzamos.**
