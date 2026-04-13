# 🚀 Deploy a Vercel - Link Público para Hermanos

## ¿Por qué Vercel?
- ✅ **Gratis** 
- ✅ Es de los creadores de Next.js
- ✅ Deploy automático desde Git
- ✅ URL pública en segundos
- ✅ Tu app corre en servidores profesionales

---

## 📋 Pasos para Publicar

### PASO 1: Crear Cuenta en Vercel
1. Abre: https://vercel.com
2. Click en "Sign up" 
3. Usa tu GitHub/Google/Email
4. Completa el email

### PASO 2: Conectar tu Git (GitHub)
Si aún no tienes GitHub:
1. Abre: https://github.com
2. Crea una cuenta gratis
3. En tu PC, ejecuta:
```bash
git config --global user.email "tu.email@gmail.com"
git config --global user.name "Tu Nombre"
```

### PASO 3: Subir Código a GitHub
En tu carpeta del proyecto:
```bash
cd /Users/orionparents/ministerio-caballeros

# Inicializar git (si no está hecho)
git init

# Agregar cambios
git add .

# Commit
git commit -m "GEDEONES - Primera versión con registro interactivo"

# Crear repositorio en GitHub:
# 1. Abre https://github.com/new
# 2. Nombre: "gedeones" 
# 3. Click "Create repository"
# 4. Copia el comando que aparece y ejecuta:
git branch -M main
git remote add origin https://github.com/TU_USERNAME/gedeones.git
git push -u origin main
```

### PASO 4: Importar a Vercel
1. En Vercel dashboard, click "Add New Project"
2. Click "Import Git Repository"
3. Pega: `https://github.com/TU_USERNAME/gedeones.git`
4. Click "Import"

### PASO 5: Configurar Variables de Entorno
En Vercel, ve a "Settings" → "Environment Variables"

Agrega estas variables (cópialas de tu `.env.local`):

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://gedeones.vercel.app

CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...

MAILGUN_API_KEY=...
MAILGUN_DOMAIN=...

PINECONE_API_KEY=...
PINECONE_INDEX=...

POSTHOG_API_KEY=...
NEXT_PUBLIC_POSTHOG_KEY=...

GROQ_API_KEY=...
```

⚠️ NO copies el contenido real aquí - es un ejemplo

### PASO 6: Deploy
1. Click "Deploy"
2. Espera 2-3 minutos
3. ¡Listo! Tendrás un link como: `https://gedeones.vercel.app`

---

## 🔗 Link Final para Hermanos

Una vez deployed:

```
https://gedeones.vercel.app/registro-hermanos
```

**O personalizado (si compras dominio):**

```
https://www.gedeones.com/registro-hermanos
```

---

## 📱 Mensaje para Compartir por WhatsApp

```
¡Hola hermano! 🙏

Te invitamos a registrarte en GEDEONES, 
nuestra plataforma de comunidad ministerial.

Solo toma 2 MINUTOS:

👉 https://gedeones.vercel.app/registro-hermanos

¡Conectémonos en fe!
```

---

## 🎯 Alternativas (si Vercel no funciona)

### Opción 2: Railway (Gratis)
1. Abre: https://railway.app
2. Click "Deploy Now"
3. Conecta tu GitHub
4. Configura variables de entorno
5. Obtén URL pública

### Opción 3: Render (Gratis)
1. Abre: https://render.com
2. Click "New +" → "Web Service"
3. Conecta GitHub
4. Configura variables
5. Deploy automático

---

## ✅ Checklist Final

- [ ] Cuenta GitHub creada
- [ ] Código pusheado a GitHub
- [ ] Cuenta Vercel creada
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy completado
- [ ] Link público funcionando
- [ ] Probé el formulario en la URL pública
- [ ] Compartí el link con hermanos

---

## 🆘 Si algo falla

**Error: "Build failed"**
- Revisar logs en Vercel
- Asegurar que todas las variables están configuradas
- Verificar que `package.json` tiene todas las dependencias

**Error: "Cannot find module"**
- Ejecutar en local: `npm install`
- Hacer push de nuevo a GitHub

**Error: "Database connection failed"**
- Verificar que DATABASE_URL es correcta
- Asegurar que la BD está activa (Railway, etc)

---

## 📊 Monitoreo

Desde Vercel dashboard puedes ver:
- ✅ Logs de deploy
- ✅ Logs de ejecución
- ✅ Estadísticas de uso
- ✅ Errores en tiempo real

---

## 🎉 ¡Listo!

Tu app está en vivo. Ahora todos los hermanos pueden registrarse desde:

**https://gedeones.vercel.app/registro-hermanos**

Sin importar dónde estén en el país. ✨
