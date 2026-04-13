"use client";

import { useState, useRef, useCallback, type ChangeEvent } from "react";
import {
  Download,
  Share2,
  ImageIcon,
  Palette,
  Upload,
  RotateCcw,
  Sparkles,
  Bus,
  Church,
  Moon,
  Flame,
  Music,
  Heart,
  Star,
  Cross,
  Calendar,
  Zap,
  ExternalLink,
} from "lucide-react";
import * as htmlToImage from "html-to-image";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TemplateId =
  | "ayuno"
  | "revival"
  | "transporte"
  | "culto_especial"
  | "elegante"
  | "moderno"
  | "espiritual"
  | "festivo"
  | "minimalista"
  | "nocturno"
  | "pascua"
  | "alabanza";

type EventCategory =
  | "ayuno_oracion"
  | "culto"
  | "transporte"
  | "retiro"
  | "evento_especial"
  | "estudio_biblico"
  | "alabanza"
  | "evangelismo"
  | "general";

interface FlyerData {
  titulo: string;
  subtitulo: string;
  fechaHora: string;
  lugar: string;
  descripcion: string;
  template: TemplateId;
  bgColor: string;
  categoria: EventCategory;
  contacto: string;
  backgroundImage: string | null;
  overlayOpacity: number;
  incluirLogo: boolean;
  tamano: "cuadrado" | "historia" | "panoramico";
}

// ---------------------------------------------------------------------------
// Event Categories
// ---------------------------------------------------------------------------

interface CategoryConfig {
  id: EventCategory;
  label: string;
  icon: React.ReactNode;
  suggestedTemplates: TemplateId[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "ayuno_oracion",
    label: "Ayuno y Oración",
    icon: <Flame className="h-4 w-4" />,
    suggestedTemplates: ["ayuno", "espiritual", "nocturno"],
  },
  {
    id: "culto",
    label: "Culto / Servicio",
    icon: <Church className="h-4 w-4" />,
    suggestedTemplates: ["culto_especial", "elegante", "moderno"],
  },
  {
    id: "transporte",
    label: "Transporte",
    icon: <Bus className="h-4 w-4" />,
    suggestedTemplates: ["transporte", "moderno", "festivo"],
  },
  {
    id: "retiro",
    label: "Retiro",
    icon: <Star className="h-4 w-4" />,
    suggestedTemplates: ["espiritual", "elegante", "nocturno"],
  },
  {
    id: "evento_especial",
    label: "Evento Especial",
    icon: <Sparkles className="h-4 w-4" />,
    suggestedTemplates: ["pascua", "festivo", "moderno"],
  },
  {
    id: "estudio_biblico",
    label: "Estudio Bíblico",
    icon: <Cross className="h-4 w-4" />,
    suggestedTemplates: ["espiritual", "minimalista", "elegante"],
  },
  {
    id: "alabanza",
    label: "Alabanza / Worship",
    icon: <Music className="h-4 w-4" />,
    suggestedTemplates: ["alabanza", "moderno", "festivo"],
  },
  {
    id: "evangelismo",
    label: "Evangelismo",
    icon: <Heart className="h-4 w-4" />,
    suggestedTemplates: ["moderno", "festivo", "elegante"],
  },
  {
    id: "general",
    label: "General",
    icon: <Calendar className="h-4 w-4" />,
    suggestedTemplates: ["moderno", "elegante", "minimalista"],
  },
];

// ---------------------------------------------------------------------------
// Template definitions
// ---------------------------------------------------------------------------

interface TemplateConfig {
  id: TemplateId;
  label: string;
  description: string;
  containerStyle: React.CSSProperties;
  titleStyle: React.CSSProperties;
  subtitleStyle: React.CSSProperties;
  metaStyle: React.CSSProperties;
  descStyle: React.CSSProperties;
  footerStyle: React.CSSProperties;
  dividerStyle: React.CSSProperties;
  logoStyle: React.CSSProperties;
  accentColor: string;
  supportsBgColor: boolean;
  decorationType?: string;
}

