import { NextRequest, NextResponse } from "next/server";

const CANVA_API_BASE = "https://api.canva.com/rest/v1";

function getCanvaHeaders() {
  const token = process.env.CANVA_API_TOKEN;
  if (!token) throw new Error("CANVA_API_TOKEN no configurado");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// Save a candidate design to the user's Canva account
export async function POST(request: NextRequest) {
  try {
    const { candidate_id, title } = await request.json();

    if (!candidate_id) {
      return NextResponse.json(
        { success: false, error: "candidate_id requerido" },
        { status: 400 }
      );
    }

    if (!process.env.CANVA_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: "CANVA_API_TOKEN no configurado", setup_required: true },
        { status: 503 }
      );
    }

    // Create design from candidate
    const response = await fetch(`${CANVA_API_BASE}/ai-content/v1/designs`, {
      method: "POST",
      headers: getCanvaHeaders(),
      body: JSON.stringify({
        candidate_id,
        title: title ?? "Flyer GEDEONES GP",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Canva save error:", response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Error al guardar: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      design: data.design,
      edit_url: data.design?.urls?.edit_url,
      view_url: data.design?.urls?.view_url,
    });
  } catch (error) {
    console.error("Error saving design:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
