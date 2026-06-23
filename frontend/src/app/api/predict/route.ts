import { NextResponse } from "next/server";

import { predictWithHuggingFace } from "@/lib/huggingface-api";

// The Gradio client needs Node APIs; never run this on the Edge runtime.
export const runtime = "nodejs";
// Allow time for a sleeping Space to wake up and run inference.
export const maxDuration = 60;

export async function POST(request: Request) {
  const backendUrl =
    process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? process.env.AI_BACKEND_URL ?? "";

  if (!backendUrl) {
    return NextResponse.json(
      { error: "URL backend AI belum dikonfigurasi di server." },
      { status: 500 }
    );
  }

  let file: FormDataEntryValue | null;
  try {
    const formData = await request.formData();
    file = formData.get("file");
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Berkas gambar tidak ditemukan." }, { status: 400 });
  }

  try {
    // Runs server-to-server (no browser CORS), then returns the parsed result.
    const prediction = await predictWithHuggingFace(file, backendUrl);
    return NextResponse.json(prediction);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Backend AI gagal merespons.";
    console.error("[DentRay] /api/predict error:", error);
    return NextResponse.json({ error: detail }, { status: 502 });
  }
}