const TEMPLATES: TemplateConfig[] = [
  // --- NEW: Ayuno y Oración (green theme like the screenshot) ---
  {
    id: "ayuno",
    label: "Ayuno y Oración",
    description: "Verde profundo, llamas espirituales, ideal para ayunos",
    accentColor: "#86efac",
    supportsBgColor: false,
    decorationType: "flames",
    containerStyle: {
      background: "linear-gradient(170deg, #052e16 0%, #14532d 30%, #064e3b 60%, #022c22 100%)",
      color: "#dcfce7",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    },
    titleStyle: {
      fontSize: "clamp(2rem, 5.5vw, 3.2rem)",
      fontWeight: "800",
      color: "#f0fdf4",
      textShadow: "0 0 30px rgba(34,197,94,0.5), 0 2px 10px rgba(0,0,0,0.5)",
      lineHeight: "1.1",
      textTransform: "uppercase" as const,
    },
    subtitleStyle: {
      fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
      color: "#86efac",
      fontWeight: "300",
      letterSpacing: "0.15em",
      textTransform: "uppercase" as const,
    },
    metaStyle: {
      fontSize: "clamp(0.95rem, 2.2vw, 1.15rem)",
      color: "#bbf7d0",
      fontWeight: "700",
    },
    descStyle: {
      fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)",
      color: "#a7f3d0",
      lineHeight: "1.6",
    },
    footerStyle: {
      color: "#86efac",
      borderTop: "1px solid rgba(134,239,172,0.3)",
    },
    dividerStyle: {
      background: "linear-gradient(90deg, transparent, #86efac, transparent)",
      height: "2px",
      width: "60%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "2px solid #86efac",
      borderRadius: "50%",
    },
  },
  // --- NEW: Revival / Saturday Revival (bold red/orange like YouTube event) ---
  {
    id: "revival",
    label: "Revival / Avivamiento",
    description: "Rojo intenso, fuego, ideal para eventos de avivamiento",
    accentColor: "#fbbf24",
    supportsBgColor: false,
    decorationType: "fire",
    containerStyle: {
      background: "linear-gradient(160deg, #1a0000 0%, #7f1d1d 25%, #991b1b 50%, #450a0a 100%)",
      color: "#fef2f2",
      fontFamily: "'Arial Black', 'Arial', sans-serif",
    },
    titleStyle: {
      fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
      fontWeight: "900",
      color: "#ffffff",
      textShadow: "0 0 40px rgba(239,68,68,0.7), 0 4px 15px rgba(0,0,0,0.6)",
      lineHeight: "1.05",
      textTransform: "uppercase" as const,
      letterSpacing: "0.03em",
    },
    subtitleStyle: {
      fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
      color: "#fbbf24",
      fontWeight: "700",
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
    },
    metaStyle: {
      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
      color: "#fecaca",
      fontWeight: "600",
    },
    descStyle: {
      fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
      color: "#fca5a5",
      lineHeight: "1.6",
    },
    footerStyle: {
      color: "#fbbf24",
      borderTop: "1px solid rgba(251,191,36,0.4)",
    },
    dividerStyle: {
      background: "linear-gradient(90deg, transparent, #ef4444, #fbbf24, #ef4444, transparent)",
      height: "3px",
      width: "70%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "2px solid #fbbf24",
      borderRadius: "50%",
    },
  },
  // --- NEW: Transporte (blue/teal, bus icon, practical info) ---
  {
    id: "transporte",
    label: "Transporte / Logística",
    description: "Azul dinámico, info de salida y destino, ¡GRATIS!",
    accentColor: "#38bdf8",
    supportsBgColor: false,
    decorationType: "transport",
    containerStyle: {
      background: "linear-gradient(145deg, #0c4a6e 0%, #075985 30%, #0369a1 60%, #0c4a6e 100%)",
      color: "#e0f2fe",
      fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    },
    titleStyle: {
      fontSize: "clamp(2rem, 5.5vw, 3.2rem)",
      fontWeight: "900",
      color: "#ffffff",
      textShadow: "0 3px 12px rgba(0,0,0,0.4)",
      lineHeight: "1.1",
      textTransform: "uppercase" as const,
    },
    subtitleStyle: {
      fontSize: "clamp(1.1rem, 2.8vw, 1.5rem)",
      color: "#fbbf24",
      fontWeight: "800",
      letterSpacing: "0.05em",
      textTransform: "uppercase" as const,
    },
    metaStyle: {
      fontSize: "clamp(0.95rem, 2.2vw, 1.15rem)",
      color: "#bae6fd",
      fontWeight: "700",
    },
    descStyle: {
      fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)",
      color: "#7dd3fc",
      lineHeight: "1.6",
    },
    footerStyle: {
      color: "#38bdf8",
      borderTop: "2px solid rgba(56,189,248,0.4)",
    },
    dividerStyle: {
      background: "linear-gradient(90deg, transparent, #fbbf24, transparent)",
      height: "3px",
      width: "50%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "2px solid #38bdf8",
      borderRadius: "50%",
    },
  },
  // --- NEW: Culto Especial (purple/gold like resurrection service) ---
  {
    id: "culto_especial",
    label: "Culto Especial",
    description: "Púrpura real, detalles dorados, para servicios especiales",
    accentColor: "#e9d5ff",
    supportsBgColor: false,
    decorationType: "rays",
    containerStyle: {
      background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #1e1b4b 100%)",
      color: "#ede9fe",
      fontFamily: "'Georgia', 'Palatino', serif",
    },
    titleStyle: {
      fontSize: "clamp(2rem, 5.5vw, 3.2rem)",
      fontWeight: "800",
      color: "#ffffff",
      textShadow: "0 0 40px rgba(167,139,250,0.5), 0 3px 12px rgba(0,0,0,0.5)",
      lineHeight: "1.1",
    },
    subtitleStyle: {
      fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
      color: "#fbbf24",
      fontWeight: "400",
      fontStyle: "italic",
      letterSpacing: "0.08em",
    },
    metaStyle: {
      fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)",
      color: "#c4b5fd",
      fontWeight: "600",
    },
    descStyle: {
      fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
      color: "#ddd6fe",
      lineHeight: "1.7",
    },
    footerStyle: {
      color: "#e9d5ff",
      borderTop: "1px solid rgba(233,213,255,0.3)",
    },
    dividerStyle: {
      background: "linear-gradient(90deg, transparent, #fbbf24, transparent)",
      height: "2px",
      width: "50%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "2px solid #e9d5ff",
      borderRadius: "50%",
    },
  },
  // --- NEW: Pascua / Resurrección ---
  {
    id: "pascua",
    label: "Pascua / Resurrección",
    description: "Dorado brillante, rayos de luz, ¡Él Vive!",
    accentColor: "#fbbf24",
    supportsBgColor: false,
    decorationType: "sunrise",
    containerStyle: {
      background: "linear-gradient(180deg, #1c1917 0%, #44403c 20%, #78716c 40%, #d6d3d1 60%, #fbbf24 85%, #f59e0b 100%)",
      color: "#fef3c7",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    },
    titleStyle: {
      fontSize: "clamp(2.5rem, 6vw, 3.8rem)",
      fontWeight: "900",
      color: "#ffffff",
      textShadow: "0 0 50px rgba(251,191,36,0.8), 0 0 100px rgba(251,191,36,0.3), 0 4px 15px rgba(0,0,0,0.5)",
      lineHeight: "1.05",
      letterSpacing: "0.05em",
    },
    subtitleStyle: {
      fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
      color: "#fde68a",
      fontWeight: "300",
      fontStyle: "italic",
      letterSpacing: "0.08em",
    },
    metaStyle: {
      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
      color: "#fef3c7",
      fontWeight: "600",
    },
    descStyle: {
      fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
      color: "#fde68a",
      lineHeight: "1.6",
    },
    footerStyle: {
      color: "#78350f",
      borderTop: "1px solid rgba(120,53,15,0.3)",
    },
    dividerStyle: {
      background: "linear-gradient(90deg, transparent, #fbbf24, transparent)",
      height: "2px",
      width: "60%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "2px solid #fbbf24",
      borderRadius: "50%",
    },
  },
  // --- NEW: Alabanza / Worship ---
  {
    id: "alabanza",
    label: "Alabanza / Worship",
    description: "Violeta profundo, notas musicales, energía de adoración",
    accentColor: "#c084fc",
    supportsBgColor: false,
    decorationType: "music",
    containerStyle: {
      background: "linear-gradient(135deg, #2e1065 0%, #581c87 30%, #7e22ce 60%, #4c1d95 100%)",
      color: "#f3e8ff",
      fontFamily: "'Arial', 'Helvetica', sans-serif",
    },
    titleStyle: {
      fontSize: "clamp(2rem, 5.5vw, 3.2rem)",
      fontWeight: "900",
      color: "#ffffff",
      textShadow: "0 0 30px rgba(192,132,252,0.6), 0 3px 12px rgba(0,0,0,0.5)",
      lineHeight: "1.1",
      textTransform: "uppercase" as const,
    },
    subtitleStyle: {
      fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
      color: "#c084fc",
      fontWeight: "300",
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
    },
    metaStyle: {
      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
      color: "#e9d5ff",
      fontWeight: "600",
    },
    descStyle: {
      fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
      color: "#ddd6fe",
      lineHeight: "1.6",
    },
    footerStyle: {
      color: "#c084fc",
      borderTop: "1px solid rgba(192,132,252,0.3)",
    },
    dividerStyle: {
      background: "linear-gradient(90deg, transparent, #c084fc, transparent)",
      height: "2px",
      width: "50%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "2px solid #c084fc",
      borderRadius: "50%",
    },
  },
  // --- EXISTING TEMPLATES (improved) ---
  {
    id: "elegante",
    label: "Elegante",
    description: "Fondo oscuro, detalles dorados, tipografía serif",
    accentColor: "#c9a84c",
    supportsBgColor: false,
    containerStyle: {
      background: "linear-gradient(160deg, #1a1208 0%, #2c1f0a 50%, #1a1208 100%)",
      color: "#f5e6c8",
      fontFamily: "Georgia, 'Times New Roman', serif",
      border: "2px solid #c9a84c",
    },
    titleStyle: {
      fontSize: "clamp(1.8rem, 5vw, 3rem)",
      fontWeight: "700",
      color: "#f5e6c8",
      textShadow: "0 2px 8px rgba(201,168,76,0.4)",
      letterSpacing: "0.02em",
      lineHeight: "1.2",
    },
    subtitleStyle: {
      fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
      color: "#c9a84c",
      fontWeight: "400",
      fontStyle: "italic",
    },
    metaStyle: {
      fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
      color: "#d4b97a",
    },
    descStyle: {
      fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
      color: "#c8b89a",
      lineHeight: "1.7",
    },
    footerStyle: {
      color: "#c9a84c",
      borderTop: "1px solid #c9a84c",
    },
    dividerStyle: {
      background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
      height: "1px",
      width: "60%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "2px solid #c9a84c",
      borderRadius: "50%",
    },
  },
  {
    id: "moderno",
    label: "Moderno",
    description: "Gradiente vibrante, sans-serif en negrita",
    accentColor: "#ffffff",
    supportsBgColor: false,
    containerStyle: {
      background: "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #be185d 100%)",
      color: "#ffffff",
      fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    },
    titleStyle: {
      fontSize: "clamp(2rem, 5.5vw, 3.2rem)",
      fontWeight: "900",
      color: "#ffffff",
      textTransform: "uppercase" as const,
      letterSpacing: "0.04em",
      lineHeight: "1.1",
      textShadow: "0 4px 16px rgba(0,0,0,0.3)",
    },
    subtitleStyle: {
      fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
      color: "rgba(255,255,255,0.9)",
      fontWeight: "300",
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
    },
    metaStyle: {
      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
      color: "rgba(255,255,255,0.95)",
      fontWeight: "600",
    },
    descStyle: {
      fontSize: "clamp(0.82rem, 1.8vw, 1rem)",
      color: "rgba(255,255,255,0.85)",
      lineHeight: "1.6",
    },
    footerStyle: {
      color: "rgba(255,255,255,0.9)",
      borderTop: "1px solid rgba(255,255,255,0.3)",
    },
    dividerStyle: {
      background: "rgba(255,255,255,0.5)",
      height: "2px",
      width: "40%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "2px solid rgba(255,255,255,0.6)",
      borderRadius: "50%",
    },
  },
  {
    id: "espiritual",
    label: "Espiritual",
    description: "Azul profundo, texto claro, motivo de cruz",
    accentColor: "#93c5fd",
    supportsBgColor: false,
    decorationType: "cross",
    containerStyle: {
      background: "linear-gradient(170deg, #0a0f2e 0%, #0f1f5c 40%, #1a1060 100%)",
      color: "#e0e8ff",
      fontFamily: "'Georgia', 'Palatino', serif",
    },
    titleStyle: {
      fontSize: "clamp(1.8rem, 5vw, 2.9rem)",
      fontWeight: "700",
      color: "#e0e8ff",
      textShadow: "0 0 20px rgba(147,197,253,0.5)",
      lineHeight: "1.2",
    },
    subtitleStyle: {
      fontSize: "clamp(0.95rem, 2.3vw, 1.3rem)",
      color: "#93c5fd",
      fontStyle: "italic",
    },
    metaStyle: {
      fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
      color: "#bfdbfe",
    },
    descStyle: {
      fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
      color: "#c7d7ff",
      lineHeight: "1.7",
    },
    footerStyle: {
      color: "#93c5fd",
      borderTop: "1px solid rgba(147,197,253,0.4)",
    },
    dividerStyle: {
      background: "rgba(147,197,253,0.4)",
      height: "1px",
      width: "50%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "2px solid rgba(147,197,253,0.5)",
      borderRadius: "50%",
    },
  },
  {
    id: "festivo",
    label: "Festivo",
    description: "Colores cálidos, ambiente de celebración",
    accentColor: "#fbbf24",
    supportsBgColor: false,
    containerStyle: {
      background: "linear-gradient(145deg, #7c2d12 0%, #c2410c 30%, #ea580c 65%, #b45309 100%)",
      color: "#fff7ed",
      fontFamily: "'Arial', 'Helvetica', sans-serif",
    },
    titleStyle: {
      fontSize: "clamp(1.9rem, 5vw, 3rem)",
      fontWeight: "800",
      color: "#fff7ed",
      textShadow: "0 3px 10px rgba(0,0,0,0.4)",
      lineHeight: "1.2",
    },
    subtitleStyle: {
      fontSize: "clamp(1rem, 2.4vw, 1.35rem)",
      color: "#fde68a",
      fontWeight: "600",
    },
    metaStyle: {
      fontSize: "clamp(0.88rem, 2vw, 1.08rem)",
      color: "#fed7aa",
      fontWeight: "700",
    },
    descStyle: {
      fontSize: "clamp(0.82rem, 1.8vw, 1rem)",
      color: "#ffedd5",
      lineHeight: "1.65",
    },
    footerStyle: {
      color: "#fde68a",
      borderTop: "1px solid rgba(253,230,138,0.5)",
    },
    dividerStyle: {
      background: "linear-gradient(90deg, transparent, #fde68a, transparent)",
      height: "2px",
      width: "50%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "2px solid #fde68a",
      borderRadius: "50%",
    },
  },
  {
    id: "minimalista",
    label: "Minimalista",
    description: "Fondo blanco, tipografía limpia y elegante",
    accentColor: "#1e293b",
    supportsBgColor: true,
    containerStyle: {
      background: "#ffffff",
      color: "#1e293b",
      fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
      border: "1px solid #e2e8f0",
    },
    titleStyle: {
      fontSize: "clamp(1.8rem, 5vw, 2.9rem)",
      fontWeight: "700",
      color: "#0f172a",
      lineHeight: "1.2",
      letterSpacing: "-0.01em",
    },
    subtitleStyle: {
      fontSize: "clamp(0.95rem, 2.3vw, 1.3rem)",
      color: "#64748b",
      fontWeight: "300",
      letterSpacing: "0.06em",
      textTransform: "uppercase" as const,
    },
    metaStyle: {
      fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
      color: "#334155",
      fontWeight: "600",
    },
    descStyle: {
      fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
      color: "#475569",
      lineHeight: "1.7",
    },
    footerStyle: {
      color: "#64748b",
      borderTop: "1px solid #e2e8f0",
    },
    dividerStyle: {
      background: "#cbd5e1",
      height: "1px",
      width: "30%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "1px solid #e2e8f0",
      borderRadius: "50%",
    },
  },
  {
    id: "nocturno",
    label: "Nocturno",
    description: "Azul marino oscuro, estrellas, atmósfera nocturna",
    accentColor: "#a5f3fc",
    supportsBgColor: false,
    decorationType: "stars",
    containerStyle: {
      background: "linear-gradient(180deg, #020617 0%, #0c1445 30%, #061030 70%, #020617 100%)",
      color: "#e0f2fe",
      fontFamily: "'Georgia', serif",
    },
    titleStyle: {
      fontSize: "clamp(1.8rem, 5vw, 2.9rem)",
      fontWeight: "700",
      color: "#e0f2fe",
      textShadow: "0 0 30px rgba(165,243,252,0.4), 0 0 60px rgba(165,243,252,0.1)",
      lineHeight: "1.2",
    },
    subtitleStyle: {
      fontSize: "clamp(0.95rem, 2.3vw, 1.3rem)",
      color: "#a5f3fc",
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
    },
    metaStyle: {
      fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
      color: "#bae6fd",
    },
    descStyle: {
      fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
      color: "#cce8f4",
      lineHeight: "1.7",
    },
    footerStyle: {
      color: "#a5f3fc",
      borderTop: "1px solid rgba(165,243,252,0.25)",
    },
    dividerStyle: {
      background: "rgba(165,243,252,0.3)",
      height: "1px",
      width: "50%",
      margin: "0 auto",
    },
    logoStyle: {
      border: "1px solid rgba(165,243,252,0.4)",
      borderRadius: "50%",
    },
  },
];

