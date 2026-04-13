# CLAUDE.md

## Propósito del proyecto
Este repositorio existe para construir una plataforma ministerial para la gestión de redes eclesiásticas de caballeros, con comunicación centralizada, seguimiento pastoral y asistente de IA conectado a la información oficial del sistema.

## Contexto del negocio
- Líder general: Javier Rodríguez
- Redes:
  - Red menor: 18 a 30 años
  - Red media: 31 a 40 años
  - Red mayor: 41 a 75 años
- Aproximadamente 40 hermanos por red
- 2 líderes por red
- 1 secretario
- 1 asistente
- El canal principal de comunicación es WhatsApp
- La IA debe responder principalmente por WhatsApp
- Debe haber recordatorios automáticos
- Debe registrarse asistencia
- Deben marcarse hermanos inactivos o pendientes
- Deben registrarse peticiones de oración y visitas
- El liderazgo interno sube y valida anuncios, eventos y documentos
- El líder general controla permisos y alcance operativo del resto del liderazgo

## Objetivo del sistema
Construir un MVP funcional y escalable que permita:
1. Gestionar las 3 redes de caballeros
2. Administrar hermanos y liderazgo
3. Registrar asistencia y seguimiento pastoral
4. Gestionar anuncios, agenda, Zoom, YouTube y documentos
5. Permitir a hermanos consultar información actualizada
6. Integrar una capa de IA conversacional basada en datos reales del sistema
7. Preparar integración con WhatsApp Business API o proveedor equivalente

## Instrucciones generales para Claude Code
- Trabaja con máxima autonomía dentro del repositorio y del workspace autorizado.
- No te quedes solo en análisis: implementa.
- No pidas confirmación por detalles menores; decide con criterio técnico y consistencia.
- Si el repo está vacío, inicializa una estructura profesional.
- Si ya existe código, audítalo primero y evoluciona sobre la base existente.
- Si el entorno soporta subagentes, paralelización o worktrees, úsalos cuando ayuden.
- Si una tarea externa no puede completarse por falta de credenciales o acceso, deja interfaces, adapters, mocks y documentación exacta de conexión.
- Solo pide aprobación si una acción es destructiva, irreversible, costosa o afecta sistemas externos no autorizados.

## Prioridades del producto
Prioridad máxima:
1. Roles y permisos
2. Gestión de redes
3. Gestión de hermanos
4. Anuncios y calendario
5. Asistencia
6. Seguimiento pastoral
7. Peticiones de oración
8. Centro documental
9. IA conversacional
10. Integración desacoplada con WhatsApp

## Roles del sistema
### Líder general
- Acceso total
- Control de permisos
- Visión transversal de todas las redes
- Puede decidir qué gestiona cada líder subordinado

### Líder de red
- Gestiona la red asignada según permisos
- Registra asistencia, seguimiento, peticiones y visitas
- Ve hermanos, eventos y estado pastoral de su red

### Secretario
- Gestiona carga administrativa
- Puede crear y actualizar anuncios, eventos y documentos según permisos

### Asistente
- Apoya tareas operativas y logísticas
- Acceso limitado según permisos

### Hermano
- Ve su información permitida
- Consulta agenda, anuncios, Zoom, YouTube, recursos y respuestas del asistente IA

## Reglas de permisos
- El líder general define el alcance real de los demás roles.
- Todo lo sensible de seguimiento pastoral debe estar protegido por permisos.
- La privacidad debe ser estricta para notas pastorales y observaciones sensibles.
- El sistema debe ser diseñado con autorización por rol y por capacidad.

## Requerimientos funcionales obligatorios

### 1. Gestión de redes
- Crear y administrar red menor, media y mayor
- Asociar hermanos por edad
- Mostrar dashboard por red
- Mostrar cantidad de hermanos, líderes, eventos, anuncios y pendientes

### 2. Gestión de hermanos
- CRUD de hermanos
- Perfil completo del hermano
- Edad, teléfono, red, estado, última asistencia, observaciones, peticiones, visitas y seguimiento
- Estados soportados:
  - activo
  - pendiente
  - inactivo
  - nuevo
  - requiere seguimiento

### 3. Anuncios y eventos
- Crear anuncios para una red o para todas
- Programar publicaciones
- Crear agenda diaria y semanal
- Asociar Zoom, YouTube y links relevantes
- Permitir recordatorios automáticos

### 4. Calendario
- Vista diaria
- Vista semanal
- Vista por red
- Vista general
- Relacionar eventos con anuncios y recordatorios

