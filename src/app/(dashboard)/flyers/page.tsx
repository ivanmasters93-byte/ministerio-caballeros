"use client";

import { useState, useRef, useCallback } from "react";
import { Download, Share2, ImageIcon, Palette } from "lucide-react";
import * as htmlToImage from "html-to-image";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TemplateId =
  | "elegante"
  | "moderno"
  | "espiritual"
  | "festivo"
  | "minimalista"
  | "nocturno";

interface FlyerData {
  titulo: string;
  fechaHora: string;
  lugar: string;
  descripcion: string;
  template: TemplateId;
  bgColor: string;
}

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
}

const TEMPLATES: TemplateConfig[] = [
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
      filter: "brightness(0) invert(1) opacity(0.9)",
    },
  },
];

// ---------------------------------------------------------------------------
// Nocturno stars decoration
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
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
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
            boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,0.8)`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Espiritual cross decoration
// ---------------------------------------------------------------------------

function EspiritualCross({ color }: { color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        right: "6%",
        opacity: 0.07,
        pointerEvents: "none",
      }}
    >
      <svg width="80" height="100" viewBox="0 0 80 100" fill={color}>
        <rect x="35" y="0" width="10" height="100" rx="2" />
        <rect x="10" y="28" width="60" height="10" rx="2" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flyer Preview component
// ---------------------------------------------------------------------------

interface FlyerPreviewProps {
  data: FlyerData;
  flyerRef: React.RefObject<HTMLDivElement | null>;
}

function FlyerPreview({ data, flyerRef }: FlyerPreviewProps) {
  const tpl = TEMPLATES.find((t) => t.id === data.template) ?? TEMPLATES[0];

  const containerStyle: React.CSSProperties = {
    ...tpl.containerStyle,
    position: "relative",
    width: "100%",
    aspectRatio: "1 / 1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "clamp(24px, 5%, 48px)",
    boxSizing: "border-box",
    overflow: "hidden",
  };

  // Override bg for minimalista + color picker
  if (tpl.supportsBgColor && data.bgColor) {
    containerStyle.background = data.bgColor;
  }

  const titleText = data.titulo || "Título del Evento";

  return (
    <div
      ref={flyerRef}
      style={containerStyle}
    >
      {/* Decorations */}
      {data.template === "nocturno" && <NocturnoStars />}
      {data.template === "espiritual" && <EspiritualCross color="#93c5fd" />}

      {/* Top: logo + ministry tag */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          zIndex: 1,
          width: "100%",
        }}
      >
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

      {/* Divider */}
      <div style={tpl.dividerStyle} />

      {/* Main content */}
      <div
        style={{
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
        }}
      >
        <h1 style={{ ...tpl.titleStyle, margin: 0 }}>{titleText}</h1>

        {(data.fechaHora || data.lugar) && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {data.fechaHora && (
              <p style={{ ...tpl.metaStyle, margin: 0 }}>
                {data.fechaHora}
              </p>
            )}
            {data.lugar && (
              <p style={{ ...tpl.metaStyle, margin: 0, opacity: 0.85 }}>
                {data.lugar}
              </p>
            )}
          </div>
        )}

        {data.descripcion && (
          <p
            style={{
              ...tpl.descStyle,
              margin: 0,
              maxWidth: "80%",
              textAlign: "center",
            }}
          >
            {data.descripcion}
          </p>
        )}
      </div>

      {/* Divider */}
      <div style={tpl.dividerStyle} />

      {/* Footer */}
      <div
        style={{
          ...tpl.footerStyle,
          paddingTop: "clamp(8px, 2%, 14px)",
          width: "100%",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "clamp(0.65rem, 1.4vw, 0.8rem)",
            fontWeight: "600",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Gedeones GP
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "clamp(0.6rem, 1.2vw, 0.72rem)",
            opacity: 0.75,
            letterSpacing: "0.05em",
          }}
        >
          Ministerio de Caballeros
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
}: {
  tpl: TemplateConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg p-3 text-left transition-all border-2 ${
        selected
          ? "border-blue-500 ring-2 ring-blue-500/30"
          : "border-slate-700 hover:border-slate-500"
      }`}
      style={{
        background: selected ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)",
      }}
    >
      {/* Mini preview swatch */}
      <div
        className="rounded w-full mb-2"
        style={{
          height: "48px",
          ...(tpl.containerStyle as React.CSSProperties),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
        }}
      >
        <span
          style={{
            ...tpl.titleStyle,
            fontSize: "0.55rem",
            lineHeight: "1.2",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          {tpl.label}
        </span>
      </div>
      <p className="text-xs font-semibold text-white">{tpl.label}</p>
      <p className="text-xs text-slate-400 leading-tight mt-0.5">{tpl.description}</p>
    </button>
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
    fechaHora: "",
    lugar: "",
    descripcion: "",
    template: "elegante",
    bgColor: "#ffffff",
  });
  const [downloading, setDownloading] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  const updateField = useCallback(
    <K extends keyof FlyerData>(key: K, value: FlyerData[K]) => {
      setFlyerData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const selectedTemplate = TEMPLATES.find((t) => t.id === flyerData.template) ?? TEMPLATES[0];

  async function handleDownload() {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(flyerRef.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
        style: {
          width: "1080px",
          height: "1080px",
        },
      });
      const link = document.createElement("a");
      link.download = `flyer-${flyerData.titulo.replace(/\s+/g, "-").toLowerCase() || "gedeones"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al exportar flyer:", err);
      alert("No se pudo exportar el flyer. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  function handleShareWhatsApp() {
    const lines: string[] = [];
    lines.push(`*${flyerData.titulo || "Evento del Ministerio"}*`);
    if (flyerData.fechaHora) lines.push(`📅 ${flyerData.fechaHora}`);
    if (flyerData.lugar) lines.push(`📍 ${flyerData.lugar}`);
    if (flyerData.descripcion) lines.push(`\n${flyerData.descripcion}`);
    lines.push("\n_Gedeones GP · Ministerio de Caballeros_");

    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="min-h-screen" style={{ background: "#0f172a", color: "#e2e8f0" }}>
      {/* Page header */}
      <div className="border-b border-slate-700/60 px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className="rounded-lg p-2"
            style={{ background: "rgba(59,130,246,0.15)" }}
          >
            <ImageIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Generador de Flyers</h1>
            <p className="text-sm text-slate-400">
              Diseña y descarga flyers profesionales para eventos del ministerio
            </p>
          </div>
        </div>
      </div>

      {/* Main content: two-column layout */}
      <div className="flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-80px)]">
        {/* Left panel: form */}
        <div
          className="lg:w-[420px] flex-shrink-0 border-r border-slate-700/60 overflow-y-auto"
          style={{ background: "#0f172a" }}
        >
          <div className="p-5 space-y-6">
            {/* Event info fields */}
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Información del Evento
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Título del evento <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Retiro Espiritual 2025"
                    value={flyerData.titulo}
                    onChange={(e) => updateField("titulo", e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: "#1e293b", border: "1px solid #334155" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Fecha y hora <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Sábado 8 AM · 15 de junio 2025"
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
                    placeholder="Ej. Iglesia Central, Salón B"
                    value={flyerData.lugar}
                    onChange={(e) => updateField("lugar", e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: "#1e293b", border: "1px solid #334155" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    placeholder="Descripción adicional, oradores, instrucciones..."
                    value={flyerData.descripcion}
                    onChange={(e) => updateField("descripcion", e.target.value)}
                    rows={3}
                    className="w-full rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ background: "#1e293b", border: "1px solid #334155" }}
                  />
                </div>
              </div>
            </section>

            {/* Template selector */}
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Plantilla
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    tpl={tpl}
                    selected={flyerData.template === tpl.id}
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

            {/* Background color picker (only for templates that support it) */}
            {selectedTemplate.supportsBgColor && (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
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

            {/* Action buttons */}
            <section className="space-y-2 pb-2">
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
                {downloading ? "Exportando..." : "Descargar como PNG"}
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
                  Escribe el título del evento para habilitar la exportación
                </p>
              )}
            </section>
          </div>
        </div>

        {/* Right panel: live preview */}
        <div
          className="flex-1 flex items-center justify-center p-6"
          style={{ background: "#080f1e" }}
        >
          <div className="w-full max-w-[520px]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Vista previa en tiempo real
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ background: "#1e293b", color: "#94a3b8" }}
              >
                1080 × 1080 px
              </span>
            </div>

            <div
              className="rounded-xl overflow-hidden shadow-2xl"
              style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}
            >
              <FlyerPreview data={flyerData} flyerRef={flyerRef} />
            </div>

            <p className="mt-3 text-xs text-slate-600 text-center">
              El flyer se exporta a 1080×1080 px en formato PNG
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