// ---------------------------------------------------------------------------
// Decorations
// ---------------------------------------------------------------------------

function NocturnoStars() {
  const stars = [
    { top: "8%", left: "12%", size: 2 },
    { top: "15%", left: "75%", size: 1.5 },
    { top: "6%", left: "55%", size: 1 },
    { top: "22%", left: "88%", size: 2 },
    { top: "35%", left: "5%", size: 1 },
    { top: "45%", left: "92%", size: 1.5 },
    { top: "62%", left: "8%", size: 1 },
    { top: "70%", left: "85%", size: 2 },
    { top: "80%", left: "15%", size: 1.5 },
    { top: "90%", left: "70%", size: 1 },
    { top: "12%", left: "35%", size: 1 },
    { top: "55%", left: "78%", size: 1.5 },
    { top: "28%", left: "42%", size: 0.8 },
    { top: "75%", left: "55%", size: 1.2 },
    { top: "50%", left: "20%", size: 0.7 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "white",
            boxShadow: `0 0 ${s.size * 3}px rgba(255,255,255,0.9)`,
          }}
        />
      ))}
    </div>
  );
}

function CrossDecoration({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", bottom: "8%", right: "5%", opacity: 0.08, pointerEvents: "none" }}>
      <svg width="90" height="120" viewBox="0 0 90 120" fill={color}>
        <rect x="38" y="0" width="14" height="120" rx="3" />
        <rect x="8" y="30" width="74" height="14" rx="3" />
      </svg>
    </div>
  );
}