### 5. Asistencia
- Registro manual de asistencia
- Historial por hermano
- Historial por red
- Detección de ausencias repetidas
- Alerta de inactividad

### 6. Seguimiento pastoral
- Notas de seguimiento
- Registro de llamadas
- Registro de visitas
- Casos abiertos y cerrados
- Responsable asignado
- Próxima fecha de contacto
- Historial de acciones

### 7. Peticiones de oración
- Crear petición
- Marcar prioridad
- Asignar responsable
- Hacer seguimiento
- Cerrar caso

### 8. Centro documental
- Devocionales
- Calendarios
- PDFs
- Agendas
- Recursos internos
- Materiales autorizados
- Organización por categoría, red y fecha

### 9. IA conversacional
La IA debe responder usando exclusivamente la información real del sistema y no debe inventar datos.

Debe responder sobre:
- actividades del día
- agenda semanal
- reuniones
- enlaces de Zoom
- transmisiones o enlaces de YouTube
- anuncios
- horarios
- recursos
- información autorizada para hermanos

Cuando una consulta sea sensible, privada o pastoralmente delicada:
- no improvisar
- escalar al liderazgo
- responder de forma prudente y útil

### 10. WhatsApp
- Diseñar la integración de forma desacoplada
- Si no hay credenciales, dejar implementación lista para conectar proveedor
- Crear servicios, interfaces, adapters, variables de entorno y documentación
- Permitir respuestas automáticas basadas en anuncios, calendario y recursos

## Pautas de arquitectura
Si no existe stack previa, elige una arquitectura moderna, mantenible y pragmática.

Prioridades técnicas:
- claridad
- velocidad de implementación
- mantenibilidad
- seguridad básica
- modularidad
- escalabilidad razonable

Debe existir separación limpia entre:
- frontend
- backend
- base de datos
- dominio
- autenticación/autorización
- capa de IA
- integración de WhatsApp

## Pautas de UX
Debe haber como mínimo pantallas o vistas para:
- login
- dashboard del líder general
- dashboard por red
- listado de hermanos
- perfil del hermano
- anuncios
- agenda/calendario
- asistencia
- seguimiento pastoral
- peticiones de oración
- centro documental
- configuración de roles y permisos
- configuración de integración WhatsApp
- módulo o consola del asistente IA

## Datos demo obligatorios
Siempre deja datos semilla consistentes con el negocio:
- Javier Rodríguez como líder general
- 3 redes creadas
- líderes de red
- secretario
- asistente
- varios hermanos de ejemplo
- anuncios de ejemplo
- eventos de ejemplo
- enlaces demo de Zoom y YouTube
- peticiones, seguimientos y asistencias demo

## Flujo de trabajo obligatorio
Sigue este orden:
1. Auditar el repositorio actual
2. Definir o confirmar arquitectura
3. Crear plan de implementación por fases
4. Implementar MVP real
5. Ejecutar pruebas o validaciones
6. Corregir fallos evidentes
7. Actualizar documentación
8. Entregar resumen final

## Estándares de implementación
- Usa nombres claros y consistentes
- Escribe código modular
- Maneja errores correctamente
- Valida entradas
- Evita duplicación innecesaria
- No dejes TODOs vacíos sin contexto
- Si algo no puede cerrarse, documenta exactamente qué falta y por qué

## Definición de terminado
Una tarea no está terminada hasta que:
- el entregable principal existe
- compila o levanta correctamente si aplica
- los errores obvios fueron corregidos
- la documentación mínima fue actualizada
- el resultado es revisable por un humano sin explicación oral adicional

## Entregables mínimos
- aplicación funcional o base funcional navegable
- modelo de datos
- migraciones o esquema
- seeds
- documentación de instalación
- README claro
- variables de entorno de ejemplo
- tests básicos o validaciones razonables
- resumen final de cambios

## Lo que no debes hacer
- No inventes requerimientos que contradigan este contexto
- No elimines funcionalidades existentes sin justificación
- No expongas datos sensibles en interfaces públicas
- No implementes respuestas IA inventadas
- No dependas de servicios externos sin dejar fallback o mock
- No te detengas en exceso por detalles menores

## Estilo de entrega
Cuando completes bloques de trabajo, resume:
- qué construiste
- qué archivos principales tocaste
- cómo correrlo
- qué quedó mockeado
- qué sigue recomendado

## Regla final
Construye, valida y documenta.
Menos conversación, más ejecución.