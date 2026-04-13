#!/bin/bash
cd "$(dirname "$0")"

echo "================================================"
echo "  GEDEONES — Deploy a Vercel"
echo "================================================"

# Fix git lock if exists
rm -f .git/index.lock 2>/dev/null

# Remove broken worktree references
git worktree prune 2>/dev/null

# Verify we're in the right place
echo "📁 Directorio: $(pwd)"
echo "🌿 Branch: $(git branch --show-current 2>/dev/null)"
echo ""

# Stage all changes
echo "📦 Preparando cambios..."
git add -A

# Show what's being committed
echo ""
echo "📝 Archivos modificados:"
git diff --cached --name-only

echo ""

# Commit
git commit -m "feat: Flyers con IA Canva integrada + galeria de plantillas reales

- Tab Canva IA: 6 categorias con 4 variantes c/u generadas con Canva AI
- Plantillas guardadas en cuenta Canva con links de edicion directa
- Tab Plantilla: editor local con fondos Unsplash
- Tab Generar Nuevo: generacion bajo demanda via API
- API routes /api/flyers/generate y /api/flyers/save
- CANVA_API_TOKEN en .env.local y .env.example"

echo ""
echo "🚀 Enviando a GitHub (activa deploy en Vercel)..."
git push origin main

echo ""
echo "================================================"
echo "✅ LISTO — Vercel desplegará en ~2 minutos"
echo "🌐 https://ministerio-caballeros.vercel.app"
echo "================================================"
echo ""
read -p "Presiona Enter para cerrar..."