function FlameDecoration() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Top glow */}
      <div style={{
        position: "absolute",
        top: "-10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        height: "40%",
        background: "radial-gradient(ellipse, rgba(34,197,94,0.15) 0%, transparent 70%)",
      }} />
      {/* Bottom accent */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        height: "30%",
        background: "linear-gradient(to top, rgba(22,163,74,0.1) 0%, transparent 100%)",
      }} />
      {/* Side accents */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "-5%",
        width: "30%",
        height: "60%",
        background: "radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute",
        top: "20%",
        right: "-5%",
        width: "30%",
        height: "60%",
        background: "radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)",
      }} />
    </div>
  );
}

function FireDecoration() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        height: "40%",
        background: "linear-gradient(to top, rgba(239,68,68,0.2) 0%, rgba(251,191,36,0.08) 50%, transparent 100%)",
      }} />
      <div style={{
        position: "absolute",
        top: "0",
        left: "50%",
        transform: "translateX(-50%)",
        width: "60%",
        height: "30%",
        background: "radial-gradient(ellipse, rgba(239,68,68,0.15) 0%, transparent 70%)",
      }} />
    </div>
  );
}

function SunriseDecoration() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        bottom: "15%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "120%",
        height: "60%",
        background: "radial-gradient(ellipse at bottom, rgba(251,191,36,0.3) 0%, rgba(251,191,36,0.1) 30%, transparent 60%)",
      }} />
      {/* Rays */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          bottom: "40%",
          left: "50%",
          width: "2px",
          height: "35%",
          background: "linear-gradient(to top, rgba(251,191,36,0.3), transparent)",
          transformOrigin: "bottom center",
          transform: `translateX(-50%) rotate(${(i - 3.5) * 12}deg)`,
        }} />
      ))}
    </div>
  );
}

