import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Canva Connect API – Flyer Generation
// Docs: https://www.canva.com/developers/docs/connect/
// ---------------------------------------------------------------------------

const CANVA_API_BASE = "https://api.canva.com/rest/v1";

function getCanvaHeaders() {
  const token = process.env.CANVA_API_TOKEN;
  if (!token) throw new Error("CANVA_API_TOKEN no configurado");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// Build a detailed prompt for Canva AI based on the flyer data
function buildCanvaPrompt(data: {
  titulo: string;
  subtitulo?: string;
  categoria: string;
  fechaHora?: string;
  lugar?: string;
  descripcion?: string;
  contacto?: string;
  estilo?: string;
}): string {
  const categoryPrompts: Record<string, string> = {
    ayuno_oracion:
      "dark dramatic green background with spiritual light rays, cross symbol, flame effect, powerful fasting prayer church event",
    culto:
      "professional church service flyer, rich colors, cross or light rays, Sunday service announcement, megachurch style",
    transporte:
      "bold colorful free transportation announcement, bus event, dynamic blue design, community church event",
    retiro:
      "peaceful spiritual retreat announcement, mountain or nature imagery, deep blue and gold, reflective atmosphere",
    evento_especial:
      "special church celebration flyer, vibrant colors, festive atmosphere, dramatic lighting",
    estudio_biblico:
      "Bible study announcement, open Bible imagery, warm gold tones, educational spiritual design",
    alabanza:
      "worship and praise event, musical notes, vibrant purple and gold, energetic concert-style church design",
    evangelismo:
      "evangelism outreach flyer, warm welcoming colors, cross symbol, community invitation design",
    revival:
      "bold revival event flyer, red fire flames background, dramatic impact, REVIVAL text, powerful atmosphere",
    general:
      "professional church ministry flyer, clean design, cross or dove symbol, modern ecclesial aesthetic",
  };

  const categoryStyle = categoryPrompts[data.categoria] ?? categoryPrompts.general;
  const styleMap: Record<string, string> = {
    dramatico: "dramatic, high contrast, bold typography",
    elegante: "elegant, serif typography, gold accents, refined",
    moderno: "modern, sans-serif, gradient, contemporary",
    minimalista: "minimalist, clean, white space, simple",
    festivo: "festive, colorful, celebratory, warm tones",
  };
  const styleDesc = data.estilo ? styleMap[data.estilo] ?? "" : "";

  const parts: string[] = [
    `Professional church ministry flyer for GEDEONES GP - Ministerio de Caballeros, Colón, Panamá.`,
    `Event: "${data.titulo}"`,
  ];
  if (data.subtitulo) parts.push(`Subtitle: "${data.subtitulo}"`);
  if (data.fechaHora) parts.push(`Date/Time: ${data.fechaHora}`);
  if (data.lugar) parts.push(`Location: ${data.lugar}`);
  if (data.descripcion) parts.push(`Description: ${data.descripcion}`);
  if (data.contacto) parts.push(`Contact: ${data.contacto}`);
  parts.push(`Style: ${categoryStyle}. ${styleDesc}`);
  parts.push(
    `Include ministry branding: "GEDEONES GP" and "Ministerio de Caballeros". High quality, ready to share on WhatsApp. Spanish text.`
  );

  return parts.join(" ");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if Canva API token is configured
    if (!process.env.CANVA_API_TOKEN) {
      // Return mock data for development without the token
      return NextResponse.json({
        success: false,
        error: "CANVA_API_TOKEN no configurado",
        setup_required: true,
        setup_instructions: {
          steps: [
            "Ve a https://www.canva.com/developers/",
            "Crea una app o usa tu cuenta de desarrollador",
            "Genera un Personal Access Token",
            "Agrega CANVA_API_TOKEN=tu_token en el archivo .env.local",
            "Reinicia el servidor de desarrollo",
          ],
          env_var: "CANVA_API_TOKEN",
          docs_url: "https://www.canva.com/developers/docs/connect/authentication/",
        },
      });
    }

    const prompt = buildCanvaPrompt(body);

    // Call Canva's AI generation endpoint
    const response = await fetch(`${CANVA_API_BASE}/ai-content/v1/generate`, {
      method: "POST",
      headers: getCanvaHeaders(),
      body: JSON.stringify({
        query: prompt,
        design_type: "flyer",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Canva API error:", response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Canva API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      designs: data.job?.result?.generated_designs ?? [],
      job_id: data.job?.id,
    });
  } catch (error) {
    console.error("Error generating flyer:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check / status
  const hasToken = !!process.env.CANVA_API_TOKEN;
  return NextResponse.json({
    status: hasToken ? "ready" : "token_required",
    canva_configured: hasToken,
  });
}
