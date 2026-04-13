# 📋 Guía de Uso - Página de Registro Interactivo GEDEONES

## ¿Qué es?

Se ha creado una **página web interactiva** donde los hermanos pueden registrarse completamente en GEDEONES. Es un formulario visual, amigable y sin intimidación que recolecta toda la información necesaria en pasos simples.

---

## 🔗 Cómo Acceder

### Opción 1: En Desarrollo Local
```
http://localhost:3000/registro-hermanos
```

### Opción 2: En Producción (cuando se depliegue)
```
https://tudominio.com/registro-hermanos
```

### Opción 3: Compartir Link Directo
Simplemente comparte el link con los hermanos por:
- WhatsApp
- Email
- SMS
- Redes Sociales

---

## 🎯 Características de la Página

### ✨ Diseño
- **Responsivo**: Funciona perfecto en celular, tablet y computadora
- **Intuitivo**: Pasos claros y fáciles de seguir
- **Profesional**: Colores ministeriales (azul y naranja)
- **Rápido**: Se carga instantáneamente

### 📱 Flujo del Registro

**Paso 1: Bienvenida (Intro)**
- Explicación breve de qué es GEDEONES
- Funcionalidades principales destacadas
- Botón para comenzar

**Paso 2: Información Personal**
- Nombre Completo
- Edad
- Teléfono
- Email (será tu usuario de acceso)

**Paso 3: Información Adicional**
- Dirección
- Ocupación
- Estado Civil (selectable)

**Paso 4: Seleccionar Red Ministerial**
- 🌱 Red Menor (18-30 años)
- 🌿 Red Media (31-40 años)
- 🌳 Red Mayor (41-75 años)

**Paso 5: Confirmación de Éxito**
- Mensaje congratulatorio
- Email de bienvenida con contraseña temporal
- Próximos pasos

---

## ⚙️ Cómo Funciona (Backend)

### API Endpoint
- **Ruta**: `/api/registro-hermanos`
- **Método**: `POST`
- **Validación**: Todos los campos requeridos
- **Seguridad**: Contraseñas hasheadas con bcrypt

### Datos que se Guardan

**En User**
- name (Nombre)
- email (Email único)
- phone (Teléfono)
- password (Hashed)
- role: "HERMANO"

**En Hermano**
- fechaNacimiento (calculada de la edad)
- direccion (Dirección)
- ocupacion (Ocupación)
- estadoCivil (Estado Civil)
- estado: "NUEVO" (por defecto)

**En RedMember**
- Automáticamente asignado a su red según edad

---

## 📧 Email de Bienvenida

Después de registrarse, el hermano recibe un email con:

```
✅ Credenciales de acceso
✅ Contraseña temporal (debe cambiarla al primer acceso)
✅ Información sobre su red asignada
✅ Próximos pasos
✅ Link directo a GEDEONES
```

---

## 🔐 Seguridad

- ✅ Validación en cliente (feedback inmediato)
- ✅ Validación en servidor (no confiar en cliente)
- ✅ Emails únicos (no duplicados)
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Contraseña temporal que debe cambiarse

---

## 📊 Monitoreo

### Ver Registros en la BD
```sql
SELECT * FROM "User" WHERE role = 'HERMANO' ORDER BY "createdAt" DESC;
SELECT * FROM "Hermano" LIMIT 10;
SELECT * FROM "RedMember" WHERE "redId" IS NOT NULL;
```

---

## 🚀 Implementación Técnica

### Archivos Creados

1. **`src/app/registro-hermanos/page.tsx`**
   - Componente React principal
   - Estados y validaciones
   - 4 pasos de registro
   - UI responsiva con Tailwind

2. **`src/app/api/registro-hermanos/route.ts`**
   - Endpoint POST para registros
   - Validaciones de datos
   - Creación de User + Hermano + RedMember
   - Envío de email de bienvenida

3. **`src/lib/mailgun.ts` (actualizado)**
   - Nueva función `sendWelcomeEmail()`
   - Template HTML profesional
   - Incluye credenciales y próximos pasos

---

## 📝 Flujo de Datos Completo

```
1. Hermano accede a /registro-hermanos
   ↓
2. Completa 4 pasos del formulario
   ↓
3. Click en "Registrarse"
   ↓
4. Validación en cliente (feedback instantáneo)
   ↓
5. POST a /api/registro-hermanos
   ↓
6. Validación en servidor
   ↓
7. Hash de contraseña
   ↓
8. Creación de User en BD
   ↓
9. Creación de Hermano en BD
   ↓
10. Asignación a Red (según edad)
   ↓
11. Envío de email de bienvenida
   ↓
12. Respuesta de éxito
   ↓
13. Página muestra "¡Excelente!"
   ↓
14. Hermano puede acceder con email + contraseña temporal
```

---

## 🎓 Cómo Compartir con los Hermanos

### Vía WhatsApp
```
¡Hola hermano! 🙏

Te invitamos a registrarte en GEDEONES, nuestra plataforma de comunidad.

Solo toma 2 minutos:
👉 https://gedeones.app/registro-hermanos

¡Conectémonos en fe!
```

### Vía Email
```
Asunto: ¡Únete a GEDEONES!

Querido [Nombre],

Te invitamos a ser parte de GEDEONES, nuestra plataforma de conexión ministerial.

Haz clic aquí para registrarte:
https://gedeones.app/registro-hermanos

¿Preguntas? Contacta a tu líder de red.

En fe,
[Tu Liderazgo]
```

---

## ✅ Checklist para Implementación

- [ ] Verificar que la app está corriendo (`npm run dev`)
- [ ] Acceder a `http://localhost:3000/registro-hermanos`
- [ ] Probar el flujo completo de registro
- [ ] Verificar que se crea el usuario en la BD
- [ ] Verificar que se asigna a la red correcta
- [ ] Probar que el email de bienvenida se envía (si Mailgun está configurado)
- [ ] Configurar la URL pública en `.env.local` (NEXT_PUBLIC_APP_URL)
- [ ] Compartir link con hermanos

---

## 🐛 Troubleshooting

### "Error: Email ya registrado"
- El hermano ya tiene cuenta
- Sugerir cambiar de email o usar el existente

### "Error en la validación"
- Completar todos los campos
- Email debe ser válido (contener @)
- Edad debe ser número entre 18-100
- Teléfono y dirección no pueden estar vacíos

### "No recibe email de bienvenida"
- Verificar que Mailgun está configurado en `.env.local`
- Revisar console del servidor para errores
- Revisar spam/promociones en email

### "La página no carga"
- Verificar que Next.js está corriendo
- Revisar console del navegador
- Limpiar cache y recargar

---

## 🎨 Personalización

Si necesitas cambiar:
- **Colores**: Editar valores de color en `page.tsx` y `route.ts`
- **Preguntas**: Modificar los campos en los formularios
- **Texto**: Cambiar strings en Spanish
- **Email template**: Actualizar función `sendWelcomeEmail()` en `mailgun.ts`

---

## 📞 Soporte

Para preguntas o cambios, contactar al equipo técnico.

**GEDEONES © 2024 - Ministerio de Caballeros**