function RaysDecoration() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "150%",
        height: "150%",
        background: "radial-gradient(ellipse, rgba(167,139,250,0.1) 0%, transparent 60%)",
      }} />
    </div>
  );
}

function MusicDecoration() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        top: "10%",
        right: "8%",
        fontSize: "4rem",
        opacity: 0.06,
        color: "#c084fc",
      }}>
        ♪
      </div>
      <div style={{
        position: "absolute",
        bottom: "15%",
        left: "6%",
        fontSize: "3rem",
        opacity: 0.06,
        color: "#c084fc",
      }}>
        ♫
      </div>
      <div style={{
        position: "absolute",
        top: "40%",
        right: "4%",
        fontSize: "2.5rem",
        opacity: 0.05,
        color: "#c084fc",
      }}>
        ♬
      </div>
    </div>
  );
}

function TransportDecoration() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        height: "8%",
        background: "linear-gradient(to top, rgba(56,189,248,0.15), transparent)",
      }} />
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 60%)",
      }} />
    </div>
  );
}

function getDecoration(type?: string) {
  switch (type) {
    case "stars": return <NocturnoStars />;
    case "cross": return <CrossDecoration color="#93c5fd" />;
    case "flames": return <FlameDecoration />;
    case "fire": return <FireDecoration />;
    case "sunrise": return <SunriseDecoration />;
    case "rays": return <RaysDecoration />;
    case "music": return <MusicDecoration />;
    case "transport": return <TransportDecoration />;
    default: return null;
  }
}

// ---------------------------------------------------------------------------
// Size configs
// ---------------------------------------------------------------------------

const SIZE_CONFIGS = {
  cuadrado: { aspect: "1 / 1", width: 1080, height: 1080, label: "1080 × 1080" },
  historia: { aspect: "9 / 16", width: 1080, height: 1920, label: "1080 × 1920" },
  panoramico: { aspect: "16 / 9", width: 1920, height: 1080, label: "1920 × 1080" },
};

// ---------------------------------------------------------------------------
// Flyer Preview component
// ---------------------------------------------------------------------------

interface FlyerPreviewProps {
  data: FlyerData;
  flyerRef: React.RefObject<HTMLDivElement | null>;
}

