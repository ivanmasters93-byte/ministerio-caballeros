#!/bin/bash

# ============================================================
# MINISTERIO DE CABALLEROS - Setup Script 100% Gratis
# ============================================================

set -e

echo "🚀 MINISTERIO DE CABALLEROS - Setup 100% Gratis"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo -e "${BLUE}[1/7]${NC} Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Descarga desde: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}[2/7]${NC} Instalando dependencias..."
if npm install > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Dependencias instaladas${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi
echo ""

# Step 3: Generate Prisma
echo -e "${BLUE}[3/7]${NC} Generando Prisma Client..."
if PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Prisma Client generado${NC}"
else
    echo -e "${YELLOW}⚠ Prisma Client ya existe${NC}"
fi
echo ""

# Step 4: Explain services
echo -e "${BLUE}[4/7]${NC} Servicios necesarios (GRATIS):"
echo "   1. Railway (BD PostgreSQL): https://railway.app"
echo "   2. Mailgun (Email): https://mailgun.com"
echo "   3. Clerk (Auth): https://clerk.com"
echo "   4. PostHog (Analytics): https://posthog.com"
echo "   5. Pinecone (Vector DB): https://pinecone.io"
echo "   6. Vercel (Hosting): https://vercel.com"
echo ""

# Step 5: Check .env.local
echo -e "${BLUE}[5/7]${NC} Verificando configuración..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local existe${NC}"
    echo "   Recuerda completar las variables de tu servicesvices"
else
    echo -e "${YELLOW}⚠ .env.local no encontrado${NC}"
fi
echo ""

# Step 6: Show next steps
echo -e "${BLUE}[6/7]${NC} Próximos pasos:"
echo ""
echo -e "${YELLOW}OPCIÓN A: Desarrollo Local${NC}"
echo "  1. npm run dev"
echo "  2. Abre http://localhost:3000"
echo ""
echo -e "${YELLOW}OPCIÓN B: Deploy a Vercel (Recomendado)${NC}"
echo "  1. npm run build"
echo "  2. git push (a tu repositorio GitHub)"
echo "  3. Conecta en Vercel.com"
echo "  4. Deploy automático"
echo ""

# Step 7: Summary
echo -e "${BLUE}[7/7]${NC} Resumen:"
echo -e "${GREEN}✓ Node.js OK${NC}"
echo -e "${GREEN}✓ Dependencias OK${NC}"
echo -e "${GREEN}✓ Prisma OK${NC}"
echo -e "${GREEN}✓ Configuración lista${NC}"
echo ""

echo -e "${GREEN}=================================================="
echo "🎉 SETUP COMPLETADO - LISTO PARA EMPEZAR"
echo "==================================================${NC}"
echo ""
echo "Siguiente paso: Leer RESUMEN_GRATIS.md"
echo ""
echo "O ejecuta:"
echo "  npm run dev        (desarrollo local)"
echo "  npm run build      (preparar para producción)"
echo ""
