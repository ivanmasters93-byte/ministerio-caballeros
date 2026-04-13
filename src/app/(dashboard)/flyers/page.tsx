"use client";

import { useState, useRef, useCallback, type ChangeEvent } from "react";
import {
  Sparkles,
  Download,
  Share2,
  ExternalLink,
  Wand2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  ImageIcon,
  Settings,
  Flame,
  Bus,
  Music,
  Heart,
  Star,
  Calendar,
  Zap,
  Upload,
  RotateCcw,
} from "lucide-react";
import * as htmlToImage from "html-to-image";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = "form" | "generating" | "results" | "preview";
type EventCategory =
  | "ayuno_oracion"
  | "culto"
  | "transporte"
  | "retiro"
  | "evento_especial"
  | "estudio_biblico"
  | "alabanza"
  | "evangelismo"
  | "revival"
  | "general";

type StyleOption = "dramatico" | "elegante" | "moderno" | "minimalista" | "festivo";

interface FlyerForm {
  titulo: string;
  subtitulo: string;
  categoria: EventCategory;
  fechaHora: string;
  lugar: string;
  descripcion: string;
  contacto: string;
  estilo: StyleOption;
}

interface GeneratedDesign {
  candidate_id: string;
  url: string;
  thumbnail: { url: string };
}

interface SavedDesign {
  edit_url?: string;
  view_url?: string;
}

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

const CATEGORIES: { id: EventCategory; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: "ayuno_oracion", label: "Ayuno y Oración", icon: <Flame className="h-4 w-4" />, color: "#16a34a", desc: "Ayuno, vigilia, intercesión" },
  { id: "culto", label: "Culto / Servicio", icon: <span>✝️</span>, color: "#7c3aed", desc: "Domingo, culto especial" },
  { id: "revival", label: "Revival / Avivamiento", icon: <Zap className="h-4 w-4" />, color: "#dc2626", desc: "Avivamiento, fuego del Espíritu" },
  { id: "transporte", label: "Transporte", icon: <Bus className="h-4 w-4" />, color: "#0369a1", desc: "Bus, excursión, salida grupal" },
  { id: "retiro", label: "Retiro", icon: <Star className="h-4 w-4" />, color: "#b45309", desc: "Retiro espiritual, campamento" },
  { id: "evento_especial", label: "Evento Especial", icon: <Sparkles className="h-4 w-4" />, color: "#be185d", desc: "Cumpleaños, aniversario, gala" },
  { id: "estudio_biblico", label: "Estudio Bíblico", icon: <span>📖</span>, color: "#1d4ed8", desc: "Clase bíblica, discipulado" },
  { id: "alabanza", label: "Alabanza / Worship", icon: <Music className="h-4 w-4" />, color: "#6d28d9", desc: "Concierto, noche de worship" },
  { id: "evangelismo", label: "Evangelismo", icon: <Heart className="h-4 w-4" />, color: "#be185d", desc: "Campaña, outreach, cruzada" },
  { id: "general", label: "Anuncio General", icon: <Calendar className="h-4 w-4" />, color: "#475569", desc: "Comunicado, aviso, otro" },
];

const STYLES: { id: StyleOption; label: string; desc: string; preview: string }[] = [
  { id: "dramatico", label: "Dramático", desc: "Oscuro, impactante, fuego", preview: "linear-gradient(135deg,#1a0000,#7f1d1d)" },
  { id: "elegante", label: "Elegante", desc: "Dorado, sofisticado", preview: "linear-gradient(135deg,#1a1208,#2c1f0a)" },
  { id: "moderno", label: "Moderno", desc: "Gradiente vibrante", preview: "linear-gradient(135deg,#1e3a8a,#7c3aed,#be185d)" },
  { id: "minimalista", label: "Minimalista", desc: "Limpio, blanco, simple", preview: "#f8fafc" },
  { id: "festivo", label: "Festivo", desc: "Cálido, celebración", preview: "linear-gradient(135deg,#7c2d12,#ea580c)" },
];

// ---------------------------------------------------------------------------
// Setup instructions component
// ---------------------------------------------------------------------------

function CanvaSetupBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="rounded-xl p-5 mb-6" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)" }}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-300 mb-1">Configura Canva para activar la IA</h3>
          <p className="text-sm text-slate-300 mb-3">
            Para generar flyers con IA directamente aquí, necesitas tu token de Canva.
          </p>
          <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside mb-3">
            <li>Ve a <a href="https://www.canva.com/developers/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">canva.com/developers</a></li>
            <li>Crea o accede a tu app de desarrollador</li>
            <li>Genera un <strong className="text-white">Personal Access Token</strong></li>
            <li>Agrega en <code className="bg-slate-800 px-1 rounded text-xs">.env.local</code>: <code className="bg-slate-800 px-1 rounded text-xs text-green-400">CANVA_API_TOKEN=tu_token</code></li>
            <li>Reinicia el servidor</li>
          </ol>
          <div className="flex gap-2">
            <a
              href="https://www.canva.com/developers/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}
            >
              <ExternalLink className="h-3 w-3" />
              Ir a Canva Developers
            </a>
            <button
              onClick={onDismiss}
              className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              style={{ border: "1px solid #334155" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Local preview (fallback)
// ---------------------------------------------------------------------------

type TemplateId = "dramatico" | "elegante" | "moderno" | "minimalista" | "festivo_culto" | "verde_espiritual";

const LOCAL_TEMPLATE_STYLES: Record<StyleOption, React.CSSProperties & { accent: string }> = {
  dramatico: {
    background: "linear-gradient(160deg, #1a0000 0%, #7f1d1d 25%, #991b1b 50%, #450a0a 100%)",
    color: "#fef2f2",
    fontFamily: "'Arial Black', 'Arial', sans-serif",
    accent: "#fbbf24",
  },
  elegante: {
    background: "linear-gradient(160deg, #1a1208 0%, #2c1f0a 50%, #1a1208 100%)",
    color: "#f5e6c8",
    fontFamily: "Georgia, 'Times New Roman', serif",
    accent: "#c9a84c",
  },
  moderno: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #be185d 100%)",
    color: "#ffffff",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    accent: "#ffffff",
  },
  minimalista: {
    background: "#f8fafc",
    color: "#1e293b",
    fontFamily: "'Arial', sans-serif",
    accent: "#1e293b",
  },
  festivo: {
    background: "linear-gradient(145deg, #7c2d12 0%, #c2410c 30%, #ea580c 65%, #b45309 100%)",
    color: "#fff7ed",
    fontFamily: "'Arial', sans-serif",
    accent: "#fde68a",
  },
};

interface LocalFlyerPreviewProps {
  form: FlyerForm;
  flyerRef: React.RefObject<HTMLDivElement | null>;
}

function LocalFlyerPreview({ form, flyerRef }: LocalFlyerPreviewProps) {
  const tplStyle = LOCAL_TEMPLATE_STYLES[form.estilo];
  const { accent, ...containerBase } = tplStyle;

  const container: React.CSSProperties = {
    ...containerBase,
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

  return (
    <div ref={flyerRef} style={container}>
      {/* Top */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1, width: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-gedeones.jpg"
          alt="Logo"
          style={{ width: "clamp(48px,10%,72px)", height: "clamp(48px,10%,72px)", objectFit: "cover", borderRadius: "50%", border: `2px solid ${accent}` }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <span style={{ fontSize: "clamp(0.6rem,1.4vw,0.8rem)", letterSpacing: "0.12em", color: accent, fontWeight: 600, textTransform: "uppercase" }}>
          GEDEONES GP · MINISTERIO DE CABALLEROS
        </span>
      </div>

      {/* Divider */}
      <div style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, height: "1px", width: "60%", margin: "0 auto", zIndex: 1 }} />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%", textAlign: "center", zIndex: 1, padding: "8px 0" }}>
        {form.subtitulo && (
          <p style={{ margin: 0, fontSize: "clamp(0.85rem,2vw,1.1rem)", color: accent, fontWeight: 300, letterSpacing: "0.1em" }}>
            {form.subtitulo}
          </p>
        )}
        <h1 style={{ margin: 0, fontSize: "clamp(2rem,5.5vw,3.5rem)", fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase", textShadow: `0 3px 12px rgba(0,0,0,0.4)` }}>
          {form.titulo || "TÍTULO DEL EVENTO"}
        </h1>
        {(form.fechaHora || form.lugar) && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
            {form.fechaHora && <p style={{ margin: 0, fontSize: "clamp(0.9rem,2vw,1.1rem)", fontWeight: 700, color: accent }}>📅 {form.fechaHora}</p>}
            {form.lugar && <p style={{ margin: 0, fontSize: "clamp(0.85rem,1.8vw,1rem)", opacity: 0.85, color: accent }}>📍 {form.lugar}</p>}
          </div>
        )}
        {form.descripcion && (
          <p style={{ margin: 0, fontSize: "clamp(0.8rem,1.8vw,1rem)", opacity: 0.85, maxWidth: "80%", lineHeight: 1.6 }}>{form.descripcion}</p>
        )}
        {form.contacto && (
          <p style={{ margin: 0, fontSize: "clamp(0.75rem,1.6vw,0.9rem)", opacity: 0.75 }}>📞 {form.contacto}</p>
        )}
      </div>

      {/* Divider */}
      <div style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, height: "1px", width: "60%", margin: "0 auto", zIndex: 1 }} />

      {/* Footer */}
      <div style={{ paddingTop: "12px", width: "100%", textAlign: "center", zIndex: 1, borderTop: `1px solid ${accent}40` }}>
        <p style={{ margin: 0, fontSize: "clamp(0.65rem,1.4vw,0.8rem)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accent }}>Gedeones GP</p>
        <p style={{ margin: 0, fontSize: "clamp(0.6rem,1.2vw,0.72rem)", opacity: 0.7 }}>Ministerio de Caballeros · Colón, Panamá</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function FlyersPage() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FlyerForm>({
    titulo: "",
    subtitulo: "",
    categoria: "culto",
    fechaHora: "",
    lugar: "",
    descripcion: "",
    contacto: "",
    estilo: "moderno",
  });
  const [generating, setGenerating] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState<GeneratedDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<GeneratedDesign | null>(null);
  const [savedDesign, setSavedDesign] = useState<SavedDesign | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  const update = useCallback(<K extends keyof FlyerForm>(k: K, v: FlyerForm[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  }, []);

  const selectedCategory = CATEGORIES.find((c) => c.id === form.categoria);

  async function handleGenerate() {
    if (!form.titulo.trim()) return;
    setGenerating(true);
    setError(null);
    setStep("generating");

    try {
      const res = await fetch("/api/flyers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.setup_required) {
        setShowSetup(true);
        setStep("form");
        return;
      }

      if (!data.success) {
        setError(data.error ?? "Error generando el flyer");
        setStep("form");
        return;
      }

      setGeneratedDesigns(data.designs ?? []);
      setStep("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
      setStep("form");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveDesign(design: GeneratedDesign) {
    setSaving(true);
    setSelectedDesign(design);

    try {
      const res = await fetch("/api/flyers/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: design.candidate_id, title: `${form.titulo} - GEDEONES GP` }),
      });
      const data = await res.json();

      if (data.success) {
        setSavedDesign(data);
      } else {
        setError(data.error ?? "Error guardando el diseño");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadLocal() {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(flyerRef.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
        style: { width: "1080px", height: "1080px" },
      });
      const link = document.createElement("a");
      link.download = `flyer-${form.titulo.replace(/\s+/g, "-").toLowerCase()}-gedeones.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("No se pudo exportar. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  function handleShareWhatsApp() {
    const lines = [];
    if (form.subtitulo) lines.push(`_${form.subtitulo}_`);
    lines.push(`*${form.titulo}*`);
    if (form.fechaHora) lines.push(`📅 ${form.fechaHora}`);
    if (form.lugar) lines.push(`📍 ${form.lugar}`);
    if (form.descripcion) lines.push(`\n${form.descripcion}`);
    if (form.contacto) lines.push(`\n📞 ${form.contacto}`);
    lines.push("\n_Gedeones GP · Ministerio de Caballeros_");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }

  function resetAll() {
    setStep("form");
    setGeneratedDesigns([]);
    setSelectedDesign(null);
    setSavedDesign(null);
    setError(null);
  }

  return (
    <div className="min-h-screen" style={{ background: "#0f172a", color: "#e2e8f0" }}>
      {/* Header */}
      <div className="border-b border-slate-700/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2" style={{ background: "rgba(124,58,237,0.15)" }}>
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Generador de Flyers IA</h1>
              <p className="text-sm text-slate-400">Crea flyers profesionales en segundos con inteligencia artificial</p>
            </div>
          </div>
          {step !== "form" && (
            <button onClick={resetAll} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Nuevo flyer
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Setup banner */}
        {showSetup && <CanvaSetupBanner onDismiss={() => setShowSetup(false)} />}

        {/* Error */}
        {error && (
          <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-300">{error}</p>
              <button onClick={() => setError(null)} className="text-xs text-slate-400 hover:text-white mt-1">Cerrar</button>
            </div>
          </div>
        )}

        {/* ======================== STEP: FORM ======================== */}
        {step === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: form */}
            <div className="space-y-5">
              {/* Category */}
              <div className="rounded-xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">¿Qué tipo de evento?</h2>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => update("categoria", cat.id)}
                      className={`flex items-start gap-2.5 rounded-lg p-2.5 text-left transition-all ${
                        form.categoria === cat.id ? "ring-2" : "hover:bg-slate-700/50"
                      }`}
                      style={{
                        background: form.categoria === cat.id ? `${cat.color}20` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${form.categoria === cat.id ? cat.color : "#334155"}`,
                        outlineColor: cat.color,
                      }}
                    >
                      <span style={{ color: cat.color, marginTop: "1px" }}>{cat.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-white leading-tight">{cat.label}</p>
                        <p className="text-xs text-slate-500 leading-tight mt-0.5">{cat.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Event details */}
              <div className="rounded-xl p-5 space-y-3" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Detalles del Evento</h2>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Título <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="Ej. AYUNO Y ORACIÓN · 7 DÍAS"
                    value={form.titulo}
                    onChange={(e) => update("titulo", e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "#0f172a", border: "1px solid #475569" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Subtítulo</label>
                  <input
                    type="text"
                    placeholder="Ej. Ministerio de Caballeros"
                    value={form.subtitulo}
                    onChange={(e) => update("subtitulo", e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "#0f172a", border: "1px solid #475569" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Fecha y hora</label>
                    <input
                      type="text"
                      placeholder="Ej. Domingo 10:00 AM"
                      value={form.fechaHora}
                      onChange={(e) => update("fechaHora", e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: "#0f172a", border: "1px solid #475569" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Lugar</label>
                    <input
                      type="text"
                      placeholder="Ej. 4 Altos, Colón"
                      value={form.lugar}
                      onChange={(e) => update("lugar", e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: "#0f172a", border: "1px solid #475569" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Descripción</label>
                  <textarea
                    placeholder="Oradores, detalles adicionales, instrucciones..."
                    value={form.descripcion}
                    onChange={(e) => update("descripcion", e.target.value)}
                    rows={2}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    style={{ background: "#0f172a", border: "1px solid #475569" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Contacto / Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. +507 6XXX-XXXX"
                    value={form.contacto}
                    onChange={(e) => update("contacto", e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "#0f172a", border: "1px solid #475569" }}
                  />
                </div>
              </div>

              {/* Style */}
              <div className="rounded-xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Estilo Visual</h2>
                <div className="flex gap-2 flex-wrap">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => update("estilo", s.id)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        form.estilo === s.id ? "ring-2 ring-purple-500" : "hover:border-slate-500"
                      }`}
                      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${form.estilo === s.id ? "#7c3aed" : "#334155"}` }}
                    >
                      <div className="rounded w-4 h-4 flex-shrink-0" style={{ background: s.preview }} />
                      <span className="text-white">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!form.titulo.trim() || generating}
                className="w-full flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: form.titulo.trim() ? "linear-gradient(135deg, #7c3aed, #2563eb)" : "#334155" }}
              >
                <Wand2 className="h-5 w-5" />
                Generar Flyer con IA
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Right: live preview */}
            <div className="flex flex-col gap-4">
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "#1e293b" }}>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vista previa</span>
                  <span className="text-xs text-slate-500">1080 × 1080 px</span>
                </div>
                <LocalFlyerPreview form={form} flyerRef={flyerRef} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadLocal}
                  disabled={!form.titulo.trim() || downloading}
                  className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
                >
                  <Download className="h-4 w-4" />
                  {downloading ? "Exportando..." : "Descargar PNG"}
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  disabled={!form.titulo.trim()}
                  className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
                >
                  <Share2 className="h-4 w-4" />
                  WhatsApp
                </button>
              </div>
              <div className="rounded-xl p-4" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <p className="text-xs text-purple-300 font-semibold mb-1">
                  <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                  Generación IA con Canva
                </p>
                <p className="text-xs text-slate-400">
                  Con el token de Canva configurado, el botón &ldquo;Generar con IA&rdquo; crea 4 versiones profesionales fotorrealistas como los flyers de tu grupo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================== STEP: GENERATING ======================== */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="rounded-2xl p-10 max-w-md" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
                  <Wand2 className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Generando tu flyer...</h2>
              <p className="text-slate-400 text-sm mb-4">
                La IA de Canva está creando 4 diseños profesionales para <strong className="text-white">&ldquo;{form.titulo}&rdquo;</strong>
              </p>
              <div className="space-y-2">
                {["Analizando el tipo de evento...", "Aplicando estilo visual...", "Generando variantes profesionales...", "Preparando miniaturas..."].map((txt, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                    <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: `${1.5 + i * 0.3}s` }} />
                    {txt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================== STEP: RESULTS ======================== */}
        {step === "results" && (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Elige tu diseño</h2>
                <p className="text-sm text-slate-400">La IA generó {generatedDesigns.length} variantes para &ldquo;{form.titulo}&rdquo;</p>
              </div>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-all hover:text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #334155" }}
              >
                <RefreshCw className="h-4 w-4" />
                Regenerar
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {generatedDesigns.map((design, i) => (
                <button
                  key={design.candidate_id}
                  onClick={() => setSelectedDesign(design)}
                  className={`rounded-xl overflow-hidden transition-all ${
                    selectedDesign?.candidate_id === design.candidate_id
                      ? "ring-4 ring-purple-500 scale-105"
                      : "hover:scale-102 hover:ring-2 hover:ring-slate-500"
                  }`}
                  style={{ border: "1px solid #334155" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={design.thumbnail.url}
                    alt={`Diseño ${i + 1}`}
                    className="w-full"
                    style={{ aspectRatio: "1/1", objectFit: "cover" }}
                  />
                  <div className="p-2 text-center" style={{ background: "#1e293b" }}>
                    <span className="text-xs font-semibold text-slate-300">Opción {i + 1}</span>
                    {selectedDesign?.candidate_id === design.candidate_id && (
                      <span className="ml-2 text-purple-400">
                        <CheckCircle className="h-3.5 w-3.5 inline" />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {selectedDesign && (
              <div className="rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.15))", border: "1px solid rgba(124,58,237,0.3)" }}>
                <div>
                  <p className="font-semibold text-white">Diseño seleccionado</p>
                  <p className="text-sm text-slate-400">Guárdalo en tu cuenta de Canva para editarlo o descárgalo directo</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleSaveDesign(selectedDesign)}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
                  >
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {saving ? "Guardando..." : "Guardar en Canva"}
                  </button>
                  <a
                    href={selectedDesign.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir en Canva
                  </a>
                </div>
              </div>
            )}

            {savedDesign && (
              <div className="mt-4 rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)" }}>
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-300">¡Guardado en tu cuenta de Canva!</p>
                  <p className="text-xs text-slate-400">Puedes editarlo y compartirlo desde Canva</p>
                </div>
                <div className="flex gap-2">
                  {savedDesign.edit_url && (
                    <a href={savedDesign.edit_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline">Editar</a>
                  )}
                  {savedDesign.view_url && (
                    <a href={savedDesign.view_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-white underline">Ver</a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