function FlyerPreview({ data, flyerRef }: FlyerPreviewProps) {
  const tpl = TEMPLATES.find((t) => t.id === data.template) ?? TEMPLATES[0];
  const sizeConfig = SIZE_CONFIGS[data.tamano];

  const containerStyle: React.CSSProperties = {
    ...tpl.containerStyle,
    position: "relative",
    width: "100%",
    aspectRatio: sizeConfig.aspect,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "clamp(24px, 5%, 48px)",
    boxSizing: "border-box",
    overflow: "hidden",
  };

  // Background image support
  if (data.backgroundImage) {
    containerStyle.backgroundImage = `url(${data.backgroundImage})`;
    containerStyle.backgroundSize = "cover";
    containerStyle.backgroundPosition = "center";
  }

  // Override bg for minimalista + color picker
  if (tpl.supportsBgColor && data.bgColor && !data.backgroundImage) {
    containerStyle.background = data.bgColor;
  }

  const titleText = data.titulo || "Título del Evento";
  const subtitleText = data.subtitulo || "";

  return (
    <div ref={flyerRef} style={containerStyle}>
      {/* Dark overlay for background images */}
      {data.backgroundImage && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: `rgba(0,0,0,${data.overlayOpacity / 100})`,
          zIndex: 0,
        }} />
      )}

      {/* Decorations */}
      {getDecoration(tpl.decorationType)}

      {/* Top: logo + ministry tag */}
      {data.incluirLogo && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          zIndex: 1,
          width: "100%",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-gedeones.jpg"
            alt="Gedeones GP"
            width={64}
            height={64}
            style={{
              ...tpl.logoStyle,
              width: "clamp(48px, 10%, 72px)",
              height: "clamp(48px, 10%, 72px)",
              objectFit: "cover",
              flexShrink: 0,
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div style={{ ...tpl.subtitleStyle, fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)", letterSpacing: "0.12em" }}>
            GEDEONES GP · MINISTERIO DE CABALLEROS
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ ...tpl.dividerStyle, zIndex: 1 }} />

      {/* Main content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(8px, 2%, 16px)",
        width: "100%",
        textAlign: "center",
        zIndex: 1,
        padding: "8px 0",
      }}>
        {subtitleText && (
          <p style={{ ...tpl.subtitleStyle, margin: 0 }}>{subtitleText}</p>
        )}

        <h1 style={{ ...tpl.titleStyle, margin: 0 }}>{titleText}</h1>

        {(data.fechaHora || data.lugar) && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            marginTop: "8px",
          }}>
            {data.fechaHora && (
              <p style={{ ...tpl.metaStyle, margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📅</span> {data.fechaHora}
              </p>
            )}
            {data.lugar && (
              <p style={{ ...tpl.metaStyle, margin: 0, opacity: 0.85, display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📍</span> {data.lugar}
              </p>
            )}
          </div>
        )}

        {data.descripcion && (
          <p style={{
            ...tpl.descStyle,
            margin: 0,
            maxWidth: "80%",
            textAlign: "center",
            marginTop: "4px",
          }}>
            {data.descripcion}
          </p>
        )}

        {data.contacto && (
          <p style={{
            ...tpl.metaStyle,
            margin: 0,
            fontSize: "clamp(0.75rem, 1.6vw, 0.9rem)",
            opacity: 0.8,
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <span>📞</span> {data.contacto}
          </p>
        )}
      </div>

      {/* Divider */}
      <div style={{ ...tpl.dividerStyle, zIndex: 1 }} />

      {/* Footer */}
      <div style={{
        ...tpl.footerStyle,
        paddingTop: "clamp(8px, 2%, 14px)",
        width: "100%",
        textAlign: "center",
        zIndex: 1,
      }}>
        <p style={{
          margin: 0,
          fontSize: "clamp(0.65rem, 1.4vw, 0.8rem)",
          fontWeight: "600",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          Gedeones GP
        </p>
        <p style={{
          margin: 0,
          fontSize: "clamp(0.6rem, 1.2vw, 0.72rem)",
          opacity: 0.75,
          letterSpacing: "0.05em",
        }}>
          Ministerio de Caballeros · Colón, Panamá
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template Selector Card
// ---------------------------------------------------------------------------

function TemplateCard({
  tpl,
  selected,
  onSelect,
  recommended,
}: {
  tpl: TemplateConfig;
  selected: boolean;
  onSelect: () => void;
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg p-2.5 text-left transition-all border-2 relative ${
        selected
          ? "border-blue-500 ring-2 ring-blue-500/30"
          : "border-slate-700 hover:border-slate-500"
      }`}
      style={{
        background: selected ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)",
      }}
    >
      {recommended && (
        <div
          className="absolute -top-1.5 -right-1.5 rounded-full px-1.5 py-0.5 text-white"
          style={{ background: "#2563eb", fontSize: "0.55rem", fontWeight: "700" }}
        >
          <Zap className="h-2.5 w-2.5 inline" />
        </div>
      )}
      <div
        className="rounded w-full mb-1.5"
        style={{
          height: "40px",
          ...(tpl.containerStyle as React.CSSProperties),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
        }}
      >
        <span style={{
          ...tpl.titleStyle,
          fontSize: "0.5rem",
          lineHeight: "1.2",
          textAlign: "center",
          overflow: "hidden",
        }}>
          {tpl.label}
        </span>
      </div>
      <p className="text-xs font-semibold text-white leading-tight">{tpl.label}</p>
      <p className="text-xs text-slate-400 leading-tight mt-0.5" style={{ fontSize: "0.65rem" }}>{tpl.description}</p>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Category Selector
// ---------------------------------------------------------------------------

function CategorySelector({
  selected,
  onSelect,
}: {
  selected: EventCategory;
  onSelect: (cat: EventCategory) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            selected === cat.id
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-700"
          }`}
          style={{
            background: selected === cat.id ? undefined : "rgba(255,255,255,0.05)",
            border: `1px solid ${selected === cat.id ? "#2563eb" : "#334155"}`,
          }}
        >
          {cat.icon}
          {cat.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const DEFAULT_BG_COLORS: Partial<Record<TemplateId, string>> = {
  minimalista: "#ffffff",
};

export default function FlyersPage() {
  const [flyerData, setFlyerData] = useState<FlyerData>({
    titulo: "",
    subtitulo: "",
    fechaHora: "",
    lugar: "",
    descripcion: "",
    template: "ayuno",
    bgColor: "#ffffff",
    categoria: "general",
    contacto: "",
    backgroundImage: null,
    overlayOpacity: 50,
    incluirLogo: true,
    tamano: "cuadrado",
  });
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"contenido" | "diseno" | "canva">("contenido");
  const flyerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = useCallback(
    <K extends keyof FlyerData>(key: K, value: FlyerData[K]) => {
      setFlyerData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const selectedCategory = CATEGORIES.find((c) => c.id === flyerData.categoria);
  const selectedTemplate = TEMPLATES.find((t) => t.id === flyerData.template) ?? TEMPLATES[0];

  function handleCategoryChange(cat: EventCategory) {
    updateField("categoria", cat);
    const category = CATEGORIES.find((c) => c.id === cat);
    if (category && category.suggestedTemplates.length > 0) {
      updateField("template", category.suggestedTemplates[0]);
    }
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateField("backgroundImage", ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeBackgroundImage() {
    updateField("backgroundImage", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDownload() {
    if (!flyerRef.current) return;
    setDownloading(true);
    const sizeConfig = SIZE_CONFIGS[flyerData.tamano];
    try {
      const dataUrl = await htmlToImage.toPng(flyerRef.current, {
        width: sizeConfig.width,
        height: sizeConfig.height,
        pixelRatio: 1,
        style: {
          width: `${sizeConfig.width}px`,
          height: `${sizeConfig.height}px`,
        },
      });
      const link = document.createElement("a");
      link.download = `flyer-${flyerData.titulo.replace(/\s+/g, "-").toLowerCase() || "gedeones"}-${flyerData.tamano}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("No se pudo exportar el flyer. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  function handleShareWhatsApp() {
    const lines: string[] = [];
    if (flyerData.subtitulo) lines.push(`_${flyerData.subtitulo}_`);
    lines.push(`*${flyerData.titulo || "Evento del Ministerio"}*`);
    if (flyerData.fechaHora) lines.push(`📅 ${flyerData.fechaHora}`);
    if (flyerData.lugar) lines.push(`📍 ${flyerData.lugar}`);
    if (flyerData.descripcion) lines.push(`\n${flyerData.descripcion}`);
    if (flyerData.contacto) lines.push(`\n📞 ${flyerData.contacto}`);
    lines.push("\n_Gedeones GP · Ministerio de Caballeros_");

    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="min-h-screen" style={{ background: "#0f172a", color: "#e2e8f0" }}>
      {/* Page header */}
      <div className="border-b border-slate-700/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2" style={{ background: "rgba(59,130,246,0.15)" }}>
              <ImageIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Generador de Flyers</h1>
              <p className="text-sm text-slate-400">
                Diseña flyers profesionales para el ministerio — estilo como los del grupo
              </p>
            </div>
          </div>
          <a
            href="https://www.canva.com/design"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "white" }}
          >
            <Sparkles className="h-4 w-4" />
            Abrir Canva
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Main content: two-column layout */}
      <div className="flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-80px)]">
        {/* Left panel: form */}
        <div
          className="lg:w-[440px] flex-shrink-0 border-r border-slate-700/60 overflow-y-auto"
          style={{ background: "#0f172a" }}
        >
          {/* Tab switcher */}
          <div className="flex border-b border-slate-700/60">
            {[
              { id: "contenido" as const, label: "Contenido" },
              { id: "diseno" as const, label: "Diseño" },
              { id: "canva" as const, label: "Canva Pro" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-xs font-semibold tracking-wider transition-all ${
                  activeTab === tab.id
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {/* ============ CONTENIDO TAB ============ */}
            {activeTab === "contenido" && (
              <>
                {/* Category selector */}
                <section>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Tipo de Evento
                  </h2>
                  <CategorySelector
                    selected={flyerData.categoria}
                    onSelect={handleCategoryChange}
                  />
                </section>

                {/* Event info fields */}
                <section>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Información del Evento
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Subtítulo <span className="text-slate-500">(arriba del título)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 7mo Día · Ministerio de Caballeros"
                        value={flyerData.subtitulo}
                        onChange={(e) => updateField("subtitulo", e.target.value)}
                        className="w-full rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ background: "#1e293b", border: "1px solid #334155" }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Título del evento <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. AYUNO Y ORACIÓN"
                        value={flyerData.titulo}
                        onChange={(e) => updateField("titulo", e.target.value)}
                        className="w-full rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ background: "#1e293b", border: "1px solid #334155" }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Fecha y hora
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Sábado 8:00 AM"
                          value={flyerData.fechaHora}
                          onChange={(e) => updateField("fechaHora", e.target.value)}
                          className="w-full rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ background: "#1e293b", border: "1px solid #334155" }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Lugar
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. 4 Altos, Colón"
                          value={flyerData.lugar}
                          onChange={(e) => updateField("lugar", e.target.value)}
                          className="w-full rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ background: "#1e293b", border: "1px solid #334155" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Descripción
                      </label>
                      <textarea
                        placeholder="Detalles, oradores, instrucciones..."
                        value={flyerData.descripcion}
                        onChange={(e) => updateField("descripcion", e.target.value)}
                        rows={3}
                        className="w-full rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        style={{ background: "#1e293b", border: "1px solid #334155" }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Contacto / Teléfono
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. +507 6XXX-XXXX"
                        value={flyerData.contacto}
                        onChange={(e) => updateField("contacto", e.target.value)}
                        className="w-full rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ background: "#1e293b", border: "1px solid #334155" }}
                      />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ============ DISEÑO TAB ============ */}
            {activeTab === "diseno" && (
              <>
                {/* Template selector */}
                <section>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Plantilla {selectedCategory && `— Recomendadas para ${selectedCategory.label}`}
                  </h2>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TEMPLATES.map((tpl) => (
                      <TemplateCard
                        key={tpl.id}
                        tpl={tpl}
                        selected={flyerData.template === tpl.id}
                        recommended={selectedCategory?.suggestedTemplates.includes(tpl.id)}
                        onSelect={() => {
                          updateField("template", tpl.id);
                          if (DEFAULT_BG_COLORS[tpl.id]) {
                            updateField("bgColor", DEFAULT_BG_COLORS[tpl.id]!);
                          }
                        }}
                      />
                    ))}
                  </div>
                </section>

                {/* Size selector */}
                <section>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Tamaño
                  </h2>
                  <div className="flex gap-2">
                    {([
                      { id: "cuadrado" as const, label: "Cuadrado", desc: "Instagram/WhatsApp" },
                      { id: "historia" as const, label: "Historia", desc: "Stories/Status" },
                      { id: "panoramico" as const, label: "Panorámico", desc: "YouTube/Banner" },
                    ]).map((size) => (
                      <button
                        key={size.id}
                        onClick={() => updateField("tamano", size.id)}
                        className={`flex-1 rounded-lg p-2.5 text-center transition-all border ${
                          flyerData.tamano === size.id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <p className="text-xs font-semibold text-white">{size.label}</p>
                        <p className="text-xs text-slate-500" style={{ fontSize: "0.6rem" }}>{size.desc}</p>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Background image upload */}
                <section>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Upload className="h-3.5 w-3.5" />
                    Imagen de Fondo
                  </h2>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {flyerData.backgroundImage ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="rounded w-12 h-12"
                          style={{
                            backgroundImage: `url(${flyerData.backgroundImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <button
                          onClick={removeBackgroundImage}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Quitar imagen
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Oscuridad del overlay: {flyerData.overlayOpacity}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={flyerData.overlayOpacity}
                          onChange={(e) => updateField("overlayOpacity", Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-lg border-2 border-dashed border-slate-600 p-4 text-center text-sm text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all"
                    >
                      <Upload className="h-5 w-5 mx-auto mb-1" />
                      Sube una imagen de fondo
                    </button>
                  )}
                </section>

                {/* Background color picker (only for templates that support it) */}
                {selectedTemplate.supportsBgColor && !flyerData.backgroundImage && (
                  <section>
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Palette className="h-3.5 w-3.5" />
                      Color de fondo
                    </h2>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={flyerData.bgColor}
                        onChange={(e) => updateField("bgColor", e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-slate-600"
                        style={{ padding: "2px", background: "transparent" }}
                      />
                      <span className="text-sm text-slate-400">{flyerData.bgColor}</span>
                    </div>
                  </section>
                )}

                {/* Logo toggle */}
                <section>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flyerData.incluirLogo}
                      onChange={(e) => updateField("incluirLogo", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-300">Incluir logo de GEDEONES</span>
                  </label>
                </section>
              </>
            )}

            {/* ============ CANVA TAB ============ */}
            {activeTab === "canva" && (
              <section className="space-y-4">
                <div className="rounded-xl p-4 text-center" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.15))", border: "1px solid rgba(124,58,237,0.3)" }}>
                  <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-400" />
                  <h3 className="text-lg font-bold text-white mb-2">Canva Pro Integration</h3>
                  <p className="text-sm text-slate-300 mb-4">
                    Para flyers con fotos, efectos avanzados y tipografías premium, usa Canva directamente conectado a GEDEONES.
                  </p>
                  <a
                    href="https://www.canva.com/design"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Crear Diseño en Canva
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">Plantillas recomendadas en Canva:</h3>
                  {[
                    { label: "Flyer de Evento de Iglesia", query: "church event flyer" },
                    { label: "Invitación de Culto", query: "church service invitation" },
                    { label: "Anuncio de Retiro Espiritual", query: "spiritual retreat announcement" },
                    { label: "Banner de YouTube Iglesia", query: "church youtube thumbnail" },
                    { label: "Historia de Instagram Iglesia", query: "church instagram story" },
                  ].map((item) => (
                    <a
                      key={item.query}
                      href={`https://www.canva.com/templates/?query=${encodeURIComponent(item.query)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg p-3 text-sm text-slate-300 transition-all hover:text-white"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #334155" }}
                    >
                      <span>{item.label}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                    </a>
                  ))}
                </div>

                <div className="rounded-lg p-3 text-xs text-slate-400" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <p className="font-semibold text-amber-300 mb-1">Tip: Flujo recomendado</p>
                  <p>1. Crea el contenido del flyer aquí en GEDEONES</p>
                  <p>2. Descárgalo como PNG base</p>
                  <p>3. Súbelo a Canva para agregar fotos y efectos premium</p>
                  <p>4. Exporta el resultado final y compártelo por WhatsApp</p>
                </div>
              </section>
            )}

            {/* Action buttons (always visible) */}
            <section className="space-y-2 pb-2 pt-2 border-t border-slate-700/60">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading || !flyerData.titulo.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: downloading
                    ? "#1d4ed8"
                    : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                }}
              >
                <Download className="h-4 w-4" />
                {downloading ? "Exportando..." : `Descargar PNG (${SIZE_CONFIGS[flyerData.tamano].label})`}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                disabled={!flyerData.titulo.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "white",
                }}
              >
                <Share2 className="h-4 w-4" />
                Compartir por WhatsApp
              </button>

              {!flyerData.titulo.trim() && (
                <p className="text-xs text-slate-500 text-center">
                  Escribe el título del evento para habilitar
                </p>
              )}
            </section>
          </div>
        </div>

        {/* Right panel: live preview */}
        <div className="flex-1 flex items-center justify-center p-6" style={{ background: "#080f1e" }}>
          <div className="w-full" style={{ maxWidth: flyerData.tamano === "panoramico" ? "640px" : flyerData.tamano === "historia" ? "320px" : "480px" }}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Vista previa en tiempo real
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ background: "#1e293b", color: "#94a3b8" }}
              >
                {SIZE_CONFIGS[flyerData.tamano].label}
              </span>
            </div>

            <div
              className="rounded-xl overflow-hidden shadow-2xl"
              style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}
            >
              <FlyerPreview data={flyerData} flyerRef={flyerRef} />
            </div>

            <p className="mt-3 text-xs text-slate-600 text-center">
              Exporta en PNG de alta resolución listo para WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
